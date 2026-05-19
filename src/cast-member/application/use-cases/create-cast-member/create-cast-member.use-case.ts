import { CastMember, CastMemberType } from '../../../domain/cast-member.entity';
import { ICastMemberRepository } from '../../../domain/cast-member.repository';
import { CastMemberOutput, CastMemberOutputMapper } from '../../cast-member-output';

export type CreateCastMemberInput = {
  name: string;
  type: CastMemberType;
};

export type CreateCastMemberOutput = CastMemberOutput;

export class CreateCastMemberUseCase {
  constructor(private readonly castMemberRepo: ICastMemberRepository) {}

  async execute(input: CreateCastMemberInput): Promise<CreateCastMemberOutput> {
    const entity = CastMember.create(input);
    await this.castMemberRepo.insert(entity);
    return CastMemberOutputMapper.toOutput(entity);
  }
}
