// src/lib/queue.ts
import PgBoss from "pg-boss";

let bossPromise: Promise<PgBoss | null> | null = null;

async function startBoss(): Promise<PgBoss | null> {
  if (process.env.WORKER_ENABLED === "false") return null;
  const conn = process.env.DATABASE_URL;
  if (!conn) return null;
  const schema = process.env.BOSS_SCHEMA || "boss";
  const boss = new PgBoss({ connectionString: conn, schema });
  await boss.start().catch(() => null);
  return boss.isStarted ? boss : null;
}

export async function enqueue(name: string, data: any) {
  if (!bossPromise) bossPromise = startBoss();
  const boss = await bossPromise;
  if (!boss) return false; // safe no-op
  await boss.publish(name, data, { singletonKey: JSON.stringify(data).slice(0, 120) }).catch(() => {});
  return true;
}
