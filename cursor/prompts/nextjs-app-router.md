---
description: Rules for Next.js App Router project (server actions, RSC, edge-safe code)
globs: "**/*.{ts,tsx,js,jsx}"
---

## Next.js App Router (app/) — Hard Rules

- Use **App Router** (`app/`), **Server Components by default**, Client Components only when needed (`"use client"` on top).
- Prefer **Server Actions** over ad-hoc API routes for form mutations. Validate with Zod.
- Put reusable server logic in `app/(lib)/` or `lib/` using **pure functions**. Keep them **edge‑safe** (no Node‑only APIs unless runtime: node).
- File conventions:
  - Pages: `app/(routes)/segment/page.tsx`
  - Layout: `layout.tsx` per segment
  - Loading/UI states: `loading.tsx`, `error.tsx`
  - Route handlers only if needed: `app/api/{resource}/route.ts`
- Use `cache`, `revalidate`, `fetch({ cache, next: { revalidate } })` deliberately. Default is **RSC with SSR**.

### Patterns

- **Server Action**
```ts
"use server";
import { z } from "zod";
import { pg } from "@/lib/db";

const Input = z.object({ id: z.string().uuid(), name: z.string().min(1) });

export async function updateItem(raw: unknown) {
  const input = Input.parse(raw);
  await pg`update items set name=${input.name} where id=${input.id}`;
  return { ok: true };
}
