import { useParams } from "react-router-dom";
import { AnnouncementDetailContainer } from "../components/features/announcements/components/AnnouncementDetailContainer";

export function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <AnnouncementDetailContainer id={Number(id)} />;
}
