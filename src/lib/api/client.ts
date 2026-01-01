import { USE_MOCK_API, API_BASE_URL } from '@/lib/utils/constants';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `API error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network error or other - will fall back to mock
    throw error;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
  mockData?: () => T
): Promise<T> {
  if (USE_MOCK_API && mockData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
    return mockData();
  }

  try {
    return await fetchApi<T>(endpoint, options);
  } catch (error) {
    // Fallback to mock if API fails
    if (mockData) {
      console.warn(`API request failed, using mock data: ${endpoint}`, error);
      return mockData();
    }
    throw error;
  }
}

