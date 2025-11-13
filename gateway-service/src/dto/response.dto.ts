interface Response {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
  meta: PaginationMeta;
}

interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}
