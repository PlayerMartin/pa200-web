"use server";

import { Pool } from "pg";

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is missing!");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return pool;
}

export async function addString(formData: FormData) {
  const content = formData.get("content")?.toString();
  const username = formData.get("username")?.toString();

  if (!content || !username) {
    return { error: "Missing fields" };
  }

  const db = getPool();

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        username VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(
      "INSERT INTO entries (content, username) VALUES ($1, $2)",
      [content, username]
    );

    return { success: true };
  } catch (error: any) {
    console.error("DB error:", error);
    return { error: error.message };
  }
}

export async function getStrings() {
  const db = getPool();

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        username VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const { rows } = await db.query("SELECT * FROM entries ORDER BY created_at DESC");
    return { data: rows };
  } catch (error: any) {
    console.error("DB error fetching:", error);
    return { error: error.message };
  }
}
