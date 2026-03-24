import 'dotenv/config';
import { buildApp } from './app';

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  const app = await buildApp();
  await app.listen({ port: PORT });

  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📘 Swagger → http://localhost:${PORT}/docs`);
}

start();