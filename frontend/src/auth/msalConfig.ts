/**
 * Configuración de MSAL para autenticación con Entra ID
 */
import { PublicClientApplication, LogLevel } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_TENANT_ID || ''}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          default:
            console.log(message);
        }
      },
    },
  },
};

const loginRequest = {
  scopes: ['User.Read'],
};

const graphTokenRequest = {
  scopes: ['User.Read'],
};

export const msalInstance = new PublicClientApplication(msalConfig);
export { loginRequest, graphTokenRequest };
