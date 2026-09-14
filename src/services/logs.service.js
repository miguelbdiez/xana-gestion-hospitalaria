import fs from "fs/promises";
import path from "path";

const DIRECTORIO_LOGS = process.env.LOGS_DIR ?? "./logs";

const FICHEROS = {
  error: "error.txt",
  accesoNoAutorizado: "accesoNoAutorizado.txt",
  login: "loginLog.txt",
  ingresos: "ingresosLog.txt",
  altas: "altasLog.txt",
  registroPaciente: "registroPacienteLog.txt",
};

/**
 * Escribe una entrada con marca de tiempo en el log indicado.
 *
 * Nunca lanza: un fallo al registrar no debe tumbar la operación que se
 * estaba registrando.
 */
async function escribir(tipo, mensaje) {
  const fichero = FICHEROS[tipo];
  if (!fichero) throw new Error(`Tipo de log desconocido: ${tipo}`);

  const entrada = `${new Date().toLocaleString()} | ${mensaje}\n`;

  try {
    await fs.mkdir(DIRECTORIO_LOGS, { recursive: true });
    await fs.appendFile(path.join(DIRECTORIO_LOGS, fichero), entrada);
  } catch {
    // Si no se puede escribir el log, se ignora deliberadamente.
  }
}

export const logs = {
  error: (error) => escribir("error", error?.stack ?? error),
  accesoNoAutorizado: (detalle) => escribir("accesoNoAutorizado", detalle),
  login: (detalle) => escribir("login", detalle),
  ingreso: (detalle) => escribir("ingresos", detalle),
  alta: (detalle) => escribir("altas", detalle),
  registroPaciente: (detalle) => escribir("registroPaciente", detalle),
};
