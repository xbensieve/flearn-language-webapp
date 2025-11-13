export interface CreateProgramPayload {
  languageId: string;
  name: string;
  description?: string;
}

export interface UpdateProgramPayload {
  name?: string;
  description?: string;
  status?: boolean;
}

export interface ProgramQueryParams {
  languageId?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export type ProgramList = {
  data: Program[]
}

export interface Program {
  programId: string
  languageId: string
  languageName: string
  name: string
  description: string
  status: boolean
  createdAt: string
  updatedAt: string
  levels: Level[]
}

export interface Level {
  levelId: string
  name: string
  description: string
  orderIndex: number
  status: boolean
}