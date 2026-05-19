import { CastMember, CastMemberType } from '../../../../domain/cast-member.entity';
import { SearchParams, SearchResult } from '../../../../../shared/domain/repository/repository-interface';
import { CastMemberInMemoryRepository } from '../cast-member-in-memory.repository';

describe('CastMemberInMemoryRepository', () => {
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
  });

  describe('insert()', () => {
    it('should insert a cast member', async () => {
      const castMember = CastMember.create({ name: 'John', type: CastMemberType.ACTOR });
      await repository.insert(castMember);
      const found = await repository.findById(castMember.id);
      expect(found).toBe(castMember);
    });

    it('should store multiple cast members', async () => {
      const cm1 = CastMember.create({ name: 'Actor1', type: CastMemberType.ACTOR });
      const cm2 = CastMember.create({ name: 'Director1', type: CastMemberType.DIRECTOR });
      await repository.insert(cm1);
      await repository.insert(cm2);
      expect((await repository.findAll()).length).toBe(2);
    });
  });

  describe('findById()', () => {
    it('should return null when cast member is not found', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });

    it('should return the cast member when found', async () => {
      const castMember = CastMember.create({ name: 'John', type: CastMemberType.ACTOR });
      await repository.insert(castMember);
      const found = await repository.findById(castMember.id);
      expect(found).toBe(castMember);
    });
  });

  describe('findAll()', () => {
    it('should return empty array when repository is empty', async () => {
      const all = await repository.findAll();
      expect(all).toHaveLength(0);
    });

    it('should return all inserted cast members', async () => {
      const cm1 = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
      const cm2 = CastMember.create({ name: 'Director', type: CastMemberType.DIRECTOR });
      await repository.insert(cm1);
      await repository.insert(cm2);
      const all = await repository.findAll();
      expect(all).toHaveLength(2);
      expect(all).toContain(cm1);
      expect(all).toContain(cm2);
    });

    it('should return a copy — mutations to the result do not affect the store', async () => {
      const castMember = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
      await repository.insert(castMember);
      const all = await repository.findAll();
      all.pop();
      expect((await repository.findAll()).length).toBe(1);
    });
  });

  describe('update()', () => {
    it('should update a cast member', async () => {
      const castMember = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
      await repository.insert(castMember);
      castMember.changeName('Updated Actor');
      await repository.update(castMember);
      const found = await repository.findById(castMember.id);
      expect(found!.name).toBe('Updated Actor');
    });

    it('should throw when cast member does not exist', async () => {
      const castMember = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
      await expect(repository.update(castMember)).rejects.toThrow(
        `Entity not found: ${castMember.id}`,
      );
    });
  });

  describe('delete()', () => {
    it('should delete a cast member by id', async () => {
      const castMember = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
      await repository.insert(castMember);
      await repository.delete(castMember.id);
      const found = await repository.findById(castMember.id);
      expect(found).toBeNull();
    });

    it('should throw when cast member does not exist', async () => {
      await expect(repository.delete('non-existent-id')).rejects.toThrow(
        'Entity not found: non-existent-id',
      );
    });
  });

  describe('search() — filter by name', () => {
    it('should return all cast members when no filter is provided', async () => {
      const cm1 = CastMember.create({ name: 'John', type: CastMemberType.ACTOR });
      const cm2 = CastMember.create({ name: 'Jane', type: CastMemberType.DIRECTOR });
      await repository.insert(cm1);
      await repository.insert(cm2);

      const result = await repository.search(new SearchParams());
      expect(result.items).toHaveLength(2);
    });

    it('should filter cast members by name substring (case-insensitive)', async () => {
      const cm1 = CastMember.create({ name: 'John Actor', type: CastMemberType.ACTOR });
      const cm2 = CastMember.create({ name: 'Jane Director', type: CastMemberType.DIRECTOR });
      const cm3 = CastMember.create({ name: 'John Director', type: CastMemberType.DIRECTOR });
      await repository.insert(cm1);
      await repository.insert(cm2);
      await repository.insert(cm3);

      const result = await repository.search(new SearchParams({ filter: { name: 'john' } }));
      expect(result.items).toHaveLength(2);
      expect(result.items).toContain(cm1);
      expect(result.items).toContain(cm3);
    });

    it('should return empty array when name filter matches nothing', async () => {
      await repository.insert(CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR }));
      const result = await repository.search(new SearchParams({ filter: { name: 'xyz123' } }));
      expect(result.items).toHaveLength(0);
    });
  });

  describe('search() — filter by type', () => {
    it('should filter cast members by type Actor', async () => {
      const actor1 = CastMember.create({ name: 'Actor1', type: CastMemberType.ACTOR });
      const actor2 = CastMember.create({ name: 'Actor2', type: CastMemberType.ACTOR });
      const director = CastMember.create({ name: 'Director1', type: CastMemberType.DIRECTOR });
      await repository.insert(actor1);
      await repository.insert(actor2);
      await repository.insert(director);

      const result = await repository.search(new SearchParams({ filter: { type: CastMemberType.ACTOR } }));
      expect(result.items).toHaveLength(2);
      expect(result.items).toContain(actor1);
      expect(result.items).toContain(actor2);
    });

    it('should filter cast members by type Director', async () => {
      const actor = CastMember.create({ name: 'Actor1', type: CastMemberType.ACTOR });
      const director1 = CastMember.create({ name: 'Director1', type: CastMemberType.DIRECTOR });
      const director2 = CastMember.create({ name: 'Director2', type: CastMemberType.DIRECTOR });
      await repository.insert(actor);
      await repository.insert(director1);
      await repository.insert(director2);

      const result = await repository.search(new SearchParams({ filter: { type: CastMemberType.DIRECTOR } }));
      expect(result.items).toHaveLength(2);
      expect(result.items).toContain(director1);
      expect(result.items).toContain(director2);
    });

    it('should filter by both name and type simultaneously', async () => {
      const cm1 = CastMember.create({ name: 'John Actor', type: CastMemberType.ACTOR });
      const cm2 = CastMember.create({ name: 'John Director', type: CastMemberType.DIRECTOR });
      const cm3 = CastMember.create({ name: 'Jane Actor', type: CastMemberType.ACTOR });
      await repository.insert(cm1);
      await repository.insert(cm2);
      await repository.insert(cm3);

      const result = await repository.search(
        new SearchParams({ filter: { name: 'john', type: CastMemberType.ACTOR } }),
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toBe(cm1);
    });

    it('should update total based on filtered items', async () => {
      await repository.insert(CastMember.create({ name: 'Actor1', type: CastMemberType.ACTOR }));
      await repository.insert(CastMember.create({ name: 'Actor2', type: CastMemberType.ACTOR }));
      await repository.insert(CastMember.create({ name: 'Director1', type: CastMemberType.DIRECTOR }));

      const result = await repository.search(new SearchParams({ filter: { type: CastMemberType.ACTOR } }));
      expect(result.total).toBe(2);
    });
  });

  describe('search() — default sort by created_at', () => {
    it('should sort by created_at descending when no sort is specified', async () => {
      const older = new Date('2024-01-01');
      const newer = new Date('2024-06-01');
      const cm1 = CastMember.create({ name: 'Older', type: CastMemberType.ACTOR, created_at: older });
      const cm2 = CastMember.create({ name: 'Newer', type: CastMemberType.ACTOR, created_at: newer });
      await repository.insert(cm1);
      await repository.insert(cm2);

      const result = await repository.search(new SearchParams());
      expect(result.items[0]).toBe(cm2);
      expect(result.items[1]).toBe(cm1);
    });

    it('should maintain created_at desc order for multiple items', async () => {
      const dates = [
        new Date('2024-03-01'),
        new Date('2024-01-01'),
        new Date('2024-06-01'),
      ];
      const names = ['March', 'January', 'June'];
      for (let i = 0; i < names.length; i++) {
        await repository.insert(
          CastMember.create({ name: names[i], type: CastMemberType.ACTOR, created_at: dates[i] }),
        );
      }

      const result = await repository.search(new SearchParams());
      expect(result.items[0].name).toBe('June');
      expect(result.items[1].name).toBe('March');
      expect(result.items[2].name).toBe('January');
    });
  });

  describe('search() — explicit sort', () => {
    it('should sort by name ascending', async () => {
      await repository.insert(CastMember.create({ name: 'Zoe', type: CastMemberType.ACTOR }));
      await repository.insert(CastMember.create({ name: 'Alice', type: CastMemberType.DIRECTOR }));
      await repository.insert(CastMember.create({ name: 'Mike', type: CastMemberType.ACTOR }));

      const result = await repository.search(new SearchParams({ sort: 'name', sort_dir: 'asc' }));
      expect(result.items[0].name).toBe('Alice');
      expect(result.items[1].name).toBe('Mike');
      expect(result.items[2].name).toBe('Zoe');
    });

    it('should sort by name descending', async () => {
      await repository.insert(CastMember.create({ name: 'Zoe', type: CastMemberType.ACTOR }));
      await repository.insert(CastMember.create({ name: 'Alice', type: CastMemberType.DIRECTOR }));
      await repository.insert(CastMember.create({ name: 'Mike', type: CastMemberType.ACTOR }));

      const result = await repository.search(new SearchParams({ sort: 'name', sort_dir: 'desc' }));
      expect(result.items[0].name).toBe('Zoe');
      expect(result.items[1].name).toBe('Mike');
      expect(result.items[2].name).toBe('Alice');
    });

    it('should default to created_at sort when sort field is not in sortableFields', async () => {
      const older = new Date('2024-01-01');
      const newer = new Date('2024-12-01');
      await repository.insert(CastMember.create({ name: 'B', type: CastMemberType.ACTOR, created_at: older }));
      await repository.insert(CastMember.create({ name: 'A', type: CastMemberType.DIRECTOR, created_at: newer }));

      const result = await repository.search(
        new SearchParams({ sort: 'unknown_field', sort_dir: 'asc' }),
      );
      expect(result.items[0].name).toBe('A');
      expect(result.items[1].name).toBe('B');
    });
  });

  describe('search() — pagination', () => {
    it('should return first page of results', async () => {
      const created_at = new Date();
      for (let i = 1; i <= 5; i++) {
        await repository.insert(
          CastMember.create({ name: `CastMember ${i}`, type: CastMemberType.ACTOR, created_at }),
        );
      }

      const result = await repository.search(
        new SearchParams({ sort: 'name', sort_dir: 'asc', page: 1, per_page: 2 }),
      );
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(5);
      expect(result.last_page).toBe(3);
      expect(result.current_page).toBe(1);
      expect(result.per_page).toBe(2);
    });

    it('should return correct items for page 2', async () => {
      const created_at = new Date();
      const names = ['Alpha', 'Beta', 'Gamma', 'Delta'];
      for (const name of names) {
        await repository.insert(
          CastMember.create({ name, type: CastMemberType.ACTOR, created_at }),
        );
      }

      const result = await repository.search(
        new SearchParams({ sort: 'name', sort_dir: 'asc', page: 2, per_page: 2 }),
      );
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('Delta');
      expect(result.items[1].name).toBe('Gamma');
    });

    it('should return empty items for page beyond last_page', async () => {
      await repository.insert(CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR }));

      const result = await repository.search(new SearchParams({ page: 10, per_page: 15 }));
      expect(result.items).toHaveLength(0);
    });

    it('should use default per_page of 15 when not specified', async () => {
      const result = await repository.search(new SearchParams({ page: 1 }));
      expect(result.per_page).toBe(15);
    });
  });

  describe('search() — SearchResult shape', () => {
    it('should return a SearchResult instance', async () => {
      const result = await repository.search(new SearchParams());
      expect(result).toBeInstanceOf(SearchResult);
    });

    it('should include correct metadata in result', async () => {
      await repository.insert(CastMember.create({ name: 'Actor John', type: CastMemberType.ACTOR }));
      await repository.insert(CastMember.create({ name: 'Actor Jane', type: CastMemberType.ACTOR }));

      const result = await repository.search(
        new SearchParams({ filter: { name: 'actor' }, page: 1, per_page: 10 }),
      );
      expect(result.total).toBe(2);
      expect(result.current_page).toBe(1);
      expect(result.per_page).toBe(10);
      expect(result.last_page).toBe(1);
      expect(result.filter).toEqual({ name: 'actor' });
      expect(result.sort).toBeNull();
      expect(result.sort_dir).toBeNull();
    });

    it('should calculate last_page correctly', async () => {
      const created_at = new Date();
      for (let i = 1; i <= 10; i++) {
        await repository.insert(
          CastMember.create({ name: `CastMember ${i}`, type: CastMemberType.ACTOR, created_at }),
        );
      }

      const result = await repository.search(new SearchParams({ page: 1, per_page: 3 }));
      expect(result.total).toBe(10);
      expect(result.last_page).toBe(4);
    });
  });
});
