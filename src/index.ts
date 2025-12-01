import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { TeacherController } from "./controllers/TeacherController";
import { FormController } from "./controllers/FormController";
import { AuthController } from "./controllers/AuthController";

const app = new Elysia()

    //use cors
    .use(cors())
    //static
    .use(staticPlugin())

    //use Controllers
    .use(TeacherController)
    .use(FormController)
    .use(AuthController)
    .get("/", () => "Hello Elysia")

    .listen(3005);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
