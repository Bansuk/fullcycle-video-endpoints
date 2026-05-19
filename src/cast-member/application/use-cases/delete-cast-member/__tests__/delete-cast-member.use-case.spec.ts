import { CastMember, CastMemberType } from '../../../../domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '../../../../infra/db/in-memory/cast-member-in-memory.repository';
import { DeleteCastMemberUseCase } from '../delete-cast-member.use-case';

describe('DeleteCastMemberUseCase', () => {
  let repository: CastMemberInMemoryRepository;
  let useCase: DeleteCastMemberUseCase;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new DeleteCastMemberUseCase(repository);
  });

  it('should delete a cast member', async () => {
    const castMember = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
    await repository.insert(castMember);

    await useCase.execute({ id: castMember.id });

    expect(await repository.findAll()).toHaveLength(0);
  });

  it('should delete the correct cast member when multiple exist', async () => {
    const cm1 = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
    const cm2 = CastMember.create({ name: 'Director', type: CastMemberType.DIRECTOR });
    await repository.insert(cm1);
    await repository.insert(cm2);

    await useCase.execute({ id: cm1.id });

    const remaining = await repository.findAll();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(cm2.id);
  });

  it('should throw error when cast member not found', async () => {
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow('not found');
  });

  it('should return void on successful deletion', async () => {
    const castMember = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
    await repository.insert(castMember);

    const result = await useCase.execute({ id: castMember.id });

    expect(result).toBeUndefined();
  });
});
