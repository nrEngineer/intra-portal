import { eq, like, or, sql } from "drizzle-orm";
import { getDb } from "../db/connection.js";
import * as schema from "../db/schema.js";
import { randomUUID } from "crypto";

interface EmployeeInput {
  userId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  photoUrl?: string;
  phone?: string;
  joinedAt: string;
}

export class EmployeeService {
  static async list(search?: string, department?: string) {
    const db = getDb();

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

    return data;
  }

  static async getById(id: string) {
    const db = getDb();
    return db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.id, id))
      .then((r) => r[0] ?? null);
  }

  static async create(data: EmployeeInput) {
    const db = getDb();
    const now = new Date().toISOString();
    const [emp] = await db
      .insert(schema.employees)
      .values({
        id: randomUUID(),
        userId: data.userId,
        name: data.name,
        email: data.email,
        department: data.department,
        position: data.position,
        photoUrl: data.photoUrl || null,
        phone: data.phone || "",
        joinedAt: data.joinedAt,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return emp;
  }

  static async update(id: string, data: Omit<EmployeeInput, "userId">) {
    const db = getDb();
    const [emp] = await db
      .update(schema.employees)
      .set({
        name: data.name,
        email: data.email,
        department: data.department,
        position: data.position,
        phone: data.phone,
        photoUrl: data.photoUrl,
        joinedAt: data.joinedAt,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.employees.id, id))
      .returning();
    return emp ?? null;
  }

  static async delete(id: string) {
    const db = getDb();
    const emp = await db.select().from(schema.employees).where(eq(schema.employees.id, id)).then((r) => r[0]);
    if (!emp) return false;
    await db.delete(schema.employees).where(eq(schema.employees.id, id));
    return true;
  }
}
