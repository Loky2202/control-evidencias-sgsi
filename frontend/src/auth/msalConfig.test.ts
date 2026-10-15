import { describe, it, expect, vi } from 'vitest';
import { msalConfig, loginRequest } from '../auth/msalConfig';

describe('MSAL Configuration', () => {
  it('has correct authority URL', () => {
    expect(msalConfig.auth.authority).toContain('login.microsoftonline.com');
  });

  it('has redirect URI configured', () => {
    expect(msalConfig.auth.redirectUri).toBeDefined();
  });

  it('has login request with scopes', () => {
    expect(loginRequest.scopes).toBeDefined();
    expect(Array.isArray(loginRequest.scopes)).toBe(true);
  });

  it('uses sessionStorage for cache', () => {
    expect(msalConfig.cache.cacheLocation).toBe('sessionStorage');
  });
});
