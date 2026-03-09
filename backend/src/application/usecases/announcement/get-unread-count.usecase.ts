import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class GetUnreadCountUseCase {
  async execute(userId: string, uow: UnitOfWork) {
    const count = await uow.announcementRepo.getUnreadCount(userId);
    return { count };
  }
}
