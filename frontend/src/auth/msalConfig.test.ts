import { describe, it, expect } from 'vitest';
import { loginRequest, apiScope } from '../auth/msalConfig';

describe('MSAL Configuration', () => {
  it('has login request with scopes', () => {
    expect(loginRequest.scopes).toBeDefined();
    expect(Array.isArray(loginRequest.scopes)).toBe(true);
  });

  it('has apiScope defined', () => {
    // apiScope puede estar vacío si no hay clientId configurado
    expect(typeof apiScope).toBe('string');
  });

  it('login request has prompt configured', () => {
    expect(loginRequest.prompt).toBeDefined();
  });
});
