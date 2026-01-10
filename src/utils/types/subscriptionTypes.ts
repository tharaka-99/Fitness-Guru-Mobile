export type SubscriptionPlan = {
  _id: string;
  benefits: string[];
  createdAt: string;
  name: string;
  price: number;
  updatedAt: string;
};

// Define an array type for multiple subscription plans
export type SubscriptionPlans = SubscriptionPlan[];

type Status = 'active' | 'inactive' | 'expired';

export interface Subscription {
  clientId: string;
  clientSubscriptionPlanId: string;
  activatedAt: string;
  expiredAt: string;
  paymentId: string;
  status: Status;
}
