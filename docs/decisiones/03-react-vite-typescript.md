# Por qué React + Vite + TypeScript

**Fecha:** 2024-01-15  
**Decisión:** Usar React con Vite y TypeScript para el frontend  
**Estado:** Aprobada

## Contexto

Necesitábamos un framework frontend para construir la interfaz de usuario del sistema de gestión de evidencias ISO 27001, con tableros, formularios complejos y carga asíncrona de datos.

## Opciones Consideradas

1. **React + Vite + TypeScript** ✅ (Seleccionado)
2. Vue 3 + Vite
3. Svelte + SvelteKit
4. HTMX + Jinja2 (FastAPI templates)

## Razones de la Decisión

### 1. Ecosistema Maduro
- TanStack Query para manejo de datos
- MSAL para autenticación con Entra ID
- Librerías de tablas, calendarios y gráficos
- Mayor disponibilidad de desarrolladores

### 2. Vite es Rápido
- Compilación en milisegundos
- HMR (Hot Module Replacement) instantáneo
- Mejor experiencia de desarrollo que Webpack

### 3. TypeScript Nativo
- Vite lo soporta sin configuración
- Tipos generados desde OpenAPI previenen errores
- Mejor mantenimiento a largo plazo

### 4. Componentes Complejos
- Filas expandibles con estados anidados
- Tableros interactivos con gráficos
- Formularios multi-paso con validación
- Carga asíncrona con feedback visual

## Alternativas Descartadas

### Vue 3 + Vite
- Ecosistema más pequeño
- Menos librerías enterprise-ready
- Curva de aprendizaje similar

### Svelte + SvelteKit
- Comunidad más pequeña
- Menos librerías disponibles
- Riesgo de adopción a largo plazo

### HTMX + Jinja2
- Interfaz menos fluida
- Dificultad para componentes complejos
- No encaja con tableros interactivos

## Impacto

- **Positivo:** Desarrollo rápido, tipos seguros, componentes reutilizables
- **Negativo:** Requiere compilación (build step)
- **Riesgos:** Dependencias de npm necesitan auditoría

## Referencias

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
