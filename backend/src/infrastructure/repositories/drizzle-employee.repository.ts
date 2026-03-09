import { eq, like, or, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../../db/schema.js";
import type { EmployeeRepository } from "../../application/ports/repositories/employee.repository.js";
import type { Employee } from "../../domain/models/employee.js";

type AppDatabase = LibSQLDatabase<Record<string, never>>;

export class DrizzleEmployeeRepository implements EmployeeRepository {
  constructor(private readonly db: AppDatabase) {}

  async findAll(search?: string, department?: string): Promise<Employee[]> {
    let data;

    if (search) {
      const q = `%${search.toLowerCase()}%`;
      data = await this.db
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
      data = await this.db.select().from(schema.employees);
    }

    if (department) {
      data = data.filter((e) => e.department === department);
    }

    return data.map((e) => ({
      id: e.id,
      userId: e.userId ?? "",
      name: e.name,
      email: e.email,
      department: e.department,
      position: e.position,
      photoUrl: e.photoUrl ?? null,
      phone: e.phone,
      joinedAt: e.joinedAt,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));
  }

  async findById(id: string): Promise<Employee | null> {
    const result = await this.db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.id, id));
    const e = result[0];
    if (!e) return null;
    return {
      id: e.id,
      userId: e.userId ?? "",
      name: e.name,
      email: e.email,
      department: e.department,
      position: e.position,
      photoUrl: e.photoUrl ?? null,
      phone: e.phone,
      joinedAt: e.joinedAt,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  async create(data: Employee): Promise<Employee> {
    const [emp] = await this.db
      .insert(schema.employees)
      .values({
        id: data.id,
        userId: data.userId || null,
        name: data.name,
        email: data.email,
        department: data.department,
        position: data.position,
        photoUrl: data.photoUrl ?? null,
        phone: data.phone,
        joinedAt: data.joinedAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .returning();
    return {
      id: emp.id,
      userId: emp.userId ?? "",
      name: emp.name,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      photoUrl: emp.photoUrl ?? null,
      phone: emp.phone,
      joinedAt: emp.joinedAt,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt,
    };
  }

  async update(
    id: string,
    data: Omit<Employee, "id" | "userId" | "createdAt">,
  ): Promise<Employee | null> {
    const [emp] = await this.db
      .update(schema.employees)
      .set({
        name: data.name,
        email: data.email,
        department: data.department,
        position: data.position,
        phone: data.phone,
        photoUrl: data.photoUrl ?? null,
        joinedAt: data.joinedAt,
        updatedAt: data.updatedAt,
      })
      .where(eq(schema.employees.id, id))
      .returning();
    if (!emp) return null;
    return {
      id: emp.id,
      userId: emp.userId ?? "",
      name: emp.name,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      photoUrl: emp.photoUrl ?? null,
      phone: emp.phone,
      joinedAt: emp.joinedAt,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt,
    };
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.id, id))
      .then((r) => r[0]);
    if (!existing) return false;
    await this.db.delete(schema.employees).where(eq(schema.employees.id, id));
    return true;
  }
}
