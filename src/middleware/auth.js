import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config/index.js";
import { logs } from "../services/logs.service.js";

export const NOMBRE_COOKIE = "access_token";
export const DURACION_SESION = "8h";

/** Firma el token de sesión con los datos del empleado autenticado. */
export function firmarToken({ id, rol, especialidad, nombre, correo_electronico }) {
  return jwt.sign(
    { id, rol, especialidad, nombre, correo_electronico },
    SECRET_KEY,
    { expiresIn: DURACION_SESION }
  );
}

/** Opciones de la cookie de sesión. */
export const OPCIONES_COOKIE = {
  httpOnly: true,
  sameSite: "strict",
  secure: true, // la aplicación siempre sirve sobre HTTPS
  maxAge: 8 * 60 * 60 * 1000,
};

/**
 * Exige sesión válida. Deja el contenido del token en `req.usuario`.
 *
 * Sustituye a las 64 verificaciones de `jwt.verify` que estaban repetidas
 * dentro de cada manejador de ruta.
 */
export function requireAuth(req, res, next) {
  const token = req.cookies?.[NOMBRE_COOKIE];

  if (!token) return rechazar(req, res, "Petición sin token de sesión");

  try {
    req.usuario = jwt.verify(token, SECRET_KEY);
    return next();
  } catch (error) {
    return rechazar(req, res, `Token inválido o caducado: ${error.message}`);
  }
}

/**
 * Exige que el usuario autenticado tenga uno de los roles indicados.
 * Debe montarse siempre después de `requireAuth`.
 *
 *   router.get("/altas", requireAuth, requireRol("medico"), controlador.altas)
 */
export function requireRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) return rechazar(req, res, "requireRol usado sin requireAuth");

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return rechazar(
        req,
        res,
        `El rol "${req.usuario.rol}" intentó acceder a ${req.originalUrl}, restringido a: ${rolesPermitidos.join(", ")}`
      );
    }

    return next();
  };
}

/**
 * Registra el intento y responde según el tipo de petición: las de navegación
 * van a la pantalla de zona restringida, las de API reciben un 403 en JSON.
 */
function rechazar(req, res, motivo) {
  logs.accesoNoAutorizado(`${req.method} ${req.originalUrl} | ${motivo}`);

  if (esPeticionDeApi(req)) {
    return res.status(403).json({ error: "No autorizado" });
  }
  return res.status(403).render("zonaRestringida");
}

function esPeticionDeApi(req) {
  return (
    req.xhr ||
    req.get("accept")?.includes("application/json") ||
    req.get("content-type")?.includes("application/json")
  );
}
