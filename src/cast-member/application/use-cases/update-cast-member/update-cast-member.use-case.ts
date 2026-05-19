import { CastMemberType } from '../../../domain/cast-member.entity';
import { ICastMemberRepository } from '../../../domain/cast-member.repository';
import { CastMemberOutput, CastMemberOutputMapper } from '../../cast-member-output';

export type UpdateCastMemberInput = {
  id: string;
  name?: string;
  type?: CastMemberType;
};

export type UpdateCastMemberOutput = CastMemberOutput;

export class UpdateCastMemberUseCase {
  constructor(private readonly castMemberRepo: ICastMemberRepository) {}

  async execute(input: UpdateCastMemberInput): Promise<UpdateCastMemberOutput> {
    const entity = await this.castMemberRepo.findById(input.id);
    if (!entity) {
      throw new Error(`CastMember with id ${input.id} not found`);
    }

    if (input.name !== undefined) {
      entity.changeName(input.name);
    }
    if (input.type !== undefined) {
      entity.changeType(input.type);
    }

    await this.castMemberRepo.update(entity);
    return CastMemberOutputMapper.toOutput(entity);
  }
}
