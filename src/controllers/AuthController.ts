import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { PrismaClient } from "../../generated/prisma/client";

// Initialize Prisma
const prisma = new PrismaClient();

// JWT Secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

export const AuthController = new Elysia()
    // Add JWT plugin
    .use(
        jwt({
            name: "jwt",
            secret: JWT_SECRET,
        })
    )

    // --- Group: Auth ---
    .group("/auth", (app) =>
        app
            // 1. Login
            .post(
                "/login",
                async ({ body, jwt, set }) => {
                    const user = await prisma.user.findUnique({
                        where: { username: body.username },
                    });

                    // 1. เช็ค Username / Password
                    if (!user || user.password !== body.password) {
                        set.status = 401; // Unauthorized
                        throw new Error("Invalid credentials");
                    }

                    // 2. ✅ (NEW) เช็ค Role: ถ้ามีการระบุ role มาใน body ต้องตรวจสอบว่าตรงกันไหม
                    // กรณีนี้หน้า StudentLogin จะส่ง role: 'STUDENT' มา
                    // ถ้า user.role เป็น 'TEACHER' จะเข้าเงื่อนไขนี้และถูกดีดออก
                    if (body.role && user.role !== body.role) {
                        set.status = 403; // Forbidden
                        throw new Error(`Access Denied: You cannot login as ${body.role}`);
                    }

                    // Generate JWT token with user information
                    const token = await jwt.sign({
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        role: user.role,
                    });

                    return {
                        success: true,
                        token,
                        user: {
                            id: user.id,
                            username: user.username,
                            name: user.name,
                            role: user.role,
                        },
                    };
                },
                {
                    body: t.Object({
                        username: t.String(),
                        password: t.String(),
                        // เพิ่ม field role เป็น optional (ถ้าไม่ส่งมาก็ login ได้ปกติ แต่ถ้าส่งมาจะถูก validate)
                        role: t.Optional(t.String()),
                    }),
                }
            )

            // 2. Register (สร้าง User ใหม่ พร้อมระบุ Role)
            .post(
                "/register",
                async ({ body }) => {
                    // เช็คก่อนว่า username ซ้ำไหม
                    const existingUser = await prisma.user.findUnique({
                        where: { username: body.username },
                    });

                    if (existingUser) {
                        throw new Error("Username already exists");
                    }

                    // สร้าง User ใหม่
                    const newUser = await prisma.user.create({
                        data: {
                            username: body.username,
                            password: body.password, // ในงานจริงควร Hash
                            name: body.name,
                            role: body.role, // รับค่า Role มาจาก body
                        },
                    });

                    return { success: true, user: newUser };
                },
                {
                    body: t.Object({
                        username: t.String(),
                        password: t.String(),
                        name: t.String(),
                        // Validate Role: ต้องเป็น 'STUDENT' หรือ 'TEACHER' เท่านั้น
                        role: t.Union([
                            t.Literal("STUDENT"),
                            t.Literal("TEACHER"),
                        ]),
                    }),
                }
            )
            //get studentInfo
            .get("/studentInfo", async () => {
                const studentInfo = await prisma.user.findMany({
                    where: {
                        role: "STUDENT",
                    },
                });
                return { studentInfo };
            })

            //get TeacherInfo
            .get("/teacherInfo", async () => {
                const teacherInfo = await prisma.user.findMany({
                    where: {
                        role: "TEACHER",
                    },
                });
                return { teacherInfo };
            })

            //get all
            .get("/allUsersInfo", async () => {
                const info = await prisma.user.findMany();
                return { info };
            })

            // 3. Get Teachers List
            .get("/teachers", async () => {
                return await prisma.user.findMany({
                    where: { role: "TEACHER" },
                    select: { id: true, name: true, username: true },
                });
            })
            .delete("/remove/:id", async ({ params }) => {

                try {
                    const removeId = await prisma.user.delete({
                        where: {
                            id: params.id
                        }

                    })
                    return { message: "suscess removeId ", removeId }
                } catch (error) {
                    return error
                }
            })

            // 4. Verify Token / Get Current User Info
            .get("/verify", async ({ headers, jwt }) => {
                return await verifyToken(headers, jwt);
            }, {
                detail: {
                    description: "Verify JWT token and return user information",
                    tags: ["Auth"],
                },
            })

            // 5. Get Current User Info (alias for /verify)
            .get("/me", async ({ headers, jwt }) => {
                return await verifyToken(headers, jwt);
            }, {
                detail: {
                    description: "Get current authenticated user information",
                    tags: ["Auth"],
                },
            })
    )

// Helper function to verify JWT token and return user info
async function verifyToken(headers: Record<string, string | undefined>, jwt: any) {
    const authorization = headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        throw new Error("No token provided");
    }

    const token = authorization.substring(7); // Remove "Bearer " prefix

    try {
        const payload = await jwt.verify(token);

        if (!payload) {
            throw new Error("Invalid or expired token");
        }

        // Return user information from token
        return {
            success: true,
            user: {
                id: payload.id,
                username: payload.username,
                name: payload.name,
                role: payload.role,
            },
        };
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
}