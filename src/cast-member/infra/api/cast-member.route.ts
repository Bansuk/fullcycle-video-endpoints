import { Router, Request, Response } from 'express';
import { ICastMemberRepository } from '../../domain/cast-member.repository';
import { CastMemberType } from '../../domain/cast-member.entity';
import { CreateCastMemberUseCase } from '../../application/use-cases/create-cast-member/create-cast-member.use-case';
import { GetCastMemberUseCase } from '../../application/use-cases/get-cast-member/get-cast-member.use-case';
import { UpdateCastMemberUseCase } from '../../application/use-cases/update-cast-member/update-cast-member.use-case';
import { DeleteCastMemberUseCase } from '../../application/use-cases/delete-cast-member/delete-cast-member.use-case';
import { SearchCastMembersUseCase } from '../../application/use-cases/search-cast-members/search-cast-members.use-case';
import { EntityValidationError } from '../../../shared/domain/errors/validation.error';

type IdParam = { id: string };

export function castMemberRouter(repo: ICastMemberRepository): Router {
  const router = Router();

  const createUseCase = new CreateCastMemberUseCase(repo);
  const getUseCase = new GetCastMemberUseCase(repo);
  const updateUseCase = new UpdateCastMemberUseCase(repo);
  const deleteUseCase = new DeleteCastMemberUseCase(repo);
  const searchUseCase = new SearchCastMembersUseCase(repo);

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
      const { page, per_page, sort, sort_dir } = req.query;
      const rawFilterName = req.query['filter[name]'];
      const rawFilterType = req.query['filter[type]'];
      const filterName = typeof rawFilterName === 'string' ? rawFilterName : undefined;
      const filterType = typeof rawFilterType === 'string' ? rawFilterType : undefined;

      const filter =
        filterName !== undefined || filterType !== undefined
          ? {
              name: filterName,
              type: filterType !== undefined ? (Number(filterType) as CastMemberType) : undefined,
            }
          : null;

      const output = await searchUseCase.execute({
        page: typeof page === 'string' ? Number(page) : undefined,
        per_page: typeof per_page === 'string' ? Number(per_page) : undefined,
        sort: typeof sort === 'string' ? sort : null,
        sort_dir: typeof sort_dir === 'string' ? (sort_dir as 'asc' | 'desc') : null,
        filter,
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
