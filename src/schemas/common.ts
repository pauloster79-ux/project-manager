import { z } from "zod";

export const UUID = z.string().uuid();

export const ISO_DATE = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected ISO date (YYYY-MM-DD)");

export const ISO_DATETIME = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/,
    "Expected ISO datetime (e.g. 2025-09-26T10:11:12.000Z)"
  );

export const ValidationStatus = z.enum(["valid", "draft", "blocked"]);
