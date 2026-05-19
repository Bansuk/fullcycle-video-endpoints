import { InMemorySearchableRepository } from '../../../../shared/domain/repository/in-memory.repository';
import { SearchParams, SearchResult } from '../../../../shared/domain/repository/repository-interface';
import { CastMember } from '../../../domain/cast-member.entity';
import { CastMemberFilter, ICastMemberRepository } from '../../../domain/cast-member.repository';

export class CastMemberInMemoryRepository
  extends InMemorySearchableRepository<CastMember, CastMemberFilter>
  implements ICastMemberRepository
{
  sortableFields = ['name', 'created_at'];

  protected async applyFilter(
    items: CastMember[],
    filter: CastMemberFilter | null,
  ): Promise<CastMember[]> {
    if (!filter) return items;

    return items.filter(item => {
      const nameMatch = filter.name
        ? item.name.toLowerCase().includes(filter.name.toLowerCase())
        : true;
      const typeMatch = filter.type !== undefined && filter.type !== null
        ? item.type === filter.type
        : true;
      return nameMatch && typeMatch;
    });
  }

  async search(
    params: SearchParams<CastMemberFilter>,
  ): Promise<SearchResult<CastMember, CastMemberFilter>> {
    return super.search(params);
  }
}
