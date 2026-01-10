import api from '@utils/http/request';
import { SubscriptionPlans } from '@utils/types/subscriptionTypes';

//
export const getClientPackages = async (): Promise<SubscriptionPlans> => {
  try {
    console.log('calling package service');
    const response = await api.get('/client-subscription-plan');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
//
export const activeNewPackage = async (
  clientSubscriptionPlanId: string
): Promise<any> => {
  try {
    const response = await api.post('/client-subscription', {
      clientSubscriptionPlanId,
    });

    return response.data.data;
  } catch (error) {
    throw error;
  }
};
