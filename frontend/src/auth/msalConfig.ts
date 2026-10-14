/**
 * Configuración de MSAL para autenticación con Entra ID
 * 
 * Seguridad:
 * - Usa scope personalizado de la API (api://<client-id>/access)
 * - NO usa User.Read (permiso de Microsoft Graph)
 * - El scope debe registrarse en Azure AD como "Expose an API"
 */
import { PublicClientApplication, LogLevel } from '@azure/msal-browser';

// Obtener configuración desde variables de entorno
const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID || '';
const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID || '';

// Scope personalizado para nuestra API
// Formato: api://<client-id>/access
// Debe coincidir con el scope registrado en Azure AD
const apiScope = clientId ? `api://${clientId}/access` : '';

const msalConfig = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
    // Requerir interacción para la primera autenticación
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage', // Más seguro que localStorage
    storeAuthStateInCookie: false,
    secureCookies: true, // Solo en HTTPS
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error('[MSAL]', message);
            break;
          case LogLevel.Warning:
            console.warn('[MSAL]', message);
            break;
          case LogLevel.Info:
            console.info('[MSAL]', message);
            break;
          default:
            console.debug('[MSAL]', message);
        }
      },
      logLevel: import.meta.env.DEV ? LogLevel.Warning : LogLevel.Error,
    },
  },
};

// Configuración de login
const loginRequest = {
  scopes: [
    apiScope, // Scope personalizado de nuestra API
    // NO incluir User.Read - no lo necesitamos
  ],
  // Prompt para forzar selección de cuenta si es necesario
  prompt: 'select_account',
};

// Configuración para obtener token de la API
const apiTokenRequest = {
  scopes: [apiScope],
  // Forzar interacción si el token está por expirar
  forceRefresh: false,
};

// Exportar configuración
export const msalInstance = new PublicClientApplication(msalConfig);
export { loginRequest, apiTokenRequest, apiScope };

// Validar configuración en desarrollo
if (import.meta.env.DEV) {
  if (!clientId) {
    console.warn('⚠️ VITE_ENTRA_CLIENT_ID no configurado');
  }
  if (!tenantId) {
    console.warn('⚠️ VITE_ENTRA_TENANT_ID no configurado');
  }
  if (!apiScope) {
    console.warn('⚠️ Scope de API no configurado (clientId faltante)');
  }
}
