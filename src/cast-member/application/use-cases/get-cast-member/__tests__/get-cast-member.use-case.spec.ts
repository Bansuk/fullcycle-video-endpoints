import { CastMember, CastMemberType } from '../../../../domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '../../../../infra/db/in-memory/cast-member-in-memory.repository';
import { GetCastMemberUseCase } from '../get-cast-member.use-case';

describe('GetCastMemberUseCase', () => {
  let repository: CastMemberInMemoryRepository;
  let useCase: GetCastMemberUseCase;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new GetCastMemberUseCase(repository);
  });

  it('should return a cast member by id', async () => {
    const castMember = CastMember.create({ name: 'John Doe', type: CastMemberType.ACTOR });
    await repository.insert(castMember);

    const output = await useCase.execute({ id: castMember.id });

    expect(output.id).toBe(castMember.id);
    expect(output.name).toBe('John Doe');
    expect(output.type).toBe(CastMemberType.ACTOR);
    expect(output.created_at).toBeInstanceOf(Date);
  });

  it('should return correct cast member when multiple exist', async () => {
    const cm1 = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
    const cm2 = CastMember.create({ name: 'Director', type: CastMemberType.DIRECTOR });
    await repository.insert(cm1);
    await repository.insert(cm2);

    const output = await useCase.execute({ id: cm2.id });

    expect(output.id).toBe(cm2.id);
    expect(output.name).toBe('Director');
    expect(output.type).toBe(CastMemberType.DIRECTOR);
  });

  it('should throw error when cast member not found', async () => {
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow('not found');
  });

  it('should return a director cast member', async () => {
    const castMember = CastMember.create({ name: 'Director', type: CastMemberType.DIRECTOR });
    await repository.insert(castMember);

    const output = await useCase.execute({ id: castMember.id });

    expect(output.type).toBe(CastMemberType.DIRECTOR);
  });
});
