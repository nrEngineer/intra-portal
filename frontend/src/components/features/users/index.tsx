import type { FormEvent } from "react";
import { useUsers, useUserCreate, useUserRoleChange, useUserDelete } from "../../../hooks/useUsers";
import type { User, UserRole } from "../../../types/user";
import { PageHeader } from "../../ui";
import { useUserForm } from "./hooks";
import { UserTable } from "./components/UserTable";
import { UserForm } from "./components/UserForm";

export function UsersFeature() {
  const { data: users = [], isLoading } = useUsers();
  const createMutation = useUserCreate();
  const roleChangeMutation = useUserRoleChange();
  const deleteMutation = useUserDelete();

  const { form, setForm, showCreate, error, setError, cancelForm, toggleForm } = useUserForm();

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createMutation.mutateAsync(form);
      cancelForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
    }
  };

  const handleRoleChange = (userId: number, role: string) => {
    roleChangeMutation.mutate({ id: userId, role: role as UserRole });
  };

  const handleDelete = (u: User) => {
    deleteMutation.mutate(u.id);
  };

  return (
    <div>
      <PageHeader
        title="ユーザー管理"
        action={{
          label: showCreate ? "キャンセル" : "新規ユーザー",
          onClick: toggleForm,
        }}
      />

      {showCreate && (
        <UserForm
          form={form}
          error={error}
          onSubmit={handleCreate}
          onCancel={cancelForm}
          onChange={setForm}
        />
      )}

      <UserTable
        users={users}
        isLoading={isLoading}
        onRoleChange={handleRoleChange}
        onDelete={handleDelete}
      />
    </div>
  );
}
