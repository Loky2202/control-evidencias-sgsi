# Flujo de Aprobación de Evidencias

## Resumen

Este documento describe el flujo completo de aprobación de evidencias ISO 27001, desde la creación de una entrega hasta su aprobación final por un auditor.

## Diagrama de Flujo

```
┌─────────────┐
│   Usuario   │
│  (Crea      │
│  evidencia) │
└──────┬──────┘
       │
       │ 1. POST /api/submissions
       │    (status: "Pendiente")
       ▼
┌─────────────────┐
│  Entrega        │
│  Creada         │
│  (Pendiente)    │
└──────┬──────────┘
       │
       │ 2. POST /api/submissions/{id}/attachments
       │    (Sube archivos a SharePoint)
       ▼
┌─────────────────┐
│  Archivos       │
│  Adjuntos       │
│  (SharePoint)   │
└──────┬──────────┘
       │
       │ 3. Auditor revisa
       │    GET /api/submissions/{id}
       ▼
┌─────────────────┐
│   Auditor       │
│  (Revisa        │
│  evidencia)     │
└──────┬──────────┘
       │
       │ 4. PATCH /api/submissions/{id}
       │    (status: "Completa" o "Rechazada")
       ▼
┌─────────────────┐
│  Entrega        │
│  Aprobada       │
│  (Completa)     │
│  o Rechazada    │
└─────────────────┘
```

## Estados de una Entrega

| Estado | Descripción | Quién puede cambiar |
|--------|-------------|---------------------|
| **Pendiente** | Recién creada, esperando revisión | Usuario (al crear) |
| **Completa** | Aprobada por auditor | Auditor, Admin |
| **Rechazada** | Rechazada por auditor | Auditor, Admin |

## Roles y Permisos

### Usuario (user)
- ✅ Crear entregas (POST /api/submissions)
- ✅ Subir archivos adjuntos (POST /api/submissions/{id}/attachments)
- ✅ Ver sus propias entregas
- ❌ Aprobar o rechazar entregas
- ❌ Eliminar entregas

### Auditor (auditor)
- ✅ Todo lo que puede hacer Usuario
- ✅ Aprobar entregas (PATCH /api/submissions/{id} → "Completa")
- ✅ Rechazar entregas (PATCH /api/submissions/{id} → "Rechazada")
- ✅ Ver todas las entregas
- ✅ Exportar reportes (Excel, PDF)
- ❌ Eliminar entregas
- ❌ Crear/modificar políticas y requisitos

### Administrador (admin)
- ✅ Todo lo que puede hacer Auditor
- ✅ Eliminar entregas (DELETE /api/submissions/{id})
- ✅ Crear/modificar/eliminar políticas (CRUD /api/policies)
- ✅ Crear/modificar/eliminar requisitos (CRUD /api/requirements)
- ✅ Crear/modificar/eliminar controles (CRUD /api/controls)
- ✅ Ejecutar limpieza de retención (POST /api/reports/retention/cleanup)

## Flujo Detallado

### Paso 1: Usuario crea entrega

```http
POST /api/submissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "requirement_id": 42,
  "evidence_date": "2024-01-15",
  "notes": "Evidencia de revisión de accesos Q1 2024"
}
```

**Respuesta:**
```json
{
  "id": 123,
  "requirement_id": 42,
  "evidence_date": "2024-01-15",
  "status": "Pendiente",
  "notes": "Evidencia de revisión de accesos Q1 2024",
  "created_by": "usuario@empresa.com",
  "created_at": "2024-01-15T10:30:00Z",
  "attachments": []
}
```

**Auditoría registrada:**
- Acción: `create`
- Recurso: `submission` (ID: 123)
- Usuario: `usuario@empresa.com`
- IP: `192.168.1.100`
- User-Agent: `Mozilla/5.0...`

### Paso 2: Usuario sube archivos adjuntos

```http
POST /api/submissions/123/attachments
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <archivo.pdf>
```

**Respuesta:**
```json
{
  "id": 456,
  "filename": "revision-accesos-q1-2024.pdf",
  "file_size": 1048576,
  "sharepoint_url": "https://empresa.sharepoint.com/.../revision-accesos-q1-2024.pdf",
  "uploaded_at": "2024-01-15T10:35:00Z"
}
```

**Validaciones:**
- Tipo MIME permitido (PDF, PNG, JPG, XLSX, DOCX)
- Tamaño máximo: 10MB
- Nombre de archivo sanitizado (sin path traversal)

