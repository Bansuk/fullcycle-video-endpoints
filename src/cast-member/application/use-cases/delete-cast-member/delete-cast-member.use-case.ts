import { ICastMemberRepository } from '../../../domain/cast-member.repository';

export type DeleteCastMemberInput = {
  id: string;
};

export class DeleteCastMemberUseCase {
  constructor(private readonly castMemberRepo: ICastMemberRepository) {}

  async execute(input: DeleteCastMemberInput): Promise<void> {
    const entity = await this.castMemberRepo.findById(input.id);
    if (!entity) {
      throw new Error(`CastMember with id ${input.id} not found`);
    }
    await this.castMemberRepo.delete(input.id);
  }
}
