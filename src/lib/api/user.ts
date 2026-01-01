import { Portfolio } from '@/lib/types/user';
import { apiRequest } from './client';
import { mockPortfolio } from '@/lib/mocks/userData';

export async function getUserPortfolio(userAddress: string): Promise<Portfolio> {
  return apiRequest<Portfolio>(
    `/user/portfolio/${userAddress}`,
    { method: 'GET' },
    () => mockPortfolio
  );
}

