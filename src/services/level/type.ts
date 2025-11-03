export interface Level {
levelId: string;
programId: string;
name: string;
description: string;
orderIndex: number;
status: boolean;
createdAt: string;
updatedAt: string;
}


export interface CreateLevelPayload {
programId: string;
name: string;
description: string;
orderIndex: number;
}


export interface UpdateLevelPayload {
name: string;
description: string;
orderIndex: number;
status: boolean;
}


export interface PaginationMeta {
total: number;
page: number;
pageSize: number;
}


export interface PaginatedLevelResponse {
data: Level[];
meta: PaginationMeta;
}