# Por qué Docker Compose

**Fecha:** 2024-01-15  
**Decisión:** Usar Docker Compose para orquestación de contenedores  
**Estado:** Aprobada

## Contexto

Necesitábamos una forma de empaquetar y desplegar la aplicación completa (API, frontend, base de datos) de manera reproducible en cualquier entorno.

## Opciones Consideradas

1. **Docker Compose** ✅ (Seleccionado)
2. Kubernetes
3. VMs tradicionales
4. Instalación manual

## Razones de la Decisión

### 1. Reproducibilidad
- `docker compose up --build` levanta todo desde cero
- Sin "en mi máquina funciona"
- Entornos idénticos en desarrollo, staging y producción

### 2. Aislamiento
- Cada servicio en su contenedor
- Si la API falla, la base de datos sigue corriendo
- Facilita debugging y monitoreo

### 3. Redes Internas
- La base de datos no tiene acceso a internet
- Solo la API puede hablar con ella
- Seguridad por diseño

### 4. Simplicidad
- Un solo archivo YAML para toda la orquestación
- Fácil de entender y mantener
- Sin complejidad innecesaria

### 5. Escalabilidad Futura
- Si crecemos, podemos migrar a Kubernetes
- Los contenedores ya están definidos
- Transición suave

## Alternativas Descartadas

### Kubernetes
- Excesivo para un servidor único con 2GB RAM
- Complejidad operacional alta
- Curva de aprendizaje significativa

### VMs Tradicionales
- No reproducible
- Difícil de versionar
- "Works on my machine"

### Instalación Manual
- No portable
- Difícil de automatizar
- Propenso a errores

## Impacto

- **Positivo:** Reproducibilidad, aislamiento, simplicidad
- **Negativo:** Overhead de Docker (~100MB RAM)
- **Riesgos:** Requiere Docker Engine instalado

## Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
