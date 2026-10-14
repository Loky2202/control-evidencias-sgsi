# Configuración de Seguridad - Entra ID

Este documento describe cómo configurar Microsoft Entra ID para la autenticación y autorización de la API.

## 📋 Resumen de Seguridad Implementada

| Característica | Implementación |
|---|---|
| Validación JWT | PyJWT con JWKS de Microsoft |
| Firma | RS256 con claves públicas rotativas |
| Claims validados | `aud`, `iss`, `exp`, `nbf`, `iat` |
| Scope de API | `api://<client-id>/access` (personalizado) |
| Roles | `admin`, `auditor`, `user` |
| Docs en producción | Deshabilitados (`/api/docs`, `/api/openapi.json`) |
| Headers de seguridad | HSTS, CSP, X-Frame-Options, etc. |

## 🔧 Paso 1: Registrar la Aplicación en Azure AD

### 1.1 Crear App Registration

1. Ve a [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **App registrations**
2. Click en **New registration**
3. Configura:
   - **Name**: `Evidencias ISO 27001`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: `Single-page application (SPA)` → `https://evidencias.lan/`

### 1.2 Exponer una API (Scope personalizado)

**⚠️ CRÍTICO**: Este paso es esencial para que el sistema use su propio scope en lugar de `User.Read`.

1. En tu App Registration, ve a **Expose an API**
2. Click en **Add** junto a "Application ID URI"
3. Acepta el valor por defecto: `api://<client-id>`
4. Click en **Add a scope**:
   - **Scope name**: `access`
   - **Who can consent**: `Admins and users`
   - **Admin consent display name**: `Acceder a la API de Evidencias ISO`
   - **Admin consent description**: `Permite a la aplicación acceder a la API de gestión de evidencias`
   - **User consent display name**: `Acceder a la API`
   - **User consent description**: `Permite acceder a tus evidencias ISO`
   - **State**: `Enabled`

### 1.3 Configurar Permisos de API

1. Ve a **API permissions**
2. Click en **Add a permission** → **My APIs** → Selecciona tu aplicación
3. Selecciona el scope `access` que creaste
4. Click en **Add permissions**
5. **NO agregues** `User.Read` ni otros scopes de Microsoft Graph (no los necesitamos)

### 1.4 Configurar Roles de Aplicación

1. Ve a **App roles**
2. Click en **Create app role** y crea estos 3 roles:

#### Rol: Admin
- **Display name**: `Administrador`
- **Allowed member types**: `Users/Groups`
- **Value**: `admin`
- **Description**: `Acceso completo: crear, editar, eliminar políticas y evidencias`

#### Rol: Auditor
- **Display name**: `Auditor`
- **Allowed member types**: `Users/Groups`
- **Value**: `auditor`
- **Description**: `Solo lectura: ver tablero, políticas y evidencias`

#### Rol: User
- **Display name**: `Usuario`
- **Allowed member types**: `Users/Groups`
- **Value**: `user`
- **Description**: `Puede crear y editar sus propias evidencias`

### 1.5 Asignar Usuarios a Roles

1. Ve a **Enterprise applications** → Busca tu aplicación
2. Click en **Users and groups**
3. Click en **Add user/group**
4. Selecciona:
   - **Users or groups**: Elige un usuario o grupo
   - **Select a role**: `Administrador`, `Auditor` o `Usuario`
5. Click en **Assign**

## 🔐 Paso 2: Configurar Variables de Entorno

Actualiza tu archivo `.env` con los valores de Azure AD:

```bash
# Microsoft Entra ID
ENTRA_TENANT_ID=tu-tenant-id-aqui
ENTRA_CLIENT_ID=tu-client-id-aqui

# Scope personalizado
API_SCOPE=api://tu-client-id/access

# ⚠️ IMPORTANTE: En producción debe ser false
AUTH_DISABLED=false

# En producción
ENVIRONMENT=production
```

### Dónde encontrar estos valores:

- **ENTRA_TENANT_ID**: Azure Portal → Entra ID → Overview → Tenant ID
- **ENTRA_CLIENT_ID**: Azure Portal → Entra ID → App registrations → Tu app → Application (client) ID
- **API_SCOPE**: Se construye como `api://<ENTRA_CLIENT_ID>/access`

## 🧪 Paso 3: Probar la Autenticación

### 3.1 En Desarrollo

```bash
# El override de desarrollo tiene AUTH_DISABLED=true
docker compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

La API acepta cualquier token Bearer y devuelve un usuario de desarrollo con rol `admin`.

### 3.2 En Producción

```bash
# Sin override, AUTH_DISABLED=false por defecto
docker compose up --build -d
```

La API valida tokens JWT reales contra el JWKS de Microsoft.

### 3.3 Verificar con curl

```bash
# Obtener un token manualmente (para pruebas)
TOKEN=$(curl -X POST \
  "https://login.microsoftonline.com/$TENANT_ID/oauth2/v2.0/token" \
  -d "client_id=$CLIENT_ID" \
  -d "scope=api://$CLIENT_ID/access" \
  -d "username=usuario@dominio.com" \
  -d "password=contraseña" \
  -d "grant_type=password" | jq -r .access_token)

# Probar endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost/api/dashboard
```

## 🛡️ Headers de Seguridad

En producción, la API agrega estos headers automáticamente:

| Header | Valor | Propósito |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Previene MIME sniffing |
| `X-Frame-Options` | `DENY` | Previene clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Activa filtro XSS del navegador |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controla información del referrer |
| `Strict-Transport-Security` | `max-age=31536000` | Fuerza HTTPS |
| `Content-Security-Policy` | `default-src 'self'` | Previene inyección de scripts |

## 🔍 Auditoría de Seguridad

### Ejecutar auditorías

```bash
# Auditoría completa
make security-check

# Solo auditoría de dependencias
make audit

# Intentar corregir vulnerabilidades
make audit-fix
```

### Herramientas incluidas

- **pip-audit**: Detecta vulnerabilidades en dependencias Python
- **npm audit**: Detecta vulnerabilidades en dependencias Node.js
- **safety**: Auditoría adicional de Python (en requirements-dev.txt)

## 📊 Matriz de Permisos

| Endpoint | admin | auditor | user | Sin auth |
|---|:---:|:---:|:---:|:---:|
| `GET /api/health` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/policies` | ✅ | ✅ | ✅ | ❌ |
| `GET /api/policies/{code}` | ✅ | ✅ | ✅ | ❌ |
| `POST /api/policies` | ✅ | ❌ | ❌ | ❌ |
| `DELETE /api/policies/{code}` | ✅ | ❌ | ❌ | ❌ |
| `GET /api/requirements` | ✅ | ✅ | ✅ | ❌ |
| `GET /api/requirements/{id}` | ✅ | ✅ | ✅ | ❌ |
| `DELETE /api/requirements/{id}` | ✅ | ❌ | ❌ | ❌ |
| `POST /api/submissions` | ✅ | ❌ | ✅ | ❌ |
| `GET /api/submissions` | ✅ | ✅ | ✅ | ❌ |
| `GET /api/submissions/{id}` | ✅ | ✅ | ✅ | ❌ |
| `DELETE /api/submissions/{id}` | ✅ | ❌ | ❌ | ❌ |
| `GET /api/dashboard` | ✅ | ✅ | ✅ | ❌ |
| `GET /api/docs` | ✅ | ✅ | ✅ | ✅ (solo dev) |

## ⚠️ Consideraciones Importantes

1. **HTTPS obligatorio**: Entra ID requiere HTTPS para los redirect URIs (excepto `http://localhost`)
2. **Rotación de claves**: Microsoft rota las claves JWKS periódicamente; el sistema las actualiza automáticamente
3. **Tokens cortos**: Los access tokens de Microsoft expiran en ~1 hora; el frontend los renueva silenciosamente
4. **Caché de JWKS**: Las claves públicas se cachean por 1 hora para reducir latencia
5. **No exponer secrets**: Nunca commitees `.env` ni `requirements-dev.txt` en producción
