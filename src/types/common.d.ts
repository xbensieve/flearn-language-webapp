export namespace API {
  export interface Response<T> {
    meta?: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
    status: string;
    code: number;
    message: string;
    data: T;
    errors?: string;
  }
}
