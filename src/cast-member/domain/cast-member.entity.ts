import { Entity } from '../../shared/domain/entity';
import { EntityValidationError } from '../../shared/domain/errors/validation.error';
import { CastMemberValidatorFactory } from './cast-member.validator';

export enum CastMemberType {
  DIRECTOR = 1,
  ACTOR = 2,
}

export interface CastMemberProps {
  name: string;
  type: CastMemberType;
  created_at?: Date;
}

export class CastMember extends Entity<CastMemberProps> {
  private constructor(props: CastMemberProps, id?: string) {
    super(
      {
        ...props,
        created_at: props.created_at ?? new Date(),
      },
      id,
    );
  }

  static create(props: CastMemberProps, id?: string): CastMember {
    const castMember = new CastMember(props, id);
    CastMember.validate(castMember.props);
    return castMember;
  }

  private static validate(props: CastMemberProps): void {
    const validator = CastMemberValidatorFactory.create();
    const isValid = validator.validate(props);
    if (!isValid) {
      throw new EntityValidationError(validator.errors!);
    }
  }

  get name(): string {
    return this.props.name;
  }

  get type(): CastMemberType {
    return this.props.type;
  }

  get created_at(): Date {
    return this.props.created_at!;
  }

  changeName(name: string): void {
    CastMember.validate({ ...this.props, name });
    (this.props as CastMemberProps).name = name;
  }

  changeType(type: CastMemberType): void {
    CastMember.validate({ ...this.props, type });
    (this.props as CastMemberProps).type = type;
  }
}
