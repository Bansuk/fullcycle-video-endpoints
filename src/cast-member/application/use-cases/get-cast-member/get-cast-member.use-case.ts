import { ICastMemberRepository } from '../../../domain/cast-member.repository';
import { CastMemberOutput, CastMemberOutputMapper } from '../../cast-member-output';

export type GetCastMemberInput = {
  id: string;
};

export type GetCastMemberOutput = CastMemberOutput;

export class GetCastMemberUseCase {
  constructor(private readonly castMemberRepo: ICastMemberRepository) {}

  async execute(input: GetCastMemberInput): Promise<GetCastMemberOutput> {
    const entity = await this.castMemberRepo.findById(input.id);
    if (!entity) {
      throw new Error(`CastMember with id ${input.id} not found`);
    }
    return CastMemberOutputMapper.toOutput(entity);
  }
}
