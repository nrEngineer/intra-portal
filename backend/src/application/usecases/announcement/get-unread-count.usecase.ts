import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class GetUnreadCountUseCase {
  async execute(uow: UnitOfWork, userId: string) {
    const count = await uow.announcementRepo.getUnreadCount(userId);
    return { count };
  }
}
