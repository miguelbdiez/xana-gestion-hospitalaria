import {
  cargarListaPersonaschat,
  ordenarlistaPersonasChat,
  cargarListaNotificaciones,
} from "../repositories/comunicaciones.repository.js";
import { recuperarManualDeUsuario } from "../repositories/administracion.repository.js";

/**
 * Carga el contexto común a todas las pantallas autenticadas: nombre del
 * usuario, lista de contactos del chat y notificaciones pendientes.
 *
 * Este bloque estaba copiado literalmente en 60 manejadores de ruta distintos.
 * Al vivir aquí, cada ruta se limita a añadir sus propios datos.
 *
 * Debe montarse siempre después de `requireAuth`.
 */
export async function cargarContextoUsuario(req, res, next) {
  const { id, especialidad, nombre, rol } = req.usuario;

  try {
    const [listaPersonasChat, notificaciones] = await Promise.all([
      cargarListaPersonaschat(especialidad, id),
      cargarListaNotificaciones(id),
    ]);

    res.locals.contexto = {
      nombre,
      rol,
      id_usuario: id,
      listaPersonasChat: await ordenarlistaPersonasChat(listaPersonasChat),
      notificaciones,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Añade `res.renderConContexto(vista, datos)`: renderiza pasando a la plantilla
 * un objeto `info` con el contexto común mezclado con los datos de la ruta.
 *
 * Las vistas siguen recibiendo exactamente la misma forma de `info` que antes,
 * de modo que no hay que tocar ninguna plantilla EJS.
 */
export function renderConContexto(req, res, next) {
  res.renderConContexto = (vista, datos = {}) =>
    res.render(vista, { info: { ...(res.locals.contexto ?? {}), ...datos } });
  return next();
}

/**
 * Variante para las pantallas que además necesitan el manual de usuario
 * correspondiente al rol.
 */
export async function cargarManualUsuario(req, res, next) {
  try {
    res.locals.contexto = {
      ...(res.locals.contexto ?? {}),
      manualDeUsuario: await recuperarManualDeUsuario(req.usuario.rol),
    };
    return next();
  } catch (error) {
    return next(error);
  }
}
