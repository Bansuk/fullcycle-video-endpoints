import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import { CategoryInMemoryRepository } from '../../db/in-memory/category-in-memory.repository';
import { categoryRouter } from '../category.route';

function buildApp() {
  const repo = new CategoryInMemoryRepository();
  const app = express();
  app.use(express.json());
  app.use('/categories', categoryRouter(repo));
  return { app, repo };
}

describe('Category Routes E2E', () => {
  describe('POST /categories', () => {
    it('should create a category and return 201', async () => {
      const { app } = buildApp();
      const res = await request(app).post('/categories').send({ name: 'Movie' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: 'Movie',
        description: null,
        is_active: true,
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.created_at).toBeDefined();
    });

    it('should create a category with all fields', async () => {
      const { app } = buildApp();
      const res = await request(app).post('/categories').send({
        name: 'Documentary',
        description: 'Doc films',
        is_active: false,
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: 'Documentary',
        description: 'Doc films',
        is_active: false,
      });
    });

    it('should return 422 when name is missing', async () => {
      const { app } = buildApp();
      const res = await request(app).post('/categories').send({});

      expect(res.status).toBe(422);
      expect(res.body.message).toBe('Validation Error');
      expect(res.body.errors).toBeDefined();
    });

    it('should return 422 when name exceeds 255 characters', async () => {
      const { app } = buildApp();
      const res = await request(app)
        .post('/categories')
        .send({ name: 'a'.repeat(256) });

      expect(res.status).toBe(422);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /categories', () => {
    it('should list categories with default pagination', async () => {
      const { app } = buildApp();
      await request(app).post('/categories').send({ name: 'Movie' });
      await request(app).post('/categories').send({ name: 'Series' });

      const res = await request(app).get('/categories');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.total).toBe(2);
      expect(res.body.current_page).toBe(1);
      expect(res.body.per_page).toBe(15);
    });

    it('should filter categories by name', async () => {
      const { app } = buildApp();
      await request(app).post('/categories').send({ name: 'Movie' });
      await request(app).post('/categories').send({ name: 'Series' });

      const res = await request(app).get('/categories?filter=Movie');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].name).toBe('Movie');
    });

    it('should sort categories by name asc', async () => {
      const { app } = buildApp();
      await request(app).post('/categories').send({ name: 'Zebra' });
      await request(app).post('/categories').send({ name: 'Alpha' });

      const res = await request(app).get('/categories?sort=name&sort_dir=asc');

      expect(res.status).toBe(200);
      expect(res.body.items[0].name).toBe('Alpha');
      expect(res.body.items[1].name).toBe('Zebra');
    });

    it('should paginate results', async () => {
      const { app } = buildApp();
      for (let i = 1; i <= 5; i++) {
        await request(app).post('/categories').send({ name: `Cat ${i}` });
      }

      const res = await request(app).get('/categories?page=1&per_page=2');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.total).toBe(5);
      expect(res.body.last_page).toBe(3);
    });
  });

  describe('GET /categories/:id', () => {
    it('should return a category by id', async () => {
      const { app } = buildApp();
      const created = await request(app).post('/categories').send({ name: 'Movie' });
      const { id } = created.body;

      const res = await request(app).get(`/categories/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.name).toBe('Movie');
    });

    it('should return 404 for non-existent id', async () => {
      const { app } = buildApp();
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app).get(`/categories/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('PATCH /categories/:id', () => {
    it('should update a category and return 200', async () => {
      const { app } = buildApp();
      const created = await request(app).post('/categories').send({ name: 'Old Name' });
      const { id } = created.body;

      const res = await request(app).patch(`/categories/${id}`).send({ name: 'New Name' });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.name).toBe('New Name');
    });

    it('should update description and is_active', async () => {
      const { app } = buildApp();
      const created = await request(app).post('/categories').send({ name: 'Movie' });
      const { id } = created.body;

      const res = await request(app)
        .patch(`/categories/${id}`)
        .send({ description: 'Updated desc', is_active: false });

      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated desc');
      expect(res.body.is_active).toBe(false);
    });

    it('should return 404 when category not found', async () => {
      const { app } = buildApp();
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app).patch(`/categories/${fakeId}`).send({ name: 'New' });

      expect(res.status).toBe(404);
    });

    it('should return 422 for invalid update data', async () => {
      const { app } = buildApp();
      const created = await request(app).post('/categories').send({ name: 'Movie' });
      const { id } = created.body;

      const res = await request(app)
        .patch(`/categories/${id}`)
        .send({ name: 'a'.repeat(256) });

      expect(res.status).toBe(422);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should delete a category and return 204', async () => {
      const { app } = buildApp();
      const created = await request(app).post('/categories').send({ name: 'Movie' });
      const { id } = created.body;

      const res = await request(app).delete(`/categories/${id}`);

      expect(res.status).toBe(204);
    });

    it('should return 404 when deleting non-existent category', async () => {
      const { app } = buildApp();
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app).delete(`/categories/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should not find category after deletion', async () => {
      const { app } = buildApp();
      const created = await request(app).post('/categories').send({ name: 'Movie' });
      const { id } = created.body;

      await request(app).delete(`/categories/${id}`);
      const res = await request(app).get(`/categories/${id}`);

      expect(res.status).toBe(404);
    });
  });
});
