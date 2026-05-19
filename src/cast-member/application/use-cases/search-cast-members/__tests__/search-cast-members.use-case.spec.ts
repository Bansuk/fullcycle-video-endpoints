import { CastMember, CastMemberType } from '../../../../domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '../../../../infra/db/in-memory/cast-member-in-memory.repository';
import { SearchCastMembersUseCase } from '../search-cast-members.use-case';

describe('SearchCastMembersUseCase', () => {
  let repository: CastMemberInMemoryRepository;
  let useCase: SearchCastMembersUseCase;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new SearchCastMembersUseCase(repository);
  });

  it('should return empty result when no cast members exist', async () => {
    const output = await useCase.execute({});

    expect(output.items).toHaveLength(0);
    expect(output.total).toBe(0);
    expect(output.current_page).toBe(1);
    expect(output.last_page).toBe(0);
  });

  it('should return all cast members with default params', async () => {
    await repository.insert(CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR }));
    await repository.insert(CastMember.create({ name: 'Director', type: CastMemberType.DIRECTOR }));

    const output = await useCase.execute({});

    expect(output.items).toHaveLength(2);
    expect(output.total).toBe(2);
  });

  it('should filter cast members by name (case-insensitive)', async () => {
    await repository.insert(CastMember.create({ name: 'John Actor', type: CastMemberType.ACTOR }));
    await repository.insert(CastMember.create({ name: 'john director', type: CastMemberType.DIRECTOR }));
    await repository.insert(CastMember.create({ name: 'Jane', type: CastMemberType.ACTOR }));

    const output = await useCase.execute({ filter: { name: 'john' } });

    expect(output.items).toHaveLength(2);
    expect(output.filter).toEqual({ name: 'john' });
  });

  it('should filter cast members by type', async () => {
    await repository.insert(CastMember.create({ name: 'Actor1', type: CastMemberType.ACTOR }));
    await repository.insert(CastMember.create({ name: 'Actor2', type: CastMemberType.ACTOR }));
    await repository.insert(CastMember.create({ name: 'Director1', type: CastMemberType.DIRECTOR }));

    const output = await useCase.execute({ filter: { type: CastMemberType.ACTOR } });

    expect(output.items).toHaveLength(2);
    expect(output.items.every(i => i.type === CastMemberType.ACTOR)).toBe(true);
  });

  it('should filter by both name and type', async () => {
    await repository.insert(CastMember.create({ name: 'John Actor', type: CastMemberType.ACTOR }));
    await repository.insert(CastMember.create({ name: 'John Director', type: CastMemberType.DIRECTOR }));
    await repository.insert(CastMember.create({ name: 'Jane Actor', type: CastMemberType.ACTOR }));

    const output = await useCase.execute({ filter: { name: 'john', type: CastMemberType.ACTOR } });

    expect(output.items).toHaveLength(1);
    expect(output.items[0].name).toBe('John Actor');
  });

  it('should sort by name ascending', async () => {
    await repository.insert(CastMember.create({ name: 'Zoe', type: CastMemberType.ACTOR }));
    await repository.insert(CastMember.create({ name: 'Alice', type: CastMemberType.DIRECTOR }));
    await repository.insert(CastMember.create({ name: 'Mike', type: CastMemberType.ACTOR }));

    const output = await useCase.execute({ sort: 'name', sort_dir: 'asc' });

    expect(output.items[0].name).toBe('Alice');
    expect(output.items[1].name).toBe('Mike');
    expect(output.items[2].name).toBe('Zoe');
    expect(output.sort).toBe('name');
    expect(output.sort_dir).toBe('asc');
  });

  it('should sort by name descending', async () => {
    await repository.insert(CastMember.create({ name: 'Alice', type: CastMemberType.DIRECTOR }));
    await repository.insert(CastMember.create({ name: 'Zoe', type: CastMemberType.ACTOR }));
    await repository.insert(CastMember.create({ name: 'Mike', type: CastMemberType.ACTOR }));

    const output = await useCase.execute({ sort: 'name', sort_dir: 'desc' });

    expect(output.items[0].name).toBe('Zoe');
    expect(output.items[1].name).toBe('Mike');
    expect(output.items[2].name).toBe('Alice');
  });

  it('should paginate results', async () => {
    for (let i = 1; i <= 5; i++) {
      await repository.insert(CastMember.create({ name: `CastMember ${i}`, type: CastMemberType.ACTOR }));
    }

    const output = await useCase.execute({ page: 1, per_page: 2 });

    expect(output.items).toHaveLength(2);
    expect(output.total).toBe(5);
    expect(output.current_page).toBe(1);
    expect(output.per_page).toBe(2);
    expect(output.last_page).toBe(3);
  });

  it('should return second page', async () => {
    for (let i = 1; i <= 4; i++) {
      await repository.insert(
        CastMember.create({ name: `CastMember ${String(i).padStart(2, '0')}`, type: CastMemberType.ACTOR }),
      );
    }

    const output = await useCase.execute({ page: 2, per_page: 2, sort: 'name', sort_dir: 'asc' });

    expect(output.items).toHaveLength(2);
    expect(output.current_page).toBe(2);
    expect(output.items[0].name).toBe('CastMember 03');
  });

  it('should map output fields correctly', async () => {
    const castMember = CastMember.create({ name: 'John', type: CastMemberType.ACTOR });
    await repository.insert(castMember);

    const output = await useCase.execute({});

    expect(output.items[0]).toMatchObject({
      id: castMember.id,
      name: 'John',
      type: CastMemberType.ACTOR,
    });
    expect(output.items[0].created_at).toBeInstanceOf(Date);
  });

  it('should return correct metadata with no sort', async () => {
    await repository.insert(CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR }));

    const output = await useCase.execute({ filter: null, sort: null });

    expect(output.sort).toBeNull();
    expect(output.sort_dir).toBeNull();
    expect(output.filter).toBeNull();
  });
});
