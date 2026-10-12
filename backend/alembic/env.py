"""
Configuración de Alembic para migraciones de base de datos.
"""
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

# Agregar el directorio padre al path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Importar modelos para que Alembic los detecte
from app.db import Base
from app.models import *  # noqa: F401, F403

# Configuración de Alembic
config = context.config

# Interpretar el archivo de configuración para logging Python
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Sobrescribir URL de la base de datos con variable de entorno
database_url = os.getenv("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)

# Metadata para 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Ejecutar migraciones en modo 'offline'.
    
    Configura el contexto solo con una URL y no con un Engine real.
    Las llamadas a execute() no necesitan un Engine.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Ejecutar migraciones en modo 'online'.
    
    Crea un Engine y asocia una conexión con el contexto.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
