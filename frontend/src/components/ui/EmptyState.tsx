import type { ReactNode } from "react";

interface EmptyStateProps {
  isLoading: boolean;
  isEmpty: boolean;
  loadingText?: string;
  emptyText?: string;
  children: ReactNode;
  className?: string;
}

export function EmptyState({
  isLoading,
  isEmpty,
  loadingText = "読み込み中...",
  emptyText = "データがありません",
  children,
  className = "animate-in stagger-2",
}: EmptyStateProps) {
  if (isLoading) return <div className={`empty-state ${className}`}>{loadingText}</div>;
  if (isEmpty) return <div className={`empty-state ${className}`}>{emptyText}</div>;
  return <>{children}</>;
}
