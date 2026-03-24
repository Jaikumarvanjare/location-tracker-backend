import { env } from "./config/env";
import { buildApp } from "./app";

const PORT = env.PORT;

async function start() {
  const app = await buildApp();
  app.get("/", async (request, reply) => {
    return {
      message: "🚀 Server is running",
      docs: "/docs",
    };
  });
  await app.listen({ port: PORT, host: "0.0.0.0" });

  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📘 Swagger → http://localhost:${PORT}/docs`);
}

start();
