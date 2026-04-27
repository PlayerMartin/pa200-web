"use server";
import sql, { ConnectionPool } from "mssql";

let pool: ConnectionPool | null = null;

function getPool(): ConnectionPool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is missing!");
    }
    pool = new sql.ConnectionPool(process.env.DATABASE_URL!);
  }
  return pool;
}

async function getConnectedPool(): Promise<ConnectionPool> {
  const p = getPool();
  if (!p.connected && !p.connecting) await p.connect();
  return p;
}

const CREATE_TABLE_SQL = `
  IF NOT EXISTS (
    SELECT * FROM sysobjects WHERE name='entries' AND xtype='U'
  )
  CREATE TABLE entries (
    id        INT            IDENTITY(1,1) PRIMARY KEY,
    content   NVARCHAR(MAX)  NOT NULL,
    username  NVARCHAR(255)  NOT NULL,
    created_at DATETIME2     DEFAULT CURRENT_TIMESTAMP
  );
`;

export async function addString(formData: FormData) {
  const content = formData.get("content")?.toString();
  const username = formData.get("username")?.toString();

  if (!content || !username) return { error: "Missing fields" };

  try {
    const db = await getConnectedPool();
    await db.request().query(CREATE_TABLE_SQL);
    await db.request()
      .input("content", sql.NVarChar(sql.MAX), content)
      .input("username", sql.NVarChar(255), username)
      .query("INSERT INTO entries (content, username) VALUES (@content, @username)");
    return { success: true };
  } catch (error: any) {
    console.error("DB error:", error);
    return { error: error.message };
  }
}

export async function getStrings() {
  try {
    const db = await getConnectedPool();
    await db.request().query(CREATE_TABLE_SQL);
    const result = await db.request()
      .query("SELECT * FROM entries ORDER BY created_at DESC");
    return { data: result.recordset };
  } catch (error: any) {
    console.error("DB error fetching:", error);
    return { error: error.message };
  }
}