import { Link } from "react-router-dom";
import { useAnnouncement } from "../../../../hooks/useAnnouncements";
import { AnnouncementDetail } from "./AnnouncementDetail";

interface AnnouncementDetailContainerProps {
  id: number;
}

export function AnnouncementDetailContainer({ id }: AnnouncementDetailContainerProps) {
  const { data: announcement, isLoading, error } = useAnnouncement(id);

  if (isLoading) {
    return <p className="text-muted text-sm">読み込み中...</p>;
  }

  if (error) {
    return (
      <div className="animate-in">
        <div className="breadcrumb">
          <Link to="/announcements" className="text-sm" style={{ color: "var(--c-info)" }}>
            &larr; お知らせ一覧に戻る
          </Link>
        </div>
        <div className="alert alert-error">{error.message}</div>
      </div>
    );
  }

  if (!announcement) {
    return <p className="text-muted text-sm">読み込み中...</p>;
  }

  return <AnnouncementDetail announcement={announcement} />;
}
