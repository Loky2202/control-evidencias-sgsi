# Política de Retención de Evidencias ISO 27001

## Resumen Ejecutivo

Este documento define la política de retención de evidencias del sistema de gestión ISO 27001, asegurando el cumplimiento de regulaciones y optimizando el almacenamiento.

## Períodos de Retención

| Tipo de Evidencia | Período de Retención | Justificación |
|-------------------|---------------------|---------------|
| **Evidencias Completas** | 7 años | Regulaciones ISO 27001 y auditorías de certificación |
| **Evidencias Rechazadas** | 2 años | Historial de no conformidades y acciones correctivas |
| **Evidencias Pendientes** | 1 año | Evidencias sin actividad o abandonadas |
| **Logs de Auditoría** | 10 años | Regulación legal y trazabilidad de seguridad |

## Implementación Técnica

### 1. Restricciones de Base de Datos

El usuario de la aplicación (`evidencias_app`) tiene permisos limitados sobre la tabla `audit_log`:

```sql
-- Solo puede INSERTAR, NUNCA modificar o eliminar
REVOKE UPDATE, DELETE ON audit_log FROM evidencias_app;
```

**Justificación**: Garantiza la integridad e inmutabilidad de los logs de auditoría, requisito fundamental de ISO 27001 (Control A.12.4).

### 2. Servicio de Retención

El módulo `backend/app/services/retention.py` implementa:

- `get_retention_policy()`: Obtiene la política actual
- `get_retention_summary()`: Resumen de evidencias por estado
- `cleanup_expired_submissions()`: Limpieza automática con opción dry-run
- `get_expiring_submissions()`: Alerta de evidencias próximas a expirar

### 3. Endpoints de API

```bash
# Obtener política de retención
GET /api/reports/retention/policy

# Obtener resumen de retención
GET /api/reports/retention/summary

# Ejecutar limpieza (solo admin)
POST /api/reports/retention/cleanup?dry_run=true|false
```

### 4. Script de Limpieza Programada

El script `scripts/cleanup_retention.sh` permite:

```bash
# Simulación (no elimina nada)
./scripts/cleanup_retention.sh

# Ejecución real
./scripts/cleanup_retention.sh --execute
```

**Programación con cron** (ejecutar cada domingo a las 2 AM):
```bash
0 2 * * 0 /path/to/scripts/cleanup_retention.sh --execute >> /var/log/evidencias-cleanup.log 2>&1
```

## Flujo de Auditoría

### Registro Atómico

Todas las acciones críticas se registran en `audit_log` dentro de la misma transacción que la operación principal:

```python
# Ejemplo: Crear entrega + registrar auditoría (atómico)
db.add(new_submission)
log_action(db, action="create", ...)  # Sin commit propio
db.commit()  # Commit atómico: submission + audit_log
```

### Middleware de Auditoría

El middleware `AuditMiddleware` captura automáticamente:
- Logins exitosos
- Descargas de archivos
- Errores de autenticación (401/403)
- Exportaciones de reportes

### Contexto de Request

Cada registro de auditoría incluye:
- `ip_address`: IP del cliente (respeta X-Forwarded-For)
- `user_agent`: Navegador/dispositivo del usuario
- `user_email`: Email del usuario autenticado
- `user_role`: Rol del usuario (admin/auditor/user)
- `action`: Tipo de acción (create/update/delete/login/download/export)
- `resource_type`: Tipo de recurso afectado
- `resource_id`: ID del recurso
- `description`: Descripción legible de la acción
- `details`: Detalles adicionales en JSON

## Exportación de Reportes

### Para Auditores

Los auditores pueden exportar:

1. **Log de Auditoría (Excel)**
   ```bash
   GET /api/reports/audit-log/excel?start_date=2024-01-01&end_date=2024-12-31
   ```

2. **Log de Auditoría (PDF)**
   ```bash
   GET /api/reports/audit-log/pdf?action=delete
   ```

3. **Entregas de Evidencia (Excel)**
   ```bash
   GET /api/reports/submissions/excel?policy_code=POL-SI-001&status=Completa
   ```

### Declaración de Aplicabilidad (SoA)

