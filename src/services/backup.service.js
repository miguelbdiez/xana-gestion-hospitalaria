import fileS from "fs";
import { google } from "googleapis";
import { GOOGLE_CREDENTIALS_PATH, GOOGLE_DRIVE_FOLDER_ID } from "../config/index.js";

/**
 * Subida de las copias de seguridad de la base de datos a Google Drive
 * mediante una cuenta de servicio.
 */

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

export function estaConfigurado() {
  return Boolean(GOOGLE_DRIVE_FOLDER_ID && fileS.existsSync(GOOGLE_CREDENTIALS_PATH));
}

async function autenticar() {
  const auth = new google.auth.GoogleAuth({
    keyFile: GOOGLE_CREDENTIALS_PATH,
    scopes: SCOPES,
  });
  return google.drive({ version: "v3", auth });
}

/** Sube un fichero y devuelve su identificador en Drive. */
export async function subirAGoogleDrive(rutaFichero, nombreFichero) {
  if (!estaConfigurado()) {
    throw new Error(
      "Google Drive no está configurado: define GOOGLE_DRIVE_FOLDER_ID y GOOGLE_CREDENTIALS_PATH."
    );
  }

  const drive = await autenticar();

  try {
    const respuesta = await drive.files.create({
      resource: { name: nombreFichero, parents: [GOOGLE_DRIVE_FOLDER_ID] },
      media: { mimeType: "application/sql", body: fileS.createReadStream(rutaFichero) },
      fields: "id, name",
    });
    return respuesta.data.id;
  } catch (error) {
    throw new Error(`Error al subir a Google Drive: ${error.message}`);
  }
}
