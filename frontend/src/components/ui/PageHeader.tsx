interface PageHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="page-header flex items-center justify-between">
      <h1 className="page-title">{title}</h1>
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
