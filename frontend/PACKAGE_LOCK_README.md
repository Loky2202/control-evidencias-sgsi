# Instrucciones para generar package-lock.json

Este archivo `package-lock.json` debe generarse ejecutando:

```bash
cd frontend
npm install
```

O usando el script de setup del proyecto:

```bash
./scripts/setup.sh
```

O usando Make (si está disponible):

```bash
make frontend-install
```

## ¿Por qué es importante?

El archivo `package-lock.json` asegura que todos los desarrolladores y entornos de CI/CD usen exactamente las mismas versiones de las dependencias, garantizando builds reproducibles.

## Nota

Este archivo **DEBE** estar commiteado en el repositorio. No está en `.gitignore` porque es esencial para la reproducibilidad del build.
