import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import { CastMemberInMemoryRepository } from '../../db/in-memory/cast-member-in-memory.repository';
import { castMemberRouter } from '../cast-member.route';
import { CastMemberType } from '../../../domain/cast-member.entity';

function buildApp() {
  const repo = new CastMemberInMemoryRepository();
  const app = express();
  app.use(express.json());
  app.use('/cast-members', castMemberRouter(repo));
  return { app, repo };
}

describe('CastMember Routes E2E', () => {
  describe('POST /cast-members', () => {
    it('should create a director and return 201', async () => {
      const { app } = buildApp();
      const res = await request(app)
        .post('/cast-members')
        .send({ name: 'Steven Spielberg', type: CastMemberType.DIRECTOR });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: 'Steven Spielberg',
        type: CastMemberType.DIRECTOR,
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.created_at).toBeDefined();
    });

    it('should create an actor and return 201', async () => {
      const { app } = buildApp();
      const res = await request(app)
        .post('/cast-members')
        .send({ name: 'Tom Hanks', type: CastMemberType.ACTOR });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: 'Tom Hanks',
        type: CastMemberType.ACTOR,
      });
    });

    it('should return 422 when name is missing', async () => {
      const { app } = buildApp();
      const res = await request(app)
        .post('/cast-members')
        .send({ type: CastMemberType.ACTOR });

      expect(res.status).toBe(422);
      expect(res.body.message).toBe('Validation Error');
      expect(res.body.errors).toBeDefined();
    });

    it('should return 422 when type is missing', async () => {
      const { app } = buildApp();
      const res = await request(app).post('/cast-members').send({ name: 'Someone' });

      expect(res.status).toBe(422);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 422 when name exceeds 255 characters', async () => {
      const { app } = buildApp();
      const res = await request(app)
        .post('/cast-members')
        .send({ name: 'a'.repeat(256), type: CastMemberType.ACTOR });

      expect(res.status).toBe(422);
    });

    it('should return 422 for invalid type value', async () => {
      const { app } = buildApp();
      const res = await request(app)
        .post('/cast-members')
        .send({ name: 'Someone', type: 99 });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /cast-members', () => {
    it('should list cast members with default pagination', async () => {
      const { app } = buildApp();
      await request(app)
        .post('/cast-members')
        .send({ name: 'Director A', type: CastMemberType.DIRECTOR });
      await request(app)
        .post('/cast-members')
        .send({ name: 'Actor B', type: CastMemberType.ACTOR });

      const res = await request(app).get('/cast-members');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.total).toBe(2);
      expect(res.body.current_page).toBe(1);
      expect(res.body.per_page).toBe(15);
    });

    it('should filter cast members by name', async () => {
      const { app } = buildApp();
      await request(app)
        .post('/cast-members')
        .send({ name: 'Steven Spielberg', type: CastMemberType.DIRECTOR });
      await request(app)
        .post('/cast-members')
        .send({ name: 'Tom Hanks', type: CastMemberType.ACTOR });

      const res = await request(app).get('/cast-members?filter[name]=Steven');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].name).toBe('Steven Spielberg');
    });

    it('should filter cast members by type', async () => {
      const { app } = buildApp();
      await request(app)
        .post('/cast-members')
        .send({ name: 'Director One', type: CastMemberType.DIRECTOR });
      await request(app)
        .post('/cast-members')
        .send({ name: 'Actor One', type: CastMemberType.ACTOR });
      await request(app)
        .post('/cast-members')
        .send({ name: 'Actor Two', type: CastMemberType.ACTOR });

      const res = await request(app).get(
        `/cast-members?filter[type]=${CastMemberType.ACTOR}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.items.every((m: any) => m.type === CastMemberType.ACTOR)).toBe(true);
    });

    it('should filter by both name and type', async () => {
      const { app } = buildApp();
      await request(app)
        .post('/cast-members')
        .send({ name: 'John Director', type: CastMemberType.DIRECTOR });
      await request(app)
        .post('/cast-members')
        .send({ name: 'John Actor', type: CastMemberType.ACTOR });

      const res = await request(app).get(
        `/cast-members?filter[name]=John&filter[type]=${CastMemberType.DIRECTOR}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].name).toBe('John Director');
    });

    it('should sort cast members by name asc', async () => {
      const { app } = buildApp();
      await request(app)
        .post('/cast-members')
        .send({ name: 'Zebra', type: CastMemberType.ACTOR });
      await request(app)
        .post('/cast-members')
        .send({ name: 'Alpha', type: CastMemberType.DIRECTOR });

      const res = await request(app).get('/cast-members?sort=name&sort_dir=asc');

      expect(res.status).toBe(200);
      expect(res.body.items[0].name).toBe('Alpha');
      expect(res.body.items[1].name).toBe('Zebra');
    });

    it('should paginate results', async () => {
      const { app } = buildApp();
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/cast-members')
          .send({ name: `Actor ${i}`, type: CastMemberType.ACTOR });
      }

      const res = await request(app).get('/cast-members?page=1&per_page=2');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.total).toBe(5);
      expect(res.body.last_page).toBe(3);
    });
  });

  describe('GET /cast-members/:id', () => {
    it('should return a cast member by id', async () => {
      const { app } = buildApp();
      const created = await request(app)
        .post('/cast-members')
        .send({ name: 'Tom Hanks', type: CastMemberType.ACTOR });
      const { id } = created.body;

      const res = await request(app).get(`/cast-members/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.name).toBe('Tom Hanks');
      expect(res.body.type).toBe(CastMemberType.ACTOR);
    });

    it('should return 404 for non-existent id', async () => {
      const { app } = buildApp();
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app).get(`/cast-members/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('PATCH /cast-members/:id', () => {
    it('should update name and return 200', async () => {
      const { app } = buildApp();
      const created = await request(app)
        .post('/cast-members')
        .send({ name: 'Old Name', type: CastMemberType.ACTOR });
      const { id } = created.body;

      const res = await request(app).patch(`/cast-members/${id}`).send({ name: 'New Name' });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.name).toBe('New Name');
      expect(res.body.type).toBe(CastMemberType.ACTOR);
    });

    it('should update type', async () => {
      const { app } = buildApp();
      const created = await request(app)
        .post('/cast-members')
        .send({ name: 'Person', type: CastMemberType.ACTOR });
      const { id } = created.body;

      const res = await request(app)
        .patch(`/cast-members/${id}`)
        .send({ type: CastMemberType.DIRECTOR });

      expect(res.status).toBe(200);
      expect(res.body.type).toBe(CastMemberType.DIRECTOR);
    });

    it('should return 404 when cast member not found', async () => {
      const { app } = buildApp();
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app).patch(`/cast-members/${fakeId}`).send({ name: 'New' });

      expect(res.status).toBe(404);
    });

    it('should return 422 for invalid update data', async () => {
      const { app } = buildApp();
      const created = await request(app)
        .post('/cast-members')
        .send({ name: 'Actor', type: CastMemberType.ACTOR });
      const { id } = created.body;

      const res = await request(app)
        .patch(`/cast-members/${id}`)
        .send({ name: 'a'.repeat(256) });

      expect(res.status).toBe(422);
    });
  });

  describe('DELETE /cast-members/:id', () => {
    it('should delete a cast member and return 204', async () => {
      const { app } = buildApp();
      const created = await request(app)
        .post('/cast-members')
        .send({ name: 'Tom Hanks', type: CastMemberType.ACTOR });
      const { id } = created.body;

      const res = await request(app).delete(`/cast-members/${id}`);

      expect(res.status).toBe(204);
    });

    it('should return 404 when deleting non-existent cast member', async () => {
      const { app } = buildApp();
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app).delete(`/cast-members/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should not find cast member after deletion', async () => {
      const { app } = buildApp();
      const created = await request(app)
        .post('/cast-members')
        .send({ name: 'Tom Hanks', type: CastMemberType.ACTOR });
      const { id } = created.body;

      await request(app).delete(`/cast-members/${id}`);
      const res = await request(app).get(`/cast-members/${id}`);

      expect(res.status).toBe(404);
    });
  });
});
