import { CastMember, CastMemberType } from '../cast-member.entity';
import { EntityValidationError } from '../../../shared/domain/errors/validation.error';

describe('CastMember Entity', () => {
  describe('Constructor / defaults', () => {
    it('should create a cast member with all props provided', () => {
      const created_at = new Date('2024-01-01');
      const castMember = CastMember.create({
        name: 'John Doe',
        type: CastMemberType.DIRECTOR,
        created_at,
      });

      expect(castMember.name).toBe('John Doe');
      expect(castMember.type).toBe(CastMemberType.DIRECTOR);
      expect(castMember.created_at).toBe(created_at);
    });

    it('should create a cast member with only name and type and apply created_at default', () => {
      const before = new Date();
      const castMember = CastMember.create({ name: 'Jane Doe', type: CastMemberType.ACTOR });
      const after = new Date();

      expect(castMember.name).toBe('Jane Doe');
      expect(castMember.type).toBe(CastMemberType.ACTOR);
      expect(castMember.created_at.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(castMember.created_at.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should auto-generate an id when none is provided', () => {
      const castMember = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
      expect(castMember.id).toBeDefined();
      expect(typeof castMember.id).toBe('string');
      expect(castMember.id.length).toBeGreaterThan(0);
    });

    it('should use the provided id when given', () => {
      const id = 'b1f2c3d4-e5f6-7890-abcd-ef1234567890';
      const castMember = CastMember.create({ name: 'Director', type: CastMemberType.DIRECTOR }, id);
      expect(castMember.id).toBe(id);
    });
  });

  describe('Factory — CastMember.create()', () => {
    it('should return a CastMember instance', () => {
      const castMember = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
      expect(castMember).toBeInstanceOf(CastMember);
    });

    it('should create a Director with type value 1', () => {
      const castMember = CastMember.create({ name: 'Director', type: CastMemberType.DIRECTOR });
      expect(castMember.type).toBe(1);
    });

    it('should create an Actor with type value 2', () => {
      const castMember = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
      expect(castMember.type).toBe(2);
    });
  });

  describe('Validation', () => {
    it('should throw EntityValidationError when name is empty string', () => {
      expect(() => CastMember.create({ name: '', type: CastMemberType.ACTOR })).toThrow(EntityValidationError);
    });

    it('should include name field in errors when name is empty', () => {
      let error: EntityValidationError | undefined;
      try {
        CastMember.create({ name: '', type: CastMemberType.ACTOR });
      } catch (e) {
        error = e as EntityValidationError;
      }
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error!.error).toHaveProperty('name');
    });

    it('should throw EntityValidationError when name is whitespace only', () => {
      expect(() => CastMember.create({ name: '   ', type: CastMemberType.ACTOR })).toThrow(EntityValidationError);
    });

    it('should include name field in errors when name is whitespace only', () => {
      let error: EntityValidationError | undefined;
      try {
        CastMember.create({ name: '   ', type: CastMemberType.ACTOR });
      } catch (e) {
        error = e as EntityValidationError;
      }
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error!.error).toHaveProperty('name');
    });

    it('should throw EntityValidationError when name exceeds 255 characters', () => {
      const longName = 'a'.repeat(256);
      expect(() => CastMember.create({ name: longName, type: CastMemberType.ACTOR })).toThrow(EntityValidationError);
    });

    it('should include name field in errors when name exceeds 255 characters', () => {
      let error: EntityValidationError | undefined;
      try {
        CastMember.create({ name: 'a'.repeat(256), type: CastMemberType.ACTOR });
      } catch (e) {
        error = e as EntityValidationError;
      }
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error!.error).toHaveProperty('name');
    });

    it('should succeed when name is exactly 255 characters', () => {
      const exactName = 'a'.repeat(255);
      const castMember = CastMember.create({ name: exactName, type: CastMemberType.ACTOR });
      expect(castMember.name).toBe(exactName);
      expect(castMember.name.length).toBe(255);
    });

    it('should throw EntityValidationError for invalid type value', () => {
      expect(() => CastMember.create({ name: 'John', type: 3 as CastMemberType })).toThrow(EntityValidationError);
    });

    it('should include type field in errors for invalid type value', () => {
      let error: EntityValidationError | undefined;
      try {
        CastMember.create({ name: 'John', type: 0 as CastMemberType });
      } catch (e) {
        error = e as EntityValidationError;
      }
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error!.error).toHaveProperty('type');
    });
  });

  describe('changeName()', () => {
    it('should update the name to a valid value', () => {
      const castMember = CastMember.create({ name: 'OldName', type: CastMemberType.ACTOR });
      castMember.changeName('NewName');
      expect(castMember.name).toBe('NewName');
    });

    it('should throw EntityValidationError when new name is empty', () => {
      const castMember = CastMember.create({ name: 'ValidName', type: CastMemberType.ACTOR });
      expect(() => castMember.changeName('')).toThrow(EntityValidationError);
    });

    it('should throw EntityValidationError when new name is too long', () => {
      const castMember = CastMember.create({ name: 'ValidName', type: CastMemberType.ACTOR });
      expect(() => castMember.changeName('x'.repeat(256))).toThrow(EntityValidationError);
    });

    it('should not change name when validation fails', () => {
      const castMember = CastMember.create({ name: 'ValidName', type: CastMemberType.ACTOR });
      try {
        castMember.changeName('');
      } catch {
        // expected
      }
      expect(castMember.name).toBe('ValidName');
    });
  });

  describe('changeType()', () => {
    it('should change type from Actor to Director', () => {
      const castMember = CastMember.create({ name: 'John', type: CastMemberType.ACTOR });
      castMember.changeType(CastMemberType.DIRECTOR);
      expect(castMember.type).toBe(CastMemberType.DIRECTOR);
    });

    it('should change type from Director to Actor', () => {
      const castMember = CastMember.create({ name: 'John', type: CastMemberType.DIRECTOR });
      castMember.changeType(CastMemberType.ACTOR);
      expect(castMember.type).toBe(CastMemberType.ACTOR);
    });

    it('should throw EntityValidationError for invalid type value', () => {
      const castMember = CastMember.create({ name: 'John', type: CastMemberType.ACTOR });
      expect(() => castMember.changeType(3 as CastMemberType)).toThrow(EntityValidationError);
    });

    it('should not change type when validation fails', () => {
      const castMember = CastMember.create({ name: 'John', type: CastMemberType.ACTOR });
      try {
        castMember.changeType(0 as CastMemberType);
      } catch {
        // expected
      }
      expect(castMember.type).toBe(CastMemberType.ACTOR);
    });
  });

  describe('ID generation', () => {
    it('should generate different ids for different instances', () => {
      const cm1 = CastMember.create({ name: 'Actor1', type: CastMemberType.ACTOR });
      const cm2 = CastMember.create({ name: 'Actor2', type: CastMemberType.ACTOR });
      expect(cm1.id).not.toBe(cm2.id);
    });

    it('should have a UUID-like id format', () => {
      const castMember = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(castMember.id)).toBe(true);
    });
  });

  describe('Immutability', () => {
    it('should not allow direct assignment to props', () => {
      const castMember = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
      const descriptor = Object.getOwnPropertyDescriptor(castMember, 'props');
      expect(descriptor?.writable).toBe(false);
    });

    it('should not allow direct assignment to id', () => {
      const castMember = CastMember.create({ name: 'Actor', type: CastMemberType.ACTOR });
      const descriptor = Object.getOwnPropertyDescriptor(castMember, 'id');
      expect(descriptor?.writable).toBe(false);
    });
  });
});
