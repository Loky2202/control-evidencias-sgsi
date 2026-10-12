/**
 * Cliente API con TanStack Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { msalInstance } from '../auth/msalConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const accounts = msalInstance.getAllAccounts();
  let token = '';
  
  if (accounts.length > 0) {
    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes: ['User.Read'],
        account: accounts[0],
      });
      token = response.accessToken;
    } catch (error) {
      console.error('Error acquiring token:', error);
    }
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Tipos
export interface Policy {
  id: number;
  code: string;
  title: string;
  description?: string;
  version: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface Requirement {
  id: number;
  code: string;
  title: string;
  description?: string;
  frequency: string;
  policy_code: string;
  control_id?: number;
  last_evidence_date?: string;
  next_due_date?: string;
  alert_status: 'Pendiente' | 'Vigente' | 'Por vencer' | 'Vencida';
}

export interface Submission {
  id: number;
  requirement_id: number;
  evidence_date: string;
  status: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: number;
  filename: string;
  file_size?: number;
  content_type?: string;
  sharepoint_url?: string;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface Dashboard {
  total_requirements: number;
  status_counts: Array<{ status: string; count: number }>;
  policy_summaries: Array<{
    policy_code: string;
    policy_title: string;
    total_requirements: number;
    compliant: number;
    non_compliant: number;
    compliance_rate: number;
  }>;
  overall_compliance_rate: number;
}

// Hooks de queries
export function usePolicies() {
  return useQuery({
    queryKey: ['policies'],
    queryFn: () => fetchApi<{ policies: Policy[]; total: number }>('/policies'),
  });
}

export function useRequirements(policyCode?: string) {
  return useQuery({
    queryKey: ['requirements', policyCode],
    queryFn: () => {
      const params = policyCode ? `?policy_code=${policyCode}` : '';
      return fetchApi<Requirement[]>(`/requirements${params}`);
    },
  });
}

export function useRequirement(id: number) {
  return useQuery({
    queryKey: ['requirement', id],
    queryFn: () => fetchApi<Requirement>(`/requirements/${id}`),
    enabled: id > 0,
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchApi<Dashboard>('/dashboard'),
  });
}

export function useSubmissions(requirementId?: number) {
  return useQuery({
    queryKey: ['submissions', requirementId],
    queryFn: () => {
      const params = requirementId ? `?requirement_id=${requirementId}` : '';
      return fetchApi<Submission[]>(`/submissions${params}`);
    },
  });
}

// Mutations
export function useCreateSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { requirement_id: number; evidence_date: string; notes?: string }) =>
      fetchApi<Submission>('/submissions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
