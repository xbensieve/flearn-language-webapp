// Ensure this file is included in tsconfig.json under "include": ["src"]
// Example: "include": ["src", "src/index.d.ts"]

declare namespace API {
  // Generic response wrapper
  interface Response<T> {
    success: boolean;
    message: string;
    data: T;
    pagination: {
      currentPage: number
      pageSize: number
      totalUsers: number
      totalPages: number
    }
  }
}
