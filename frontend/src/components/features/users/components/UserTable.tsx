import type { User } from "../../../../types/user";
import { ConfirmButton } from "../../../ui";

export const roleLabelMap: Record<string, string> = {
  admin: "管理者",
  editor: "エディター",
  member: "メンバー",
};

export const roleBadgeClass: Record<string, string> = {
  admin: "badge badge-accent",
  editor: "badge badge-info",
  member: "badge badge-default",
};

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onRoleChange: (userId: number, role: string) => void;
  onDelete: (user: User) => void;
}

export function UserTable({ users, isLoading, onRoleChange, onDelete }: UserTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span>読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="table-wrap animate-in stagger-1">
      <table className="table">
        <thead>
          <tr>
            <th>名前</th>
            <th>メール</th>
            <th>ロール</th>
            <th>作成日</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <div className="flex items-center gap-2">
                  <span className={roleBadgeClass[u.role] ?? "badge badge-default"}>
                    {roleLabelMap[u.role] ?? u.role}
                  </span>
                  <select
                    className="select"
                    style={{
                      width: "auto",
                      padding: "var(--sp-1) var(--sp-3)",
                      paddingRight: "var(--sp-8)",
                    }}
                    value={u.role}
                    onChange={(e) => onRoleChange(u.id, e.target.value)}
                  >
                    <option value="member">メンバー</option>
                    <option value="editor">エディター</option>
                    <option value="admin">管理者</option>
                  </select>
                </div>
              </td>
              <td>{new Date(u.createdAt).toLocaleDateString("ja-JP")}</td>
              <td>
                <ConfirmButton
                  label="削除"
                  confirmMessage={`${u.name} を削除しますか？`}
                  onConfirm={() => onDelete(u)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
