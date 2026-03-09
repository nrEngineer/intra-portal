import { Link } from "react-router-dom";

interface BaseProps {
  label: string;
  color: string;
  children: React.ReactNode;
}

interface LinkStatCardProps extends BaseProps {
  to: string;
}

interface DivStatCardProps extends BaseProps {
  to?: undefined;
}

type StatCardProps = LinkStatCardProps | DivStatCardProps;

/**
 * Reusable stat card that renders as a <Link> when `to` is provided,
 * or as a plain <div> otherwise.
 */
export function StatCard({ label, color, to, children }: StatCardProps) {
  const content = (
    <>
      <div className="stat-label">{label}</div>
      {children}
    </>
  );

  if (to !== undefined) {
    return (
      <Link
        to={to}
        className="card stat-card"
        style={{ color, textDecoration: "none" }}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="card stat-card" style={{ color }}>
      {content}
    </div>
  );
}
