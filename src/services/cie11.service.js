import axios from "axios";
import https from "https";
import { API_OMS_CIE_11 } from "../config/index.js";

/**
 * Cliente de la API CIE-11 de la Organización Mundial de la Salud.
 *
 * Gestiona el token OAuth con caché en memoria: la OMS lo emite con caducidad,
 * así que se reutiliza mientras siga siendo válido en lugar de pedir uno nuevo
 * en cada búsqueda.
 */

const URL_TOKEN = "https://icdaccessmanagement.who.int/connect/token";
const MARGEN_CADUCIDAD_MS = 10_000;

let token = null;
let expiraEn = 0;

/**
 * La verificación de certificado sólo se relaja en desarrollo, donde el
 * servidor usa un certificado autofirmado. En producción se mantiene activa.
 */
export const clienteHttp = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: process.env.NODE_ENV === "production",
  }),
});

export function estaConfigurado() {
  return Boolean(API_OMS_CIE_11.client_id && API_OMS_CIE_11.client_secret);
}

export async function getOmsToken() {
  if (!estaConfigurado()) {
    throw new Error(
      "La API CIE-11 no está configurada: define OMS_CLIENT_ID y OMS_CLIENT_SECRET."
    );
  }

  if (token && Date.now() < expiraEn) return token;

  const params = new URLSearchParams({
    grant_type: API_OMS_CIE_11.grant_type,
    client_id: API_OMS_CIE_11.client_id,
    client_secret: API_OMS_CIE_11.client_secret,
    scope: API_OMS_CIE_11.scope,
  });

  const respuesta = await axios.post(URL_TOKEN, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  token = respuesta.data.access_token;
  expiraEn = Date.now() + respuesta.data.expires_in * 1000 - MARGEN_CADUCIDAD_MS;

  return token;
}