```bash
# Exportar SoA en CSV
GET /api/soa/export
```

## Cumplimiento ISO 27001

### Controles Cubiertos

| Control ISO | Descripción | Implementación |
|-------------|-------------|----------------|
| **A.12.4** | Registro de eventos | `audit_log` con timestamps y contexto completo |
| **A.12.4.1** | Logs de eventos | Middleware captura automáticamente eventos críticos |
| **A.12.4.2** | Protección de logs | REVOKE UPDATE/DELETE sobre `audit_log` |
| **A.12.4.3** | Logs de admin/user | Campo `user_role` distingue acciones por rol |
| **A.12.4.4** | Sincronización de relojes | `timestamptz` en UTC |
| **A.18.1.3** | Protección de registros | Restricciones de BD + auditoría de accesos |

### Evidencias de Auditoría

El sistema genera automáticamente evidencias de:

1. **Acceso y autenticación**
   - Logins exitosos y fallidos
   - Intentos de acceso no autorizado

2. **Modificaciones de datos**
   - Creación/actualización/eliminación de evidencias
   - Cambios en políticas y requisitos

3. **Exportaciones**
   - Descargas de reportes
   - Exportaciones de SoA

4. **Limpieza de datos**
   - Ejecuciones de retención
   - Estadísticas de eliminación

## Procedimiento de Retención

### Paso 1: Monitoreo Mensual

```bash
# Obtener resumen de retención
curl -H "Authorization: Bearer $TOKEN" \
  https://evidencias.lan/api/reports/retention/summary
```

### Paso 2: Revisión Trimestral

1. Exportar log de auditoría del trimestre
2. Revisar acciones críticas (delete, update)
3. Verificar que no haya eliminaciones no autorizadas
4. Documentar hallazgos

### Paso 3: Limpieza Anual

```bash
# Simular limpieza
./scripts/cleanup_retention.sh

# Revisar resultados
# Si todo está correcto, ejecutar realmente
./scripts/cleanup_retention.sh --execute
```

### Paso 4: Auditoría de Certificación

1. Exportar SoA actualizada
2. Exportar log de auditoría del período
3. Documentar política de retención
4. Presentar evidencias de cumplimiento

## Consideraciones Legales

### Retención Obligatoria

- **Logs de auditoría**: 10 años (regulación legal)
- **Evidencias ISO**: 7 años (ciclo de certificación)
- **Datos personales**: Según GDPR/LFPDPPP (aplicar derecho al olvido)

### Derecho al Olvido

Para solicitudes de eliminación de datos personales:

1. **NO eliminar** logs de auditoría (obligación legal)
2. **Anonimizar** campos `user_email` en `audit_log`
3. **Eliminar** evidencias asociadas al usuario (si no son requeridas)
4. **Documentar** la solicitud y acción tomada

```sql
-- Ejemplo: Anonimizar logs de un usuario
UPDATE audit_log 
SET user_email = 'anonimizado@example.com'
WHERE user_email = 'usuario@empresa.com'
AND action != 'login';  -- Preservar evidencia de acceso
```

## Monitoreo y Alertas

### Métricas Clave

- Total de evidencias por estado
- Evidencias próximas a expirar (90 días)
- Tamaño de `audit_log`
- Frecuencia de limpiezas

### Alertas Recomendadas

Configurar alertas para:

1. **Evidencias próximas a expirar** (>100 registros)
2. **Logs de auditoría > 1GB**
3. **Intentos de UPDATE/DELETE sobre audit_log** (debe fallar)
4. **Limpiezas con >50 eliminaciones**

## Referencias

- ISO/IEC 27001:2022 - Control A.12.4 (Logging)
- ISO/IEC 27002:2022 - Guía de implementación
- NIST SP 800-92 - Guide to Computer Security Log Management
- GDPR Article 17 - Right to erasure ('right to be forgotten')

## Contacto

Para preguntas sobre esta política:
- **Responsable**: [Nombre del responsable de seguridad]
- **Email**: [email de contacto]
- **Revisión**: Anual o ante cambios regulatorios

---

**Última actualización**: 2024-01-15  
**Versión**: 1.0  
**Aprobado por**: [Nombre del aprobador]
