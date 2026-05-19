import { CastMemberInMemoryRepository } from '../../../../infra/db/in-memory/cast-member-in-memory.repository';
import { CastMemberType } from '../../../../domain/cast-member.entity';
import { EntityValidationError } from '../../../../../shared/domain/errors/validation.error';
import { CreateCastMemberUseCase } from '../create-cast-member.use-case';

describe('CreateCastMemberUseCase', () => {
  let repository: CastMemberInMemoryRepository;
  let useCase: CreateCastMemberUseCase;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new CreateCastMemberUseCase(repository);
  });

  it('should create an actor with required fields', async () => {
    const output = await useCase.execute({ name: 'John Doe', type: CastMemberType.ACTOR });

    expect(output.id).toBeDefined();
    expect(output.name).toBe('John Doe');
    expect(output.type).toBe(CastMemberType.ACTOR);
    expect(output.created_at).toBeInstanceOf(Date);
    expect(await repository.findAll()).toHaveLength(1);
  });

  it('should create a director with required fields', async () => {
    const output = await useCase.execute({ name: 'Jane Doe', type: CastMemberType.DIRECTOR });

    expect(output.name).toBe('Jane Doe');
    expect(output.type).toBe(CastMemberType.DIRECTOR);
  });

  it('should persist the entity in the repository', async () => {
    await useCase.execute({ name: 'Actor1', type: CastMemberType.ACTOR });
    await useCase.execute({ name: 'Director1', type: CastMemberType.DIRECTOR });

    expect(await repository.findAll()).toHaveLength(2);
  });

  it('should throw EntityValidationError for empty name', async () => {
    await expect(
      useCase.execute({ name: '', type: CastMemberType.ACTOR }),
    ).rejects.toThrow(EntityValidationError);
  });

  it('should throw EntityValidationError for whitespace-only name', async () => {
    await expect(
      useCase.execute({ name: '   ', type: CastMemberType.ACTOR }),
    ).rejects.toThrow(EntityValidationError);
  });

  it('should throw EntityValidationError when name exceeds 255 characters', async () => {
    await expect(
      useCase.execute({ name: 'a'.repeat(256), type: CastMemberType.ACTOR }),
    ).rejects.toThrow(EntityValidationError);
  });

  it('should throw EntityValidationError for invalid type', async () => {
    await expect(
      useCase.execute({ name: 'Actor', type: 3 as CastMemberType }),
    ).rejects.toThrow(EntityValidationError);
  });
});
