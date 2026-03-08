import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  phone?: string;
  joinDate: string;
}

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (department) params.set("department", department);

    api<{ data: Employee[] }>(`/employees?${params.toString()}`).then((res) => {
      setEmployees(res.data);
      if (!departments.length) {
        const depts = [...new Set(res.data.map((e) => e.department))].sort();
        setDepartments(depts);
      }
    });
  }, [search, department]);

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>社員名簿</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="名前・部署・役職で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4, flex: 1 }}
        />
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4 }}
        >
          <option value="">全部署</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {employees.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>社員が見つかりません</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>名前</th>
                <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>部署</th>
                <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>役職</th>
                <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>メール</th>
                <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>電話</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: 12 }}>{e.name}</td>
                  <td style={{ padding: 12, color: "#64748b" }}>{e.department}</td>
                  <td style={{ padding: 12, color: "#64748b" }}>{e.position}</td>
                  <td style={{ padding: 12 }}>
                    <a href={`mailto:${e.email}`} style={{ color: "#3b82f6" }}>{e.email}</a>
                  </td>
                  <td style={{ padding: 12, color: "#64748b" }}>{e.phone || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
