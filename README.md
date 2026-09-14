# Xana — Sistema de Gestión Hospitalaria

Aplicación web para la gestión integral de un centro hospitalario: ingreso y seguimiento
de pacientes, historia clínica, asignación de camas, comunicación interna entre personal
y generación de documentación oficial.

Desarrollado como **Trabajo de Fin de Grado** en Ingeniería Informática (Universidad de
Salamanca).

> **Nota sobre los datos.** Todos los pacientes, historiales y usuarios que aparecen en
> las capturas y en la demo son **ficticios**, creados para la defensa del proyecto. El
> repositorio no contiene volcados de base de datos ni datos personales.

---

## Qué hace

El sistema modela cinco perfiles de usuario, cada uno con su propio panel y permisos:

| Rol | Funcionalidad principal |
|---|---|
| **Secretaría** | Registro y admisión de pacientes, citas previas, emisión de justificantes y consentimientos |
| **Médico** | Historia clínica, diagnósticos codificados con CIE-11, prescripción y recetas |
| **Enfermería** | Constantes vitales, administración de medicación, evolutivo del paciente |
| **Enfermería (encargado)** | Cuadrantes y turnos, asignación de camas y planta, supervisión del equipo |
| **Administrador** | Altas y bajas de personal, auditoría de accesos, copias de seguridad |

### Características destacadas

- **Codificación diagnóstica CIE-11** mediante integración con la API oficial de la
  Organización Mundial de la Salud, con búsqueda por palabra clave y caché de token OAuth.
- **Mensajería interna en tiempo real** (chat individual y notificaciones) sobre Socket.IO.
- **Generación de documentos PDF** rellenables y firmados: recetas, justificantes,
  consentimientos informados, informes de alta y códigos QR de verificación.
- **Copias de seguridad automáticas** programadas con `node-cron` y subidas a Google Drive
  a través de una cuenta de servicio.
- **Cuadros de mando** con Chart.js: ocupación de camas, altas e ingresos por periodo.
- **Seguridad**: autenticación por JWT en cookie, contraseñas con bcrypt, control de acceso
  por rol, servidor sobre HTTPS y registro de accesos no autorizados.
- **Recuperación de contraseña** por correo con enlace de un solo uso y caducidad.

---

## Arquitectura

Aplicación por capas sobre Express, con renderizado en servidor mediante EJS.
Cada capa tiene una responsabilidad y no invade la siguiente: los repositorios
no saben qué es una petición HTTP, y los controladores no escriben SQL.

```
startServer.js            Punto de entrada: valida el entorno y levanta el servidor
src/
├── app.js                Construcción de la aplicación Express
├── config/               Configuración centralizada, leída de .env
├── db/pool.js            Pool de conexiones MySQL y ayuda para transacciones
├── middleware/
│   ├── auth.js           requireAuth y requireRol: sesión y permisos
│   ├── contextoUsuario.js Datos comunes a toda pantalla autenticada
│   └── errores.js        Manejador de errores central y asyncHandler
├── routes/               Un router por dominio; declara qué middleware usa cada ruta
├── controllers/          Traducen HTTP a llamadas de dominio
├── repositories/         Acceso a datos, un módulo por dominio
├── services/             Integraciones externas: correo, CIE-11, Drive, logs
├── sockets/              Eventos de Socket.IO
└── utils/                Utilidades compartidas
```

### Autenticación y contexto

La sesión se resuelve una sola vez, en el middleware:

```js
router.get("/planta", requireAuth, cargarContextoUsuario, asyncHandler(controlador.planta));
```

`requireAuth` valida el token de la cookie y deja el usuario en `req.usuario`;
`cargarContextoUsuario` añade los datos que comparten todas las pantallas
(contactos del chat, notificaciones). El manejador se limita a su propio
trabajo, y cualquier error que se propague lo recoge un manejador central que
lo registra y responde de forma coherente.

**Stack:** Node.js · Express · MySQL (mysql2) · EJS · Socket.IO · JWT · bcrypt ·
PDFKit / pdf-lib · Chart.js · Nodemailer · Google Drive API · node-cron

## Puesta en marcha con Docker (recomendado)

Levanta base de datos y aplicación de una vez, con el esquema cargado y
empleados de prueba ya creados:

```bash
docker compose up --build
```

En un minuto la aplicación queda en **https://localhost:3000**. El navegador
avisará de que el certificado no es de confianza: es un autofirmado que se
genera dentro de la imagen, acepta y continúa.

### Usuarios de prueba

Todos con la contraseña **`Prueba1234`**:

| Usuario (DNI) | Rol | Servicio |
|---|---|---|
| `00000001A` | Médico | Cardiología |
| `00000002B` | Enfermero | Cardiología |
| `00000003C` | Enfermero encargado | Cardiología |
| `00000004D` | Secretario | Admisión |
| `00000005E` | Administrador | Sistemas |

```bash
docker compose logs -f app    # ver el registro
docker compose down           # parar
docker compose down -v        # parar y borrar los datos
```

---

## Puesta en marcha manual

### Requisitos

- Node.js 18 o superior
- MySQL 8
- OpenSSL (para el certificado de desarrollo)

### Instalación

```bash
git clone https://github.com/<usuario>/xana-gestion-hospitalaria.git
cd xana-gestion-hospitalaria
npm install
```

### Configuración

```bash
cp .env.example .env
```

Edita `.env` y rellena los valores. Como mínimo necesitas `SECRET_KEY`, las credenciales de
MySQL y un certificado TLS. Las credenciales de la OMS, del correo y de Google Drive son
opcionales: sin ellas el resto de la aplicación funciona, sólo se desactivan la búsqueda
CIE-11, el envío de correos y las copias de seguridad automáticas.

Certificado autofirmado para desarrollo:

```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout ssl/private.key -out ssl/certificate.crt
```

### Base de datos

```bash
mysql -u root -p -e "CREATE DATABASE xanadb CHARACTER SET utf8mb4;"
mysql -u root -p xanadb < db/schema.sql
```

El esquema son 41 tablas, sin ningún dato. Para poder entrar en la aplicación,
crea empleados de prueba (uno por rol):

```bash
npm run db:seed
```

La estructura completa está documentada además en
[`docs/BaseDeDatosXanadb.pdf`](docs/BaseDeDatosXanadb.pdf).

### Arranque

```bash
npm run dev      # con recarga automática
npm start        # sin recarga
```

La aplicación queda disponible en `https://localhost:3000`.

### Comprobación rápida

Con la aplicación levantada y la base sembrada:

```bash
npm run test:humo
```

Inicia sesión con cada uno de los cinco roles y recorre todas las rutas GET
declaradas, comprobando que ninguna devuelve un error de servidor y que el
control de acceso por rol responde como debe.

---

## Documentación

La memoria del TFG incluye seis anexos, disponibles en [`docs/`](docs/):

| Documento | Contenido |
|---|---|
| Anexo I | Especificaciones del sistema |
| Anexo II | Análisis y diseño |
| Anexo III | Estimación de tamaño y esfuerzo |
| Anexo IV | Plan de seguridad |
| Anexo V | Manual de usuario |
| Anexo VI | Manual de instalación |

Los manuales de usuario por rol están además accesibles desde la propia aplicación
(`public/manuales/`).

---

## Autor

**Miguel Barranquero Díez** — Trabajo de Fin de Grado, Ingeniería Informática,
Universidad de Salamanca.

## Licencia

Publicado bajo licencia MIT. Ver [LICENSE](LICENSE).
