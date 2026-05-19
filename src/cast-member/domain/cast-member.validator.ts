import 'reflect-metadata';
import {
  IsDate,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ClassValidatorFields } from '../../shared/domain/validators/class-validator-fields';
import type { CastMemberProps, CastMemberType } from './cast-member.entity';

export class CastMemberRules {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  @Matches(/\S+/, { message: 'name should not be empty' })
  name!: string;

  @IsIn([1, 2])
  type!: CastMemberType;

  @IsDate()
  @IsOptional()
  created_at!: Date;

  constructor({ name, type, created_at }: CastMemberProps) {
    Object.assign(this, { name, type, created_at });
  }
}

export class CastMemberValidator extends ClassValidatorFields<CastMemberRules> {
  validate(data: CastMemberProps): boolean {
    return super.validate(new CastMemberRules(data ?? {}));
  }
}

export class CastMemberValidatorFactory {
  static create(): CastMemberValidator {
    return new CastMemberValidator();
  }
}
