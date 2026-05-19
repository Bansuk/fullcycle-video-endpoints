import { CastMember, CastMemberType } from '../../../../domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '../../../../infra/db/in-memory/cast-member-in-memory.repository';
import { EntityValidationError } from '../../../../../shared/domain/errors/validation.error';
import { UpdateCastMemberUseCase } from '../update-cast-member.use-case';

describe('UpdateCastMemberUseCase', () => {
  let repository: CastMemberInMemoryRepository;
  let useCase: UpdateCastMemberUseCase;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new UpdateCastMemberUseCase(repository);
  });

  it('should update cast member name', async () => {
    const castMember = CastMember.create({ name: 'Old Name', type: CastMemberType.ACTOR });
    await repository.insert(castMember);

    const output = await useCase.execute({ id: castMember.id, name: 'New Name' });

    expect(output.name).toBe('New Name');
    expect(output.id).toBe(castMember.id);
  });

  it('should update cast member type', async () => {
    const castMember = CastMember.create({ name: 'John', type: CastMemberType.ACTOR });
    await repository.insert(castMember);

    const output = await useCase.execute({ id: castMember.id, type: CastMemberType.DIRECTOR });

    expect(output.type).toBe(CastMemberType.DIRECTOR);
    expect(output.name).toBe('John');
  });

  it('should update both name and type', async () => {
    const castMember = CastMember.create({ name: 'Old Name', type: CastMemberType.ACTOR });
    await repository.insert(castMember);

    const output = await useCase.execute({
      id: castMember.id,
      name: 'New Name',
      type: CastMemberType.DIRECTOR,
    });

    expect(output.name).toBe('New Name');
    expect(output.type).toBe(CastMemberType.DIRECTOR);
  });

  it('should not change fields not provided', async () => {
    const castMember = CastMember.create({ name: 'John', type: CastMemberType.ACTOR });
    await repository.insert(castMember);

    const output = await useCase.execute({ id: castMember.id, name: 'Jane' });

    expect(output.name).toBe('Jane');
    expect(output.type).toBe(CastMemberType.ACTOR);
  });

  it('should throw error when cast member not found', async () => {
    await expect(
      useCase.execute({ id: 'non-existent-id', name: 'Actor' }),
    ).rejects.toThrow('not found');
  });

  it('should throw EntityValidationError for invalid name', async () => {
    const castMember = CastMember.create({ name: 'John', type: CastMemberType.ACTOR });
    await repository.insert(castMember);

    await expect(useCase.execute({ id: castMember.id, name: '' })).rejects.toThrow(
      EntityValidationError,
    );
  });

  it('should throw EntityValidationError for invalid type', async () => {
    const castMember = CastMember.create({ name: 'John', type: CastMemberType.ACTOR });
    await repository.insert(castMember);

    await expect(
      useCase.execute({ id: castMember.id, type: 3 as CastMemberType }),
    ).rejects.toThrow(EntityValidationError);
  });

  it('should persist updated entity in repository', async () => {
    const castMember = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
    await repository.insert(castMember);

    await useCase.execute({ id: castMember.id, name: 'Updated Actor' });

    const stored = await repository.findById(castMember.id);
    expect(stored!.name).toBe('Updated Actor');
  });
});
