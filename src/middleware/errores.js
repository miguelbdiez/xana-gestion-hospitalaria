import { logs } from "../services/logs.service.js";

/** Ruta no encontrada. */
export function noEncontrado(req, res) {
  if (esPeticionDeApi(req)) {
    return res.status(404).json({ error: "Recurso no encontrado" });
  }
  return res.status(404).render("zonaRestringida");
}

/**
 * Manejador de errores central.
 *
 * Sustituye a los 71 bloques try/catch que estaban repetidos en los
 * manejadores de ruta. Cualquier error que se propague acaba aquí: se registra
 * una sola vez y se responde de forma coherente en toda la aplicación.
 *
 * Express lo reconoce como manejador de errores por tener cuatro parámetros.
 */
// eslint-disable-next-line no-unused-vars
export function manejadorDeErrores(error, req, res, next) {
  logs.error(`${req.method} ${req.originalUrl} | ${error.stack ?? error}`);

  if (res.headersSent) return next(error);

  const estado = error.status ?? 500;

  if (esPeticionDeApi(req)) {
    return res.status(estado).json({ error: mensajePublico(error, estado) });
  }
  return res.status(estado).send(mensajePublico(error, estado));
}

/**
 * Envuelve un manejador asíncrono para que sus rechazos lleguen al manejador
 * de errores en lugar de quedar como promesas sin capturar.
 *
 *   router.get("/ruta", asyncHandler(controlador.metodo))
 */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/** No se filtran detalles internos al cliente en errores de servidor. */
function mensajePublico(error, estado) {
  if (estado < 500) return error.message;
  return "Ha ocurrido un error al procesar la petición";
}

function esPeticionDeApi(req) {
  return (
    req.xhr ||
    req.get("accept")?.includes("application/json") ||
    req.get("content-type")?.includes("application/json")
  );
}
