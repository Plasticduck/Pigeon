import { defineConfig } from "@prisma/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  earlyAccess: true,
  studio: {
    port: 5555
  },
  migrate: {
    adapter: async () => {
      const pool = new Pool({
        connectionString: process.env.NETLIFY_DATABASE_URL_UNPOOLED,
      });
      return new PrismaPg(pool);
    },
  },
});
