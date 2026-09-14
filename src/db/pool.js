import mysql from "mysql2/promise";
import { CONFIG_DATABASE } from "../config/index.js";

/**
 * Pool de conexiones MySQL compartido por todos los repositorios.
 *
 * Se usa un pool y no una conexión única porque una sola conexión serializa
 * todas las consultas de la aplicación y, si el servidor la cierra por
 * inactividad, deja la aplicación inservible hasta reiniciarla.
 */
export const pool = mysql.createPool({
  ...CONFIG_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
});

/** Ejecuta una consulta y devuelve directamente las filas. */
export async function consultar(sql, parametros = []) {
  const [filas] = await pool.query(sql, parametros);
  return filas;
}

/**
 * Ejecuta varias operaciones dentro de una misma transacción.
 * Si la función lanza, se revierte todo y se propaga el error.
 */
export async function enTransaccion(operaciones) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const resultado = await operaciones(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}
