# Por qué PostgreSQL

**Fecha:** 2024-01-15  
**Decisión:** Usar PostgreSQL 17 como base de datos principal  
**Estado:** Aprobada

## Contexto

Necesitábamos una base de datos relacional para almacenar políticas, controles, requisitos, entregas de evidencia y logs de auditoría del sistema ISO 27001.

## Opciones Consideradas

1. **PostgreSQL 17** ✅ (Seleccionada)
2. MySQL 8.0
3. SQLite
4. MongoDB

## Razones de la Decisión

### 1. Funciones Avanzadas de Fecha y Hora
PostgreSQL tiene soporte nativo para:
- `timestamptz` (timestamps con zona horaria)
- `make_interval()` para cálculos de intervalos
- Vistas materializadas para cálculos complejos de vencimientos

**Ejemplo:** La vista `v_requirement_status` calcula automáticamente el estado de cada requisito basado en la última evidencia y su frecuencia.

### 2. JSONB para Metadatos Flexibles
Aunque el esquema es principalmente relacional, JSONB permite:
- Almacenar metadatos variables de archivos adjuntos
- Extender el esquema sin migraciones complejas
- Consultas eficientes sobre datos semi-estructurados

### 3. Confiabilidad y Respaldos
- `pg_dump` y `pg_restore` son robustos y permiten restauración parcial
- WAL (Write-Ahead Logging) para recuperación ante fallos
- Replicación nativa para alta disponibilidad

### 4. Seguridad
- Row-Level Security (RLS) para aislamiento multi-tenant
- Cifrado en tránsito (SSL/TLS) y en reposo
- Auditoría nativa con `pg_audit`

### 5. Comunidad y Soporte
- Mayor adopción en entornos empresariales
- Mejor documentación y herramientas de administración
- Soporte a largo plazo (LTS)

## Alternativas Descartadas

### MySQL 8.0
- Funciones de fecha menos intuitivas
- Respaldos más complejos
- Menor soporte para JSONB

### SQLite
- No soporta concurrencia de escritura
- Limitado para múltiples usuarios simultáneos
- Sin funciones avanzadas de auditoría

### MongoDB
- No relacional (no encaja con el modelo de datos)
- Sin transacciones ACID completas
- Menor madurez para casos de uso empresariales

## Impacto

- **Positivo:** Mejor rendimiento, seguridad y funcionalidad
- **Negativo:** Requiere más recursos que SQLite (mínimo 2GB RAM)
- **Riesgos:** Curva de aprendizaje para administradores nuevos a PostgreSQL

## Referencias

- [PostgreSQL Documentation](https://www.postgresql.org/docs/17/)
- [PostgreSQL vs MySQL](https://www.postgresql.org/about/)
- ISO 27001 Control A.12.3 (Information backup)
