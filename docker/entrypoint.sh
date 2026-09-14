#!/bin/sh
# Prepara la base de datos antes de arrancar la aplicación.
#
#   1. espera a que MySQL acepte conexiones
#   2. carga el esquema si la base está vacía
#   3. siembra empleados de prueba si no hay ninguno
#
# Los pasos 2 y 3 son idempotentes: reiniciar el contenedor no duplica nada.
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-xanadb}"

echo "[xana] Esperando a MySQL en ${DB_HOST}:${DB_PORT}..."
intentos=0
until mysqladmin ping -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" --silent 2>/dev/null; do
  intentos=$((intentos + 1))
  if [ "$intentos" -gt 60 ]; then
    echo "[xana] MySQL no responde tras 60 intentos. Abortando."
    exit 1
  fi
  sleep 2
done
echo "[xana] MySQL disponible."

tablas=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -N -B \
  -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}';" 2>/dev/null || echo 0)

if [ "$tablas" -lt 10 ]; then
  echo "[xana] Base de datos vacía: cargando db/schema.sql..."
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" \
    --default-character-set=utf8mb4 "$DB_NAME" < db/schema.sql
  echo "[xana] Esquema cargado."
else
  echo "[xana] El esquema ya existe (${tablas} tablas)."
fi

echo "[xana] Sembrando empleados de prueba..."
node db/seed-dev.mjs || echo "[xana] Aviso: la siembra no se completó."

echo "[xana] Arrancando la aplicación."
exec "$@"
