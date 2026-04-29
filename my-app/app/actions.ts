"use server";
import sql, { ConnectionPool } from "mssql";
import { DefaultAzureCredential } from "@azure/identity";

let pool: ConnectionPool | null = null;

async function getConnectedPool(): Promise<ConnectionPool> {
  if (pool?.connected) return pool;
  if (pool) { 
    try { 
      await pool.close(); 
    } catch {
    } 
    pool = null; 
  }

  const credential = new DefaultAzureCredential();
  const { token } = await credential.getToken(
    "https://database.windows.net/.default"
  );

  pool = new sql.ConnectionPool({
    server: "myapp-sqlserver.database.windows.net",
    database: "myappdb",
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
    authentication: {
      type: "azure-active-directory-access-token",
      options: { token },
    },
  });

  await pool.connect();
  return pool;
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