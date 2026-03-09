import type { Team } from "../../../../types/schedule";

interface TeamPanelProps {
  teams: Team[];
  teamName: string;
  editingId: number | null;
  isFormOpen: boolean;
  onTeamNameChange: (name: string) => void;
  onOpenNew: () => void;
  onEdit: (team: { id: number; name: string }) => void;
  onDelete: (id: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function TeamPanel({
  teams,
  teamName,
  editingId,
  isFormOpen,
  onTeamNameChange,
  onOpenNew,
  onEdit,
  onDelete,
  onSubmit,
  onCancel,
}: TeamPanelProps) {
  const handleDelete = (id: number) => {
    if (!confirm("このチームを削除しますか？")) return;
    onDelete(id);
  };

  return (
    <div className="mt-6 animate-in stagger-2" style={{ marginTop: "var(--sp-10)" }}>
      <p className="section-title">チーム管理</p>
      <div className="card card-body">
        <div className="table-wrap" style={{ marginBottom: "var(--sp-4)" }}>
          <table className="table">
            <thead>
              <tr>
                <th>チーム名</th>
                <th style={{ textAlign: "right" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td style={{ textAlign: "right" }}>
                    <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                      <button
                        className="btn btn-sm btn-warn"
                        onClick={() => onEdit(t)}
                      >
                        編集
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(t.id)}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="text-muted"
                    style={{ textAlign: "center", padding: "var(--sp-6)" }}
                  >
                    チームがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isFormOpen ? (
          <button className="btn btn-primary" onClick={onOpenNew}>
            新規チーム
          </button>
        ) : (
          <div className="flex gap-3 items-center" style={{ flexWrap: "wrap" }}>
            <input
              className="input"
              style={{ width: "auto", minWidth: 200 }}
              value={teamName}
              onChange={(e) => onTeamNameChange(e.target.value)}
              placeholder="チーム名"
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmit();
              }}
            />
            <button className="btn btn-primary" onClick={onSubmit}>
              {editingId ? "更新" : "作成"}
            </button>
            <button className="btn btn-ghost" onClick={onCancel}>
              キャンセル
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
