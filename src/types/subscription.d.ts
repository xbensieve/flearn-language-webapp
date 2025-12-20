export interface SubscriptionPlan {
  subscriptionId: number;
  name: string;
  price: number;
  conversationQuota: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanDto {
  name: string;
  price: number;
  conversationQuota: number;
}

export interface SubscriptionResponse {
  data: SubscriptionPlan[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
