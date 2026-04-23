export interface ApiQueryParams {
  query?: {
    include?: Record<string, unknown>;
    select?: Record<string, unknown>;
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown> | Record<string, unknown>[];
    cursor?: Record<string, unknown>;
    distinct?: Record<string, unknown>;
  };
  perPage?: number;
  page?: number;
}

interface Link {
  first: string;
  last: string;
  next?: string | null;
  prev?: string | null;
}

interface MetaLink {
  active: boolean;
  label: string;
  url?: string | null;
}

interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
  links: MetaLink[];
  prev?: number | null;
  next?: number | null;
}

export interface Pagination<T> {
  data: T[];
  links: Link;
  meta: Meta;
}
