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

### Server Action
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
```

### Client form using action
```tsx
"use client";
import { useTransition } from "react";
import { updateItem } from "./actions";

export function EditForm({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <form action={(formData) => start(() => updateItem(Object.fromEntries(formData)))}>
      <input name="id" defaultValue={id} hidden />
      <input name="name" defaultValue={name} />
      <button disabled={pending}>{pending ? "Saving..." : "Save"}</button>
    </form>
  );
}
```

### Do / Don’t

- ✅ Prefer RSC + Server Actions + Zod
- ✅ Colocate UI/state near components
- ✅ Use `metadata` export for SEO
- ❌ Don’t import server-only modules into Client Components
- ❌ Don’t use `pages/` directory
- ❌ Avoid ad‑hoc fetch chains in clients when data can be loaded on the server