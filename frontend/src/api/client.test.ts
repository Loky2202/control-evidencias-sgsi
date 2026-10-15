import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './client';

// Mock de fetch global
globalThis.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('makes GET requests with correct headers', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    };
    
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    await apiClient.get('/test-endpoint');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test-endpoint'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('makes POST requests with body', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    };
    
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    await apiClient.post('/test-endpoint', {
      body: JSON.stringify({ name: 'test' }),
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test-endpoint'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      })
    );
  });

  it('throws error on non-ok response', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    };
    
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    await expect(apiClient.get('/not-found')).rejects.toThrow();
  });
});
