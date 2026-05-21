import { Router, Request, Response } from 'express';
import { ICategoryRepository } from '../../domain/category.repository';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category/create-category.use-case';
import { GetCategoryUseCase } from '../../application/use-cases/get-category/get-category.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/delete-category/delete-category.use-case';
import { SearchCategoriesUseCase } from '../../application/use-cases/search-categories/search-categories.use-case';
import { EntityValidationError } from '../../../shared/domain/errors/validation.error';

type IdParam = { id: string };

export function categoryRouter(repo: ICategoryRepository): Router {
  const router = Router();

  const createUseCase = new CreateCategoryUseCase(repo);
  const getUseCase = new GetCategoryUseCase(repo);
  const updateUseCase = new UpdateCategoryUseCase(repo);
  const deleteUseCase = new DeleteCategoryUseCase(repo);
  const searchUseCase = new SearchCategoriesUseCase(repo);

  router.post('/', async (req: Request, res: Response) => {
    try {
      const output = await createUseCase.execute(req.body);
      res.status(201).json(output);
    } catch (e) {
      if (e instanceof EntityValidationError) {
        res.status(422).json({ message: e.message, errors: e.error });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  });

  router.get('/', async (req: Request, res: Response) => {
    try {
      const { page, per_page, sort, sort_dir, filter } = req.query;
      const output = await searchUseCase.execute({
        page: typeof page === 'string' ? Number(page) : undefined,
        per_page: typeof per_page === 'string' ? Number(per_page) : undefined,
        sort: typeof sort === 'string' ? sort : null,
        sort_dir: typeof sort_dir === 'string' ? (sort_dir as 'asc' | 'desc') : null,
        filter: typeof filter === 'string' ? filter : null,
      });
      res.json(output);
    } catch (e) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/:id', async (req: Request<IdParam>, res: Response) => {
    try {
      const output = await getUseCase.execute({ id: req.params.id });
      res.json(output);
    } catch (e) {
      if (e instanceof Error && e.message.includes('not found')) {
        res.status(404).json({ message: e.message });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  });

  router.patch('/:id', async (req: Request<IdParam>, res: Response) => {
    try {
      const output = await updateUseCase.execute({ id: req.params.id, ...req.body });
      res.json(output);
    } catch (e) {
      if (e instanceof EntityValidationError) {
        res.status(422).json({ message: e.message, errors: e.error });
      } else if (e instanceof Error && e.message.includes('not found')) {
        res.status(404).json({ message: e.message });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  });

  router.delete('/:id', async (req: Request<IdParam>, res: Response) => {
    try {
      await deleteUseCase.execute({ id: req.params.id });
      res.status(204).send();
    } catch (e) {
      if (e instanceof Error && e.message.includes('not found')) {
        res.status(404).json({ message: e.message });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  });

  return router;
}
