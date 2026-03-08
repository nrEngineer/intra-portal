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
  const body = await c.req.json();
  const now = new Date().toISOString();
  const [emp] = await db
    .insert(schema.employees)
    .values({
      id: randomUUID(),
      userId: body.userId,
      name: body.name,
      email: body.email,
      department: body.department,
      position: body.position,
      photoUrl: body.photoUrl || null,
      phone: body.phone || "",
      joinedAt: body.joinedAt,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return c.json(emp, 201);
});

employees.put("/:id", adminOnly, async (c) => {
  const db = getDb();
  const body = await c.req.json();
  const [emp] = await db
    .update(schema.employees)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(schema.employees.id, c.req.param("id")))
    .returning();
  if (!emp) return c.json({ error: "Not found" }, 404);
  return c.json(emp);
});

export { employees };
