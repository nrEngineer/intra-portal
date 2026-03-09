interface ConfirmButtonProps {
  label: string;
  confirmMessage: string;
  onConfirm: () => void;
  className?: string;
}

export function ConfirmButton({
  label,
  confirmMessage,
  onConfirm,
  className = "btn btn-sm btn-danger",
}: ConfirmButtonProps) {
  const handleClick = () => {
    if (confirm(confirmMessage)) onConfirm();
  };
  return <button className={className} onClick={handleClick}>{label}</button>;
}
