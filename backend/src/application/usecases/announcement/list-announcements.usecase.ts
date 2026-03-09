import type { UnitOfWork } from "../../ports/unit-of-work.js";
import type { ListAnnouncementsInputDTO } from "./dto.js";

export class ListAnnouncementsUseCase {
  async execute(uow: UnitOfWork, input: ListAnnouncementsInputDTO) {
    const page = parseInt(input.page || "1", 10);
    const limit = 10;
    const showDrafts = input.user.role === "admin" && input.drafts === "true";

    const { data, total } = await uow.announcementRepo.findAll({
      showDrafts,
      category: input.category,
      search: input.search,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit);
    const mapped = data.map((a) => ({ ...a, attachments: [] }));

    return { data: mapped, total, page, totalPages };
  }
}
