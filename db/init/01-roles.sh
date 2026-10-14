#!/bin/sh
set -e

# Script de inicialización de roles de PostgreSQL
# Se ejecuta automáticamente al crear el contenedor por primera vez

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-EOSQL
    -- Crear usuario de aplicación con permisos limitados
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_APP_USER}') THEN
            CREATE ROLE ${DB_APP_USER} LOGIN PASSWORD '${DB_APP_PASSWORD}';
        END IF;
    END
    \$\$;

    -- Conceder permisos básicos
    GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO ${DB_APP_USER};
    GRANT USAGE ON SCHEMA public TO ${DB_APP_USER};

    -- Permisos por defecto para tablas futuras
    ALTER DEFAULT PRIVILEGES FOR ROLE ${POSTGRES_USER} IN SCHEMA public
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${DB_APP_USER};

    -- Permisos por defecto para secuencias futuras
    ALTER DEFAULT PRIVILEGES FOR ROLE ${POSTGRES_USER} IN SCHEMA public
        GRANT USAGE, SELECT ON SEQUENCES TO ${DB_APP_USER};

    -- Permisos para funciones
    ALTER DEFAULT PRIVILEGES FOR ROLE ${POSTGRES_USER} IN SCHEMA public
        GRANT EXECUTE ON FUNCTIONS TO ${DB_APP_USER};

    -- Mensaje de confirmación
    DO \$\$
    BEGIN
        RAISE NOTICE 'Usuario ${DB_APP_USER} configurado exitosamente';
    END
    \$\$;
EOSQL

echo "✅ Roles de base de datos configurados"
