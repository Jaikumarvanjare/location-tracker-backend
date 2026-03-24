import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.string().url({ message: "Must be a valid Postgres connection URL" }),
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(z.treeifyError(_env.error));
  process.exit(1);
}

export const env = _env.data;