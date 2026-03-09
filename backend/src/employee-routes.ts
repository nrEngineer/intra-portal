import { Hono } from "hono";
import { authMiddleware, adminOnly } from "./middleware.js";
import type { HonoEnv } from "./types.js";
import { EmployeeService } from "./services/employee.service.js";

const employees = new Hono<HonoEnv>();
employees.use("/*", authMiddleware);

employees.get("/", async (c) => {
  const data = await EmployeeService.list(c.req.query("search"), c.req.query("department"));
  return c.json({ data });
});

employees.get("/:id", async (c) => {
  const emp = await EmployeeService.getById(c.req.param("id"));
  if (!emp) return c.json({ error: "Not found" }, 404);
  return c.json(emp);
});

employees.post("/", adminOnly, async (c) => {
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
  const emp = await EmployeeService.create({ userId, name, email, department, position, photoUrl, phone, joinedAt });
  return c.json(emp, 201);
});

employees.put("/:id", adminOnly, async (c) => {
  const { name, email, department, position, phone, photoUrl, joinedAt } = await c.req.json<{
    name: string;
    email: string;
    department: string;
    position: string;
    phone?: string;
    photoUrl?: string;
    joinedAt: string;
  }>();
  const emp = await EmployeeService.update(c.req.param("id"), { name, email, department, position, phone, photoUrl, joinedAt });
  if (!emp) return c.json({ error: "Not found" }, 404);
  return c.json(emp);
});

employees.delete("/:id", adminOnly, async (c) => {
  const deleted = await EmployeeService.delete(c.req.param("id"));
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.body(null, 204);
});

export { employees };
