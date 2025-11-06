export interface PaginationI<T> {
  data: T[];
  links: { url: string | null; label: string; active: boolean }[];
}
