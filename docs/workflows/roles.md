# Roles y Permisos del Sistema

## Resumen

El sistema implementa un modelo de control de acceso basado en roles (RBAC) con tres roles principales: **Usuario**, **Auditor** y **Administrador**. Cada rol tiene permisos específicos sobre los recursos del sistema.

## Matriz de Permisos

### Políticas (POL-SI-*)

| Acción | Usuario | Auditor | Admin | Sin Auth |
|--------|:-------:|:-------:|:-----:|:--------:|
| Listar políticas | ✅ | ✅ | ✅ | ❌ |
| Ver política | ✅ | ✅ | ✅ | ❌ |
| Crear política | ❌ | ❌ | ✅ | ❌ |
| Actualizar política | ❌ | ❌ | ✅ | ❌ |
| Eliminar política | ❌ | ❌ | ✅ | ❌ |

### Requisitos (EV-*)

| Acción | Usuario | Auditor | Admin | Sin Auth |
|--------|:-------:|:-------:|:-----:|:--------:|
| Listar requisitos | ✅ | ✅ | ✅ | ❌ |
| Ver requisito | ✅ | ✅ | ✅ | ❌ |
| Crear requisito | ❌ | ❌ | ✅ | ❌ |
| Actualizar requisito | ❌ | ❌ | ✅ | ❌ |
| Eliminar requisito | ❌ | ❌ | ✅ | ❌ |

### Controles ISO 27001 (A.*)

| Acción | Usuario | Auditor | Admin | Sin Auth |
|--------|:-------:|:-------:|:-----:|:--------:|
| Listar controles | ✅ | ✅ | ✅ | ❌ |
| Ver control | ✅ | ✅ | ✅ | ❌ |
| Crear control | ❌ | ❌ | ✅ | ❌ |
| Actualizar control | ❌ | ❌ | ✅ | ❌ |
| Eliminar control | ❌ | ❌ | ✅ | ❌ |

### Entregas de Evidencia

| Acción | Usuario | Auditor | Admin | Sin Auth |
|--------|:-------:|:-------:|:-----:|:--------:|
| Listar entregas | ✅ | ✅ | ✅ | ❌ |
| Ver entrega | ✅ | ✅ | ✅ | ❌ |
| Crear entrega | ✅ | ❌ | ✅ | ❌ |
| Subir adjuntos | ✅ | ❌ | ✅ | ❌ |
| Aprobar/Rechazar | ❌ | ✅ | ✅ | ❌ |
| Eliminar entrega | ❌ | ❌ | ✅ | ❌ |

### Tablero y Reportes

| Acción | Usuario | Auditor | Admin | Sin Auth |
|--------|:-------:|:-------:|:-----:|:--------:|
| Ver tablero | ✅ | ✅ | ✅ | ❌ |
| Ver SoA | ✅ | ✅ | ✅ | ❌ |
| Exportar SoA (CSV) | ❌ | ✅ | ✅ | ❌ |
| Exportar audit log (Excel/PDF) | ❌ | ✅ | ✅ | ❌ |
| Exportar entregas (Excel) | ❌ | ✅ | ✅ | ❌ |
| Ver política de retención | ❌ | ✅ | ✅ | ❌ |
| Ver resumen de retención | ❌ | ✅ | ✅ | ❌ |
| Ejecutar limpieza de retención | ❌ | ❌ | ✅ | ❌ |

### Endpoints Públicos

| Acción | Usuario | Auditor | Admin | Sin Auth |
|--------|:-------:|:-------:|:-----:|:--------:|
| Health check (/api/health) | ✅ | ✅ | ✅ | ✅ |
| Root (/) | ✅ | ✅ | ✅ | ✅ |
| Documentación (/api/docs) | ✅ | ✅ | ✅ | ✅ (solo dev) |

## Descripción de Roles

### Usuario (user)

**Perfil:** Personal operativo que genera evidencias de cumplimiento.

**Responsabilidades:**
- Crear entregas de evidencia para requisitos asignados
- Subir archivos adjuntos (PDF, imágenes, documentos)
- Consultar el estado de sus entregas
- Ver el tablero de cumplimiento general

**Limitaciones:**
- No puede aprobar o rechazar entregas
- No puede modificar políticas, requisitos o controles
- No puede exportar reportes de auditoría
- No puede eliminar registros

**Casos de uso típicos:**
- Subir evidencia de revisión trimestral de accesos
- Documentar capacitación en seguridad informática
- Evidenciar backup exitoso de base de datos

### Auditor (auditor)

**Perfil:** Personal de auditoría interna o consultor externo que revisa y aprueba evidencias.

