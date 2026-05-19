import {
  ISearchableRepository,
  SearchParams,
  SearchResult,
} from '../../shared/domain/repository/repository-interface';
import { CastMember, CastMemberType } from './cast-member.entity';

export type CastMemberFilter = {
  name?: string;
  type?: CastMemberType;
};

export type CastMemberSearchParams = SearchParams<CastMemberFilter>;

export type CastMemberSearchResult = SearchResult<CastMember, CastMemberFilter>;

export interface ICastMemberRepository
  extends ISearchableRepository<CastMember, CastMemberFilter, CastMemberSearchResult> {}
