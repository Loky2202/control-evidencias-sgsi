/**
 * Cliente API con TanStack Query
 * 
 * Seguridad:
 * - Obtiene tokens usando el scope personalizado de la API
 * - NO usa User.Read (scope de Microsoft Graph)
 * - Incluye el token Bearer en cada request
 * - Maneja refresh automático de tokens
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { msalInstance, apiTokenRequest } from '../auth/msalConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Obtiene un token de acceso para la API.
 * Usa el scope personalizado (api://<client-id>/access).
 */
async function getAccessToken(): Promise<string> {
  const accounts = msalInstance.getAllAccounts();
  
  if (accounts.length === 0) {
    throw new Error('No hay cuentas autenticadas');
  }
  
  try {
    // Intentar obtener token silenciosamente
    const response = await msalInstance.acquireTokenSilent({
      ...apiTokenRequest,
      account: accounts[0],
    });
    return response.accessToken;
  } catch (error) {
    // Si falla, intentar con popup
    console.warn('Token silencioso falló, intentando con popup...', error);
    try {
      const response = await msalInstance.acquireTokenPopup(apiTokenRequest);
      return response.accessToken;
    } catch (popupError) {
      console.error('Error al obtener token:', popupError);
      throw new Error('No se pudo obtener el token de acceso');
    }
  }
}

/**
 * Realiza una petición a la API con autenticación.
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  let token = '';
  
  try {
    token = await getAccessToken();
  } catch (error) {
    // Si no hay token, redirigir a login
    console.error('No se pudo obtener token, redirigiendo a login...');
    throw new Error('Autenticación requerida');
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
  
  // Manejar errores de autenticación
  if (response.status === 401) {
    console.error('Token inválido o expirado');
    throw new Error('Sesión expirada, por favor inicia sesión nuevamente');
  }
  
  // Manejar errores de autorización
  if (response.status === 403) {
    throw new Error('No tienes permisos para realizar esta acción');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// ================================
// Tipos
// ================================

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

// ================================
// Hooks de queries
// ================================

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

// ================================
// Mutations
// ================================

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

export function useDeleteSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) =>
      fetchApi<void>(`/submissions/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Actualizar estado de entrega (aprobar/rechazar)
export function useUpdateSubmissionStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) =>
      fetchApi<Submission>(`/submissions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Subir adjunto a una entrega
export function useUploadAttachment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ submissionId, file }: { submissionId: number; file: File }) => {
      const token = await getAccessToken();
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al subir archivo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
}

// SoA (Statement of Applicability)
export interface SoAItem {
  control_id: number;
  control_code: string;
  control_title: string;
  control_category: string;
  is_applicable: boolean;
  justification: string;
  implementation_status: string;
  requirements_count: number;
  compliant_requirements: number;
  compliance_rate: number;
}

export interface SoAResponse {
  total_controls: number;
  applicable_controls: number;
  items: SoAItem[];
  overall_compliance_rate: number;
}

export function useSoA() {
  return useQuery({
    queryKey: ['soa'],
    queryFn: () => fetchApi<SoAResponse>('/soa'),
  });
}

// Controls CRUD
export interface Control {
  id: number;
  code: string;
  title: string;
  description?: string;
  category?: string;
  created_at: string;
  updated_at?: string;
}

export function useControls(category?: string) {
  return useQuery({
    queryKey: ['controls', category],
    queryFn: () => {
      const params = category ? `?category=${category}` : '';
      return fetchApi<Control[]>(`/controls${params}`);
    },
  });
}

// API Client para uso directo (ej. en Retention page)
export const apiClient = {
  get: async (endpoint: string, options?: RequestInit) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return response;
  },
  
  post: async (endpoint: string, options?: RequestInit) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },
};
