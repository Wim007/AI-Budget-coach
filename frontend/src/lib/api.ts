const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Er is een fout opgetreden.');
  }

  return data as T;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: {
      name: string;
      email: string;
      password: string;
      profile_type: string;
      monthly_income: number;
    }) =>
      request<{ token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  profile: {
    get: () => request<any>('/api/profile'),
    update: (data: any) =>
      request<any>('/api/profile', { method: 'PUT', body: JSON.stringify(data) }),
    addFixedCost: (data: { name: string; amount: number; category: string }) =>
      request<any>('/api/profile/fixed-costs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteFixedCost: (id: number) =>
      request<any>(`/api/profile/fixed-costs/${id}`, { method: 'DELETE' }),
  },

  transactions: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ transactions: any[]; total: number }>(`/api/transactions${qs}`);
    },
    create: (data: { date: string; description: string; amount: number; category?: string }) =>
      request<any>('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
    updateCategory: (id: number, category: string) =>
      request<any>(`/api/transactions/${id}/category`, {
        method: 'PUT',
        body: JSON.stringify({ category }),
      }),
    delete: (id: number) =>
      request<any>(`/api/transactions/${id}`, { method: 'DELETE' }),
    syncBank: () =>
      request<{ message: string; imported: number }>('/api/transactions/sync-bank', {
        method: 'POST',
      }),
    uploadCsv: async (file: File) => {
      const token = getToken();
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/api/transactions/upload-csv`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      return res.json();
    },
  },

  budget: {
    getWeek: () =>
      request<{ budget: any; categories: any[] }>('/api/budget/week'),
    getCategories: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<any[]>(`/api/budget/categories${qs}`);
    },
  },

  coach: {
    getAdvice: () => request<any>('/api/coach/advice'),
  },
};
