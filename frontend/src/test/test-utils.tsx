import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';

// Mock de msalInstance
const mockMsalInstance = {
  initialize: () => Promise.resolve(),
  getAllAccounts: () => [],
  acquireTokenSilent: () => Promise.resolve({ accessToken: 'mock-token' }),
  acquireTokenPopup: () => Promise.resolve({ accessToken: 'mock-token' }),
  loginPopup: () => Promise.resolve({ account: { name: 'Test User' } }),
  logoutPopup: () => Promise.resolve(),
} as unknown as PublicClientApplication;

// Crear QueryClient para tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

interface WrapperProps {
  children: React.ReactNode;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const testQueryClient = createTestQueryClient();

  function Wrapper({ children }: WrapperProps) {
    return (
      <MsalProvider instance={mockMsalInstance}>
        <QueryClientProvider client={testQueryClient}>
          {children}
        </QueryClientProvider>
      </MsalProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export { mockMsalInstance };
