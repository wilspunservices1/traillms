import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as schema from "./schemas";

// Load environment variables
config({ path: ".env.local" });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not defined in the environment variables");
  throw new Error("DATABASE_URL is not defined in the environment variables");
}

// Configure Neon to use `fetch` instead of WebSockets (best for serverless)
neonConfig.fetchConnectionCache = true;

// Create a Neon database connection
const sql = neon(dbUrl); // This is now the correct query function

// Initialize Drizzle with the correct Neon connection
export const db = drizzle(sql, { schema });

console.log("Database connected successfully");
