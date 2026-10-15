# Por qué FastAPI

**Fecha:** 2024-01-15  
**Decisión:** Usar FastAPI como framework de API backend  
**Estado:** Aprobada

## Contexto

Necesitábamos un framework Python para construir la API REST que gestione políticas, controles, requisitos y entregas de evidencia ISO 27001.

## Opciones Consideradas

1. **FastAPI** ✅ (Seleccionado)
2. Django REST Framework
3. Flask + Flask-RESTful
4. Express.js (Node.js)

## Razones de la Decisión

### 1. Validación Automática con Pydantic
- Los datos se validan automáticamente antes de tocar la base de datos
- Tipos de Python nativos con validación integrada
- Menos código boilerplate, menos errores

### 2. Documentación Interactiva Automática
- Swagger UI en `/api/docs` sin configuración
- OpenAPI JSON en `/api/openapi.json`
- Útil para pruebas y para que el frontend genere tipos automáticamente

### 3. Tipos de Python y Type Hints
- IDE ayuda con autocompletado
- Detecta errores antes de ejecutar
- Código más mantenible

### 4. Async Nativo
- Soporte nativo para operaciones asíncronas
- Útil para llamadas concurrentes a Microsoft Graph
- Mejor rendimiento bajo carga

### 5. Rendimiento
- Uno de los frameworks Python más rápidos
- Basado en Starlette y Uvicorn
- Comparable a Node.js y Go

## Alternativas Descartadas

### Django REST Framework
- Más pesado para una API pequeña
- No genera documentación automática tan limpia
- Curva de aprendizaje más alta

### Flask + Flask-RESTful
- Requiere más configuración manual
- Validación no integrada (necesita marshmallow)
- Documentación no automática

### Express.js (Node.js)
- El equipo tiene más experiencia con Python
- TypeScript añade complejidad
- Ecosistema de ORM menos maduro que SQLAlchemy

## Impacto

- **Positivo:** Desarrollo rápido, documentación automática, validación robusta
- **Negativo:** Requiere Python 3.12+ (versión reciente)
- **Riesgos:** Comunidad más pequeña que Django

## Referencias

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [FastAPI vs Django REST](https://fastapi.tiangolo.com/alternatives/)
