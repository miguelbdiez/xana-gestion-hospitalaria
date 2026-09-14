/**
 * Validación de parámetros de consulta.
 *
 * Antes, una petición sin los parámetros esperados llegaba al manejador, que
 * intentaba leer propiedades de `undefined` y acababa en un 500. Un parámetro
 * que falta es un error del cliente, no del servidor: aquí se corta antes con
 * un 400 y un mensaje que dice exactamente qué falta.
 */

/** Nombres que se tratan como identificadores numéricos. */
const IDENTIFICADORES_NUMERICOS = new Set([
  "ingreso_id",
  "id_via",
  "id_del_test",
  "id_balance",
  "historia_id",
  "mailId",
  "idDocumento",
  "episodio",
]);

/**
 * Exige que estén presentes los parámetros indicados.
 *
 *   router.get("/paciente", requireAuth, requireQuery("ingreso_id"), asyncHandler(ctrl.paciente))
 *
 * Los que son identificadores numéricos se comprueban además como enteros
 * positivos, de modo que un `?ingreso_id=abc` tampoco llega al repositorio.
 */
export function requireQuery(...nombres) {
  return (req, res, next) => {
    const faltan = [];
    const invalidos = [];

    for (const nombre of nombres) {
      const valor = req.query[nombre];

      if (valor === undefined || valor === "") {
        faltan.push(nombre);
        continue;
      }

      if (IDENTIFICADORES_NUMERICOS.has(nombre) && !esEnteroPositivo(valor)) {
        invalidos.push(nombre);
      }
    }

    if (!faltan.length && !invalidos.length) return next();

    const detalles = [];
    if (faltan.length) detalles.push(`faltan: ${faltan.join(", ")}`);
    if (invalidos.length) {
      detalles.push(`deben ser enteros positivos: ${invalidos.join(", ")}`);
    }

    return responder(req, res, `Parámetros de consulta incorrectos (${detalles.join("; ")})`);
  };
}

function esEnteroPositivo(valor) {
  return /^\d+$/.test(String(valor)) && Number(valor) > 0;
}

function responder(req, res, mensaje) {
  if (esPeticionDeApi(req)) {
    return res.status(400).json({ error: mensaje });
  }
  return res.status(400).send(mensaje);
}

function esPeticionDeApi(req) {
  return (
    req.xhr ||
    req.get("accept")?.includes("application/json") ||
    req.get("content-type")?.includes("application/json")
  );
}
