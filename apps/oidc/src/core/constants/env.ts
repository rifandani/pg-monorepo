import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const ENV = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    APP_TITLE: z.string().min(1),
    APP_URL: z.string().min(1),
    ISSUER: z.string().min(1),
  },
  runtimeEnv: process.env,
});
