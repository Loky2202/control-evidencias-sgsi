# Por qué Entra ID y Sites.Selected

**Fecha:** 2024-01-15  
**Decisiones:** Usar Microsoft Entra ID para autenticación y Sites.Selected para SharePoint  
**Estado:** Aprobadas

## Contexto

Necesitábamos autenticación corporativa y almacenamiento de archivos adjuntos en SharePoint, integrados con el ecosistema Microsoft 365 de la organización.

## Decisiones

### 1. Entra ID (Azure AD) para Autenticación

**Razones:**
- SSO corporativo: usuarios ya tienen cuentas Microsoft
- MFA integrado: si la empresa lo exige, Entra ID lo maneja
- Grupos y roles: mapeo directo a roles de la aplicación
- Auditoría: inicios de sesión registrados en Azure AD

**Alternativa descartada:** Auth0 (servicio externo adicional, costo duplicado)

### 2. Sites.Selected para SharePoint

**Razones:**
- Principio de menor privilegio: solo accede al sitio específico
- Seguridad: si credenciales se filtran, atacante solo accede a un sitio
- Cumplimiento ISO: demuestra control de accesos granular (POL-SI-003)

**Alternativa descartada:** Sites.ReadWrite.All (acceso a todo SharePoint, demasiado permisivo)

## Impacto

- **Positivo:** SSO, seguridad granular, cumplimiento ISO
- **Negativo:** Requiere configuración en Azure AD
- **Riesgos:** Dependencia de Microsoft 365

## Referencias

- [Entra ID Documentation](https://learn.microsoft.com/entra/)
- [SharePoint Sites.Selected](https://learn.microsoft.com/sharepoint/dev/solution-guidance/security-pnp-sharepoint-rest-api)
