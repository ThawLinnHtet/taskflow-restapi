import { execSync } from "child_process";
import dotenv from "dotenv";

const setup = async () => {
  dotenv.config({ path: ".env.test" });

  process.env.DATABASE_URL = process.env.DATABASE_URL;
  process.env.NODE_ENV = "test";

  try {
    execSync("npx prisma migrate deploy", {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: "pipe",
    });
    console.log("[globalSetup] Test database migrated");
  } catch (e: any) {
    console.log("[globalSetup] Migration output:", e.stdout?.toString() || e.message);
  }
};

export default setup;
