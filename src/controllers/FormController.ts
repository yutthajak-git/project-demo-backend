import { Elysia, t } from "elysia";
import { PrismaClient } from "../../generated/prisma/client";
const prisma = new PrismaClient()

// --- Group: Forms (สำหรับนักศึกษา) ---
export const FormController = new Elysia().group('/forms', (app) => app// 1. Save Draft / Create Form
    .post(
        "/save-draft",
        async ({ body }) => {
            const { studentId, ...formData } = body;

            const existingDraft = await prisma.internshipForm.findFirst({
                where: { studentId, status: "DRAFT" },
            });

            if (existingDraft) {
                return await prisma.internshipForm.update({
                    where: { id: existingDraft.id },
                    data: { ...formData, updatedAt: new Date() },
                });
            } else {
                return await prisma.internshipForm.create({
                    data: { ...formData, studentId, status: "DRAFT" },
                });
            }
        },
        {
            body: t.Object({
                studentId: t.String(),
                assignedTeacherId: t.Optional(t.String()), // รับ ID อาจารย์ที่เลือก

                // ส่วนที่ 1
                studentCode: t.Optional(t.String()),
                idCard: t.Optional(t.String()),
                prefix: t.Optional(t.String()),
                firstName: t.Optional(t.String()),
                lastName: t.Optional(t.String()),
                major: t.Optional(t.String()),
                email: t.Optional(t.String()),
                phone: t.Optional(t.String()),

                // ส่วนที่ 2
                schoolName: t.Optional(t.String()),
                province: t.Optional(t.String()),
                district: t.Optional(t.String()),
                affiliation: t.Optional(t.String()),
                schoolSize: t.Optional(t.String()),

                // ส่วนที่ 3
                subjectGroup: t.Optional(t.String()),
                subjectName: t.Optional(t.String()),
                majorRelation: t.Optional(t.String()),
            }),
        }
    )

    // 2. Submit Form
    .post(
        "/:id/submit",
        async ({ params, body }) => {
            // บังคับให้ต้องเลือกอาจารย์ก่อนกดส่ง
            return await prisma.internshipForm.update({
                where: { id: params.id },
                data: {
                    status: "SUBMITTED",
                    // อัปเดตอาจารย์อีกรอบเพื่อความชัวร์ หรือถ้าส่งมาตอน draft แล้วก็ไม่ต้อง
                    ...(body.assignedTeacherId
                        ? { assignedTeacherId: body.assignedTeacherId }
                        : {}),
                },
            });
        },
        {
            body: t.Object({
                assignedTeacherId: t.Optional(t.String()),
            }),
        }
    )

    // 3. Get My Forms
    .get("/my-forms/:studentId", async ({ params }) => {
        return await prisma.internshipForm.findMany({
            where: { studentId: params.studentId },
            include: { assignedTeacher: true }, // ดึงชื่ออาจารย์ที่เลือกมาแสดงด้วย
        });
    })
)