import { CastMemberFilter, ICastMemberRepository } from '../../../domain/cast-member.repository';
import { SearchParams, SortDirection } from '../../../../shared/domain/repository/repository-interface';
import { CastMemberOutput, CastMemberOutputMapper } from '../../cast-member-output';

export type SearchCastMembersInput = {
  page?: number;
  per_page?: number;
  sort?: string | null;
  sort_dir?: SortDirection | null;
  filter?: CastMemberFilter | null;
};

export type SearchCastMembersOutput = {
  items: CastMemberOutput[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
  sort: string | null;
  sort_dir: SortDirection | null;
  filter: CastMemberFilter | null;
};

export class SearchCastMembersUseCase {
  constructor(private readonly castMemberRepo: ICastMemberRepository) {}

  async execute(input: SearchCastMembersInput): Promise<SearchCastMembersOutput> {
    const params = new SearchParams<CastMemberFilter>(input);
    const result = await this.castMemberRepo.search(params);

    return {
      items: result.items.map(CastMemberOutputMapper.toOutput),
      total: result.total,
      current_page: result.current_page,
      per_page: result.per_page,
      last_page: result.last_page,
      sort: result.sort,
      sort_dir: result.sort_dir,
      filter: result.filter,
    };
  }
}
