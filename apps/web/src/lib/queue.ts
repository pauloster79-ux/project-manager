// src/lib/queue.ts
// Use dynamic imports to prevent pg-boss from being bundled for client

let bossPromise: Promise<any> | null = null;

async function startBoss(): Promise<any> {
  if (process.env.WORKER_ENABLED === "false") return null;
  const conn = process.env.DATABASE_URL;
  if (!conn) return null;
  
  try {
    // Dynamic import to prevent bundling
    const PgBoss = (await import("pg-boss")).default;
    const schema = process.env.BOSS_SCHEMA || "boss";
    const boss = new PgBoss({ connectionString: conn, schema });
    await boss.start();
    return boss;
  } catch (error) {
    console.warn("Failed to start pg-boss:", error);
    return null;
  }
}

export async function enqueue(name: string, data: any) {
  if (!bossPromise) bossPromise = startBoss();
  const boss = await bossPromise;
  if (!boss) return false; // safe no-op
  try {
    await boss.publish(name, data, { singletonKey: JSON.stringify(data).slice(0, 120) });
    return true;
  } catch (error) {
    console.warn("Failed to enqueue job:", error);
    return false;
  }
}