**Responsabilidades:**
- Revisar entregas pendientes de aprobación
- Aprobar o rechazar evidencias con comentarios
- Exportar reportes para auditorías externas
- Consultar la Declaración de Aplicabilidad (SoA)
- Monitorear el cumplimiento general

**Limitaciones:**
- No puede crear entregas (solo las revisa)
- No puede modificar políticas, requisitos o controles
- No puede eliminar registros
- No puede ejecutar limpieza de retención

**Casos de uso típicos:**
- Revisar y aprobar evidencias del Q1 2024
- Exportar log de auditoría para certificación ISO
- Generar reporte de cumplimiento para la dirección

### Administrador (admin)

**Perfil:** Personal de TI o responsable del sistema con acceso completo.

**Responsabilidades:**
- Todas las capacidades de Usuario y Auditor
- Gestionar políticas, requisitos y controles (CRUD completo)
- Eliminar registros (entregas, políticas, etc.)
- Ejecutar limpieza de retención de evidencias
- Configurar el sistema

**Limitaciones:**
- Ninguna (acceso completo al sistema)

**Casos de uso típicos:**
- Crear nueva política de seguridad POL-SI-010
- Agregar requisito EV-060 para nuevo control ISO
- Eliminar entrega duplicada por error
- Ejecutar limpieza anual de evidencias expiradas

## Asignación de Roles

### Desde Azure AD (Entra ID)

Los roles se mapean desde grupos de Azure AD:

```
Azure AD Group: "Evidencias-ISO-Admin"    → Rol: admin
Azure AD Group: "Evidencias-ISO-Auditor"  → Rol: auditor
Azure AD Group: "Evidencias-ISO-User"     → Rol: user
```

### Configuración en Azure AD

1. Ir a **Azure Portal** → **Microsoft Entra ID** → **App registrations**
2. Seleccionar la aplicación "Evidencias ISO 27001"
3. Ir a **App roles** y crear los roles:
   - `admin` - Administrador
   - `auditor` - Auditor
   - `user` - Usuario
4. Ir a **Enterprise applications** → **Users and groups**
5. Asignar usuarios/grupos a los roles

### Desarrollo Local

En modo desarrollo (`AUTH_DISABLED=true`), todos los usuarios tienen rol `admin` para facilitar pruebas.

## Implementación Técnica

### Validación en la API

```python
from app.auth.dependencies import get_current_user, require_role, require_admin, require_auditor

# Cualquier usuario autenticado
@router.get("/policies")
def list_policies(current_user: dict = Depends(get_current_user)):
    ...

# Solo auditor o admin
@router.get("/reports/audit-log/excel")
def export_audit_log(current_user: dict = Depends(require_auditor)):
    ...

# Solo admin
@router.post("/policies")
def create_policy(current_user: dict = Depends(require_admin)):
    ...

# Múltiples roles permitidos
@router.patch("/submissions/{id}")
def approve_submission(current_user: dict = Depends(require_role("auditor", "admin"))):
    ...
```

### Extracción de Rol del Token JWT

El rol se extrae del claim `roles` del token JWT de Entra ID:

```python
def _extract_roles_from_token(decoded: dict) -> str:
    roles = decoded.get("roles", [])
    if isinstance(roles, list):
        for role in roles:
            if role.lower() in VALID_ROLES:
                return role.lower()
    return "user"  # Default
```

## Auditoría de Cambios de Rol

Los cambios de rol quedan registrados en `audit_log`:

```sql
SELECT 
  created_at,
  action,
  description,
  user_email,
  user_role
FROM audit_log
WHERE action = 'role_change'
ORDER BY created_at DESC;
```

## Consideraciones de Seguridad

1. **Principio de menor privilegio**: Cada rol tiene solo los permisos necesarios
2. **Separación de funciones**: Auditor no puede crear evidencias (evita conflicto de interés)
3. **Audit trail**: Todas las acciones críticas quedan registradas
4. **Inmutabilidad de logs**: Los logs de auditoría no pueden ser modificados
5. **Tokens de corta duración**: Access tokens expiran en ~1 hora

## Escalabilidad Futura

El modelo de roles puede extenderse para incluir:

- **Read-only**: Solo lectura, sin capacidad de crear entregas
- **Compliance Officer**: Puede aprobar y exportar, pero no eliminar
- **External Auditor**: Acceso temporal para auditorías de certificación

Para agregar un nuevo rol:

1. Agregar el rol en `VALID_ROLES` en `app/auth/dependencies.py`
2. Crear el App Role en Azure AD
3. Asignar permisos en los routers correspondientes
4. Actualizar esta documentación

## Referencias

- ISO 27001 Control A.5.15 (Access control)
- ISO 27001 Control A.5.16 (Identity management)
- ISO 27001 Control A.5.18 (Access rights)
- docs/security/entra-id-setup.md
