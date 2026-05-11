import { createClient } from "@libsql/client";

export async function migrate(url?: string, authToken?: string) {
  const client = createClient({
    url: url || process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: authToken || process.env.TURSO_AUTH_TOKEN,
  });

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS processes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'GENERAL',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS process_tags (
      process_id INTEGER NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (process_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      process_id INTEGER NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      process_id INTEGER NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS frameworks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS risk_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      effects TEXT,
      phases TEXT NOT NULL,
      tags TEXT,
      notes TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS attendee_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      is_optional INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT,
      location TEXT,
      facilitator TEXT,
      attendees TEXT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Idempotent ALTER for adding tags column to existing risk_items tables.
  try {
    await client.execute("ALTER TABLE risk_items ADD COLUMN tags TEXT");
  } catch {
    // Column already exists — safe to ignore.
  }

  // Idempotent ALTER for adding framework_id column.
  try {
    await client.execute(
      "ALTER TABLE risk_items ADD COLUMN framework_id INTEGER REFERENCES frameworks(id) ON DELETE CASCADE"
    );
  } catch {
    // Column already exists — safe to ignore.
  }

  // Ensure a default framework exists ("BHS (Turnkey) Integrator")
  // and back-fill any risk_items missing a framework_id.
  const now = new Date().toISOString();
  const existing = await client.execute("SELECT id, name FROM frameworks LIMIT 1");
  let defaultId: number;
  if (existing.rows.length === 0) {
    const insert = await client.execute({
      sql: "INSERT INTO frameworks (name, description, sort_order, created_at, updated_at) VALUES (?, ?, 0, ?, ?) RETURNING id",
      args: [
        "BHS (Turnkey) Integrator",
        "Baggage handling system turnkey integration — the original IS framework.",
        now,
        now,
      ],
    });
    defaultId = Number(insert.rows[0].id);
  } else {
    defaultId = Number(existing.rows[0].id);
  }
  await client.execute({
    sql: "UPDATE risk_items SET framework_id = ? WHERE framework_id IS NULL",
    args: [defaultId],
  });

  console.log("Migration complete");
}
