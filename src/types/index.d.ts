/* eslint-disable @typescript-eslint/no-explicit-any */
// Ensure this file is included in tsconfig.json under "include": ["src"]
// Example: "include": ["src", "src/index.d.ts"]

declare namespace API {
  // Generic response wrapper
  interface Response<T> {
    success: boolean;
    code: number;
    message: string;
    data: T;
    pagination: {
      currentPage: number
      pageSize: number
      totalUsers: number
      totalPages: number
    }
    errors: any
    meta: {
      page?: number;
      pageSize?: number;
      totalItems?: number;
      totalPages?: number;
    }
  }
}
