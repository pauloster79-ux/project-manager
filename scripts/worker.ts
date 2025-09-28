// scripts/worker.ts
import PgBoss from "pg-boss";
import { s3, getObjectText } from "@/src/lib/storage";
import { query } from "@/src/lib/db";
import { embed } from "@/src/lib/llm";
import { summarizeDecision, summarizeRisk } from "@/src/lib/retrieval";

const schema = process.env.BOSS_SCHEMA || "boss";

function chunkText(text: string, maxChars = 3500): string[] {
  const paras = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let buf = "";
  for (const p of paras) {
    if ((buf + "\n\n" + p).length > maxChars) {
      if (buf) chunks.push(buf.trim());
      buf = p;
    } else {
      buf = buf ? buf + "\n\n" + p : p;
    }
  }
  if (buf) chunks.push(buf.trim());
  return chunks.slice(0, 50); // cap
}

function toVectorParam(vec: number[]) {
  return `[${vec.map((x) => Number.isFinite(x) ? x.toFixed(6) : "0").join(",")}]`;
}

async function handleEmbedDocument(job: any) {
  const { attachment_id, project_id } = job.data || {};
  if (!attachment_id) return;

  const { rows } = await query(`select * from attachments where id = $1`, [attachment_id]);
  const att = rows[0];
  if (!att) return;

  try {
    const bytes = await getObjectText(att.storage_key);
    const text = decodeAsText(bytes, att.mime_type);
    const chunks = chunkText(text);
    if (!chunks.length) throw new Error("No text extracted");

    const vectors = await embed(chunks);
    // Remove old vectors for this attachment
    await query(`delete from vectors where source_type = 'attachment_chunk' and source_id = $1`, [attachment_id]);

    // Insert new vectors
    for (let i = 0; i < vectors.length; i++) {
      const v = toVectorParam(vectors[i]);
      await query(
        `insert into vectors (project_id, source_type, source_id, chunk_index, chunk_text, embedding, metadata)
         values ($1,'attachment_chunk',$2,$3,$4,$5::vector,$6)`,
        [project_id, attachment_id, i, chunks[i], v, { attachment_id, filename: att.filename }]
      );
    }

    await query(`update attachments set text_extract_status = 'ok' where id = $1`, [attachment_id]);
  } catch (e: any) {
    await query(`update attachments set text_extract_status = 'failed', error_log = $2 where id = $1`, [
      attachment_id,
      String(e?.message || e),
    ]);
  }
}

function decodeAsText(bytes: Uint8Array, mime?: string): string {
  const decoder = new TextDecoder("utf-8", { fatal: false });
  if (!mime) return decoder.decode(bytes);

  if (mime.startsWith("text/") || mime.includes("json") || mime.includes("markdown")) {
    return decoder.decode(bytes);
  }
  if (mime === "application/pdf") {
    // TODO: implement pdf text extraction (pdf-parse) in a future iteration
    return "[PDF extraction not yet implemented in MVP]";
  }
  return decoder.decode(bytes);
}

async function handleEmbedEntity(job: any) {
  const { project_id, entity_type, entity_id } = job.data || {};
  if (!project_id || !entity_type || !entity_id) return;

  let row: any;
  if (entity_type === "risk") {
    row = (await query(`select * from risks where id = $1`, [entity_id])).rows[0];
  } else if (entity_type === "decision") {
    row = (await query(`select * from decisions where id = $1`, [entity_id])).rows[0];
  }
  if (!row) return;

  const summary =
    entity_type === "risk" ? summarizeRisk(row) : summarizeDecision(row);
  const [vec] = await embed([summary]);

  await query(`delete from vectors where source_type = $1 and source_id = $2`, [entity_type, entity_id]);
  await query(
    `insert into vectors (project_id, source_type, source_id, chunk_index, chunk_text, embedding, metadata)
     values ($1,$2,$3,0,$4,$5::vector,$6)`,
    [project_id, entity_type, entity_id, summary, toVectorParam(vec), { entity_type, entity_id }]
  );
}

(async function main() {
  const boss = new PgBoss({ connectionString: process.env.DATABASE_URL!, schema });
  await boss.start();
  await boss.work("embed:document", { teamSize: Number(process.env.WORKER_CONCURRENCY || 4) }, handleEmbedDocument);
  await boss.work("embed:entity",   { teamSize: Number(process.env.WORKER_CONCURRENCY || 4) }, handleEmbedEntity);
  // eslint-disable-next-line no-console
  console.log("Worker started.");
})();
