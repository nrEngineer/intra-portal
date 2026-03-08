import { Hono } from "hono";
import { eq, like, or, sql } from "drizzle-orm";
import { getDb } from "./db/connection.js";
import * as schema from "./db/schema.js";
import { authMiddleware, adminOnly } from "./middleware.js";
import type { User } from "./types.js";
import { randomUUID } from "crypto";

type Env = { Variables: { user: User } };
const employees = new Hono<Env>();
employees.use("/*", authMiddleware);

employees.get("/", async (c) => {
  const db = getDb();
  const search = c.req.query("search");
  const department = c.req.query("department");

  let data;
  if (search) {
    const q = `%${search.toLowerCase()}%`;
    data = await db
      .select()
      .from(schema.employees)
      .where(
        or(
          like(sql`lower(${schema.employees.name})`, q),
          like(sql`lower(${schema.employees.department})`, q),
          like(sql`lower(${schema.employees.position})`, q),
        ),
      );
  } else {
    data = await db.select().from(schema.employees);
  }

  if (department) {
    data = data.filter((e) => e.department === department);
  }

  return c.json({ data });
});

employees.get("/:id", async (c) => {
  const db = getDb();
  const emp = await db
    .select()
    .from(schema.employees)
    .where(eq(schema.employees.id, c.req.param("id")))
    .then((r) => r[0]);
  if (!emp) return c.json({ error: "Not found" }, 404);
  return c.json(emp);
});

employees.post("/", adminOnly, async (c) => {
  const db = getDb();
  const { userId, name, email, department, position, photoUrl, phone, joinedAt } = await c.req.json<{
    userId: string;
    name: string;
    email: string;
    department: string;
    position: string;
    photoUrl?: string;
    phone?: string;
    joinedAt: string;
  }>();
  const now = new Date().toISOString();
  const [emp] = await db
    .insert(schema.employees)
    .values({
      id: randomUUID(),
      userId,
      name,
      email,
      department,
      position,
      photoUrl: photoUrl || null,
      phone: phone || "",
      joinedAt,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return c.json(emp, 201);
});

employees.put("/:id", adminOnly, async (c) => {
  const db = getDb();
  const { name, email, department, position, phone, photoUrl, joinedAt } = await c.req.json<{
    name: string;
    email: string;
    department: string;
    position: string;
    phone?: string;
    photoUrl?: string;
    joinedAt: string;
  }>();
  const [emp] = await db
    .update(schema.employees)
    .set({ name, email, department, position, phone, photoUrl, joinedAt, updatedAt: new Date().toISOString() })
    .where(eq(schema.employees.id, c.req.param("id")))
    .returning();
  if (!emp) return c.json({ error: "Not found" }, 404);
  return c.json(emp);
});

employees.delete("/:id", adminOnly, async (c) => {
  const { id } = c.req.param();
  const db = getDb();
  const emp = await db.select().from(schema.employees).where(eq(schema.employees.id, id)).then(r => r[0]);
  if (!emp) return c.json({ error: "Not found" }, 404);
  await db.delete(schema.employees).where(eq(schema.employees.id, id));
  return c.body(null, 204);
});

export { employees };
