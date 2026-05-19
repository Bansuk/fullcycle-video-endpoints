import { CastMember, CastMemberType } from '../domain/cast-member.entity';

export type CastMemberOutput = {
  id: string;
  name: string;
  type: CastMemberType;
  created_at: Date;
};

export class CastMemberOutputMapper {
  static toOutput(entity: CastMember): CastMemberOutput {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      created_at: entity.created_at,
    };
  }
}
