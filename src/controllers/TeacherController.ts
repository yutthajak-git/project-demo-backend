import { Elysia, t } from "elysia";
import { PrismaClient } from "../../generated/prisma/client";

const prisma = new PrismaClient();

export const TeacherController = new Elysia().group("/teacher", (app) =>
    app
        // --- Group: Teacher (สำหรับอาจารย์) ---

        // 1. Get Pending Forms (รายการรอตรวจ)
        .get("/pending-forms/:teacherId", async ({ params }) => {
            try {
                const data = await prisma.internshipForm.findMany({
                    where: {
                        status: "SUBMITTED",
                        assignedTeacherId: params.teacherId,
                    },
                    include: {
                        student: true,
                    },
                    orderBy: {
                        createdAt: "desc", // เก่าสุดขึ้นก่อน หรือ ใหม่สุดขึ้นก่อน ตามสะดวก
                    },
                });
                return { success: true, data };
            } catch (error) {
                console.error("Error fetching pending forms:", error);
                return { success: false, message: "Failed to fetch forms" };
            }
        })

        // 2. Get History Forms (ประวัติการตรวจ - ที่ตรวจแล้ว) -> *เพิ่มใหม่*
        .get("/history-forms/:teacherId", async ({ params }) => {
            try {
                const data = await prisma.internshipForm.findMany({
                    where: {
                        status: "GRADED", // ดึงเฉพาะที่ตรวจแล้ว
                        assignedTeacherId: params.teacherId,
                    },
                    include: {
                        student: true,
                        evaluations: true, // *สำคัญ* Join เอาผลคะแนนมาแสดงด้วย (ชื่อ Relation ใน schema ต้องตรงกัน)
                    },
                    orderBy: {
                        updatedAt: "desc", // เรียงตามเวลาที่ตรวจล่าสุด
                    },
                });
                return { success: true, data };
            } catch (error) {
                console.error("Error fetching history forms:", error);
                return { success: false, message: "Failed to fetch history" };
            }
        })

        // 3. Evaluate (ให้คะแนน)
        .post(
            "/evaluate",
            async ({ body }) => {
                const { formId, teacherId, score, feedback } = body;

                try {
                    // 3.1 บันทึกผลการประเมิน
                    const evaluation = await prisma.evaluation.create({
                        data: {
                            formId,
                            teacherId,
                            score,
                            feedback,
                        },
                    });

                    // 3.2 อัปเดตสถานะ Form เป็น GRADED
                    await prisma.internshipForm.update({
                        where: { id: formId },
                        data: {
                            status: "GRADED",
                            updatedAt: new Date(), // อัปเดตเวลาล่าสุด
                        },
                    });

                    return { success: true, evaluation };
                } catch (error) {
                    console.error("Evaluation error:", error);
                    throw new Error("Evaluation failed");
                }
            },
            {
                body: t.Object({
                    formId: t.String(),
                    teacherId: t.String(),
                    score: t.Number(),
                    feedback: t.Optional(t.String()),
                }),
            }
        )
);
