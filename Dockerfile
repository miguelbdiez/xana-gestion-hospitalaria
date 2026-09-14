# Imagen de la aplicación Xana.
#
# Node 20 sobre Debian slim: `canvas` y `bcrypt` compilan extensiones nativas,
# así que la imagen alpine no vale sin arrastrar medio toolchain.
FROM node:20-bookworm-slim

# Dependencias del sistema:
#   - build-essential, python3 y las libs de cairo/pango: compilación de `canvas`
#   - default-mysql-client: el volcado de copias de seguridad usa mysqldump
#   - openssl: certificado autofirmado para el HTTPS de desarrollo
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential python3 pkg-config \
      libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
      default-mysql-client openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Las dependencias se instalan en una capa aparte para que no se reinstalen
# cada vez que cambia el código.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Certificado de desarrollo: la aplicación sirve siempre sobre HTTPS.
RUN mkdir -p ssl && \
    openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
      -keyout ssl/private.key -out ssl/certificate.crt -subj "/CN=localhost" 2>/dev/null

RUN chmod +x docker/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker/entrypoint.sh"]
CMD ["node", "startServer.js"]
