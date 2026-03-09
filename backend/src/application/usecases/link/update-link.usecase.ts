import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError } from "../../../domain/errors/domain-error.js";
import type { UpdateLinkInputDTO } from "./dto.js";

export class UpdateLinkUseCase {
  async execute(uow: UnitOfWork, id: string, input: UpdateLinkInputDTO) {
    const updated = await uow.linkRepo.update(id, {
      title: input.title,
      url: input.url,
      description: input.description,
      category: input.category,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      throw new ResourceNotFoundError("Link", id);
    }

    return updated;
  }
}