### Paso 3: Auditor revisa evidencia

```http
GET /api/submissions/123
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "id": 123,
  "requirement_id": 42,
  "evidence_date": "2024-01-15",
  "status": "Pendiente",
  "notes": "Evidencia de revisión de accesos Q1 2024",
  "created_by": "usuario@empresa.com",
  "created_at": "2024-01-15T10:30:00Z",
  "attachments": [
    {
      "id": 456,
      "filename": "revision-accesos-q1-2024.pdf",
      "file_size": 1048576,
      "sharepoint_url": "https://empresa.sharepoint.com/.../revision-accesos-q1-2024.pdf",
      "uploaded_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

### Paso 4: Auditor aprueba o rechaza

**Aprobación:**
```http
PATCH /api/submissions/123
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Completa",
  "notes": "Aprobado. Evidencia completa y válida."
}
```

**Rechazo:**
```http
PATCH /api/submissions/123
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Rechazada",
  "notes": "Falta firma del responsable de área. Por favor resubir."
}
```

**Auditoría registrada:**
- Acción: `update`
- Recurso: `submission` (ID: 123)
- Descripción: `Entrega Pendiente → Completa`
- Usuario: `auditor@empresa.com`
- IP: `192.168.1.101`

## Cálculo de Vencimientos

Una vez aprobada (status: "Completa"), el sistema calcula automáticamente la próxima fecha de vencimiento basada en la frecuencia del requisito:

| Frecuencia | Próxima Fecha |
|------------|---------------|
| Mensual | evidence_date + 1 mes |
| Trimestral | evidence_date + 3 meses |
| Semestral | evidence_date + 6 meses |
| Anual | evidence_date + 12 meses |
| Continua | evidence_date + 1 mes |

**Estados de alerta:**
- **Vigente**: Próxima fecha > 30 días
- **Por vencer**: Próxima fecha ≤ 30 días
- **Vencida**: Próxima fecha < hoy
- **Pendiente**: Sin evidencia aprobada

## Ejemplo Completo

### Escenario: Requisito EV-021 (Revisión de Accesos)

**Frecuencia:** Trimestral  
**Política:** POL-SI-005 (Control de Accesos)

**Q1 2024:**
1. **15-ene-2024**: Usuario crea entrega
2. **15-ene-2024**: Usuario sube PDF con revisión de accesos
3. **16-ene-2024**: Auditor aprueba (status: "Completa")
4. **Próxima fecha**: 15-abr-2024 (evidence_date + 3 meses)
5. **Estado**: Vigente (hasta 16-mar-2024), Por vencer (16-mar a 15-abr), Vencida (después de 15-abr)

**Q2 2024:**
1. **10-abr-2024**: Usuario crea nueva entrega (antes de vencer)
2. **10-abr-2024**: Usuario sube PDF
3. **11-abr-2024**: Auditor aprueba
4. **Próxima fecha**: 10-jul-2024
5. **Estado**: Vigente

## Auditoría y Trazabilidad

Todas las acciones quedan registradas en `audit_log`:

```sql
SELECT 
  created_at,
  action,
  resource_type,
  resource_id,
  description,
  user_email,
  ip_address
FROM audit_log
WHERE resource_type = 'submission'
  AND resource_id = 123
ORDER BY created_at;
```

**Resultado ejemplo:**
```
2024-01-15 10:30:00 | create  | submission | 123 | Entrega creada para requisito EV-021 | usuario@empresa.com | 192.168.1.100
2024-01-15 10:35:00 | create  | attachment | 456 | Archivo subido: revision-accesos-q1-2024.pdf | usuario@empresa.com | 192.168.1.100
2024-01-16 09:15:00 | update  | submission | 123 | Entrega Pendiente → Completa | auditor@empresa.com | 192.168.1.101
```

## Consideraciones de Seguridad

1. **Inmutabilidad de logs**: UPDATE/DELETE revocados sobre `audit_log`
2. **Transaccionalidad**: Operación + auditoría en misma transacción
3. **Validación de tokens**: JWT con JWKS de Microsoft
4. **Roles granulares**: admin, auditor, user
5. **Archivos sanitizados**: Sin path traversal, tipos MIME validados

## Referencias

- ISO 27001 Control A.5.35 (Independent review of information security)
- ISO 27001 Control A.8.8 (Management of technical vulnerabilities)
- docs/policies/retention-policy.md
