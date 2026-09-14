import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export const {
  PORT = 3000,
  SALT = 10,
  SECRET_KEY,
  IP_SERVIDOR = "localhost",
} = process.env;

/** Comprueba que estan las variables imprescindibles. Se llama al arrancar. */
export function verificarConfiguracion() {
  const obligatorias = { SECRET_KEY, DB_USER: process.env.DB_USER };
  const faltan = Object.entries(obligatorias)
    .filter(([, valor]) => !valor)
    .map(([nombre]) => nombre);

  if (faltan.length) {
    throw new Error(
      `Faltan variables de entorno obligatorias: ${faltan.join(", ")}. ` +
        "Copia .env.example a .env y rellena los valores."
    );
  }
}

/**
 * Certificado TLS del servidor.
 *
 * Se lee bajo demanda y no al importar el modulo: asi los repositorios y los
 * tests pueden cargar la configuracion sin necesitar certificados presentes.
 */
export function cargarOpcionesServidor() {
  const rutaClave = process.env.SSL_KEY_PATH ?? "./ssl/private.key";
  const rutaCert = process.env.SSL_CERT_PATH ?? "./ssl/certificate.crt";

  if (!fs.existsSync(rutaClave) || !fs.existsSync(rutaCert)) {
    throw new Error(
      `No se encuentra el certificado TLS (${rutaClave}, ${rutaCert}). ` +
        "Genera uno de desarrollo con: " +
        "openssl req -x509 -newkey rsa:2048 -nodes -days 365 " +
        "-keyout ssl/private.key -out ssl/certificate.crt"
    );
  }

  return { key: fs.readFileSync(rutaClave), cert: fs.readFileSync(rutaCert) };
}

export const CONFIG_DATABASE = {
  host: process.env.DB_HOST ?? "localhost",
  port: process.env.DB_PORT ?? "3306",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? "xanadb",
};

export const CONFIG_EMAIL = {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_SECRET_KEY: process.env.EMAIL_SECRET_KEY,
};

export const API_OMS_CIE_11 = {
  grant_type: "client_credentials",
  client_id: process.env.OMS_CLIENT_ID,
  client_secret: process.env.OMS_CLIENT_SECRET,
  scope: "icdapi_access",
};

export const GOOGLE_CREDENTIALS_PATH =
  process.env.GOOGLE_CREDENTIALS_PATH ?? "./credenciales/service-account.json";
export const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
