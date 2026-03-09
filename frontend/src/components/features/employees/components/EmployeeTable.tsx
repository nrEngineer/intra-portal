import type { Employee } from "../../../../types/employee";

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  isAdmin: boolean;
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
}

export function EmployeeTable({
  employees,
  isLoading,
  isAdmin,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  if (isLoading) {
    return <div className="empty-state animate-in stagger-2">読み込み中...</div>;
  }

  if (employees.length === 0) {
    return <div className="empty-state animate-in stagger-2">社員が見つかりません</div>;
  }

  return (
    <div className="table-wrap animate-in stagger-2">
      <table className="table">
        <thead>
          <tr>
            <th>名前</th>
            <th>部署</th>
            <th>役職</th>
            <th>メール</th>
            <th>電話</th>
            {isAdmin && <th>操作</th>}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.department}</td>
              <td>{emp.position}</td>
              <td>
                <a href={`mailto:${emp.email}`} style={{ color: "var(--c-info)" }}>
                  {emp.email}
                </a>
              </td>
              <td>{emp.phone || "-"}</td>
              {isAdmin && (
                <td>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-warn"
                      onClick={() => onEdit(emp)}
                    >
                      編集
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete(emp)}
                    >
                      削除
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
