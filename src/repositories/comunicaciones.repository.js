/**
 * Repositorio de comunicaciones
 *
 * Chat interno, correo entre empleados y notificaciones.
 *
 * Acceso a datos unicamente: no contiene logica de presentacion ni HTTP.
 */
import { pool } from "../db/pool.js";
import { IP_SERVIDOR, PORT } from "../config/index.js";
import { logs } from "../services/logs.service.js";
import axios from "axios";
import cron from "node-cron";
import { parseFecha } from "../utils/fechas.js";

/** URL base del propio servidor, para las llamadas internas programadas. */
const URL_BASE = `https://${IP_SERVIDOR}:${PORT}`;

export async function guardarMensajeChat(mensajeChatDB) {
  try {
    await pool.query(
      `INSERT INTO MensajesChat (emisor, receptor, contenido, fecha, leido)
       VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?, NOW(), ?)`,
      [
        mensajeChatDB.emisor,
        mensajeChatDB.receptor,
        mensajeChatDB.contenido,
        mensajeChatDB.leido ? 1 : 0,
      ]
    );
    return;
    
  } catch (error) {
    logs.error(error)

  }
  
}

export async function cargarListaPersonaschat(especialidad, emisorId) {

  try {
    const [result] = await pool.query(
      `SELECT 
          BIN_TO_UUID(e.id) AS id, 
          CONCAT(e.nombre, ' ', e.apellido1, ' ', e.apellido2) AS nombre,
          e.estado, 
          e.foto_perfil,
          IFNULL((
              SELECT contenido 
              FROM MensajesChat 
              WHERE 
                  (emisor = e.id AND receptor = UUID_TO_BIN(?))
                  OR 
                  (receptor = e.id AND emisor = UUID_TO_BIN(?))
              ORDER BY fecha DESC
              LIMIT 1
          ),  '') AS ultimo_mensaje,
          IFNULL((
              SELECT DATE_FORMAT(fecha, '%d-%m-%Y %H:%i') 
              FROM MensajesChat 
              WHERE 
                  (emisor = e.id AND receptor = UUID_TO_BIN(?))
                  OR 
                  (receptor = e.id AND emisor = UUID_TO_BIN(?))
              ORDER BY fecha DESC
              LIMIT 1
          ),  '') AS fecha_ultimo_mensaje
      FROM empleados e
      WHERE e.id != UUID_TO_BIN(?)`,
      [
        emisorId, // ID del emisor
        emisorId, // ID del receptor
        emisorId, // ID del emisor para el segundo campo
        emisorId, // ID del receptor para el segundo campo
        emisorId, //no devuleva su propio Chat
      ]
    );

    return result;
  } catch (error) {
    logs.error(error)
  }
  
}

export async function ordenarlistaPersonasChat(listaPersonasChat) {
  return listaPersonasChat.sort((a, b) => {
    // Si no hay fecha_ultimo_mensaje, tratar como muy antigua (colocarla al final)
    const fechaA = a.fecha_ultimo_mensaje
      ? parseFecha(a.fecha_ultimo_mensaje)
      : new Date(0);
    const fechaB = b.fecha_ultimo_mensaje
      ? parseFecha(b.fecha_ultimo_mensaje)
      : new Date(0);

    // Orden descendente: más reciente primero
    return fechaB - fechaA;
  });
}

export async function cargarMensajesChatIndividual(usuarioEmisorId,usuarioReceptorId) {

  try {
    const [result] = await pool.query(
      `SELECT contenido, BIN_TO_UUID(emisor) as emisor, fecha 
       FROM MensajesChat 
       WHERE (emisor = UUID_TO_BIN(?) AND receptor = UUID_TO_BIN(?))
          OR (emisor = UUID_TO_BIN(?) AND receptor = UUID_TO_BIN(?))
       ORDER BY fecha ASC`,
      [usuarioEmisorId, usuarioReceptorId, usuarioReceptorId, usuarioEmisorId]
    );

    let mensajesOrdenados = result.map((mensaje) => ({
      contenido: mensaje.contenido,
      esPropio: mensaje.emisor === usuarioEmisorId, // Ahora ya es un UUID en formato string
      fecha: mensaje.fecha,
    }));

    return mensajesOrdenados;
  } catch (error) {
    logs.error(error)
  }
 
}

export async function cargarInfoPersonaPrimerChat(usuarioId) {

  try {
    const [result] = await pool.query(
      `SELECT BIN_TO_UUID(id) AS id, CONCAT(nombre, ' ', apellido1, ' ', apellido2) AS nombre, foto_perfil
       FROM empleados 
       WHERE id = UUID_TO_BIN(?)`,
      [usuarioId]
    );
    return result[0]; 
  } catch (error) {
    logs.error(error)
  }
  
}

export async function cargarListaMails(correo_electronico, tipoCorreo) {
  try {
    let query = "";
    let parametros = [];

    if (tipoCorreo === "Bandeja") {
      query = `SELECT id, emisorMail, asunto, contenido, fecha, guardado, eliminado, favorito, leido  
                   FROM MensajesMail 
                   WHERE receptorMail = ? AND eliminado = 0
                   ORDER BY fecha DESC`;
      parametros = [correo_electronico];
    } else if (tipoCorreo === "Favoritos") {
      query = `SELECT id, emisorMail, asunto, contenido, fecha, eliminado, favorito, leido  
                   FROM MensajesMail 
                   WHERE (receptorMail = ? OR emisorMail= ?) AND favorito = 1
                   ORDER BY fecha DESC`;
      parametros = [correo_electronico, correo_electronico];
    } else if (tipoCorreo === "Eliminados") {
      query = `SELECT id, emisorMail, asunto, contenido, fecha, eliminado, favorito, leido  
                   FROM MensajesMail 
                   WHERE  (receptorMail = ? OR emisorMail= ?) AND eliminado = 1
                   ORDER BY fecha DESC`;
      parametros = [correo_electronico, correo_electronico];
    } else if (tipoCorreo === "Enviados") {
      query = `SELECT id, emisorMail,receptorMail, asunto, contenido, fecha, eliminado, favorito, leido  
                   FROM MensajesMail 
                   WHERE emisorMail = ? 
                   ORDER BY fecha DESC`;
      parametros = [correo_electronico];
    }

    if (!query) {
      throw new Error(
        `Tipo de bandeja desconocido: "${tipoCorreo}". ` +
          "Valores validos: Bandeja, Favoritos, Eliminados, Enviados."
      );
    }

    const [mensajes] = await pool.query(query, parametros);
    return mensajes;
  } catch (error) {
    logs.error(error)
    throw error;
  }
}

export async function verificarExistenciaCorreo(to) {
  try {
    const [result] = await pool.query(
      "SELECT BIN_TO_UUID(id) AS id, nombre, apellido1, apellido2 FROM empleados WHERE correo_electronico = ?",
      [to]
    );

    let respuesta = "";
    if (result.length === 0) {
      respuesta = {
        success: false,
        message: " El correo electrónico no existe en el sistema",
      };
    } else {
      respuesta = {
        success: true,
        id: result[0].id,
      };
    }
    return respuesta;
  } catch (error) {
    logs.error(error)
  }
  
}

export async function enviarMail(from, to, asunto, message) {

  try {
    const [result] = await pool.query(
      `INSERT INTO MensajesMail 
      (emisorMail, receptorMail, asunto, contenido, fecha, guardado, eliminado, favorito, leido)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [from, to, asunto, message, new Date(), 0, 0, 0, 0]
    );
    const [mail] = await pool.query(
      `SELECT * FROM MensajesMail WHERE id = ?`,
      [result.insertId]
    );
    const respuesta = {
      success: true,
      mail: mail[0],
    };
    return respuesta;
  } catch (error) {
    logs.error(error)

  }
 
}

export async function cargarMensajeMail(mensajeId) {
  try {
    const [mensaje] = await pool.query(
      "SELECT  emisorMail, asunto, contenido, fecha FROM MensajesMail WHERE id = ? ",
      [mensajeId]
    );
    await pool.query("UPDATE MensajesMail SET leido = 1 WHERE id = ?", [
      mensajeId,
    ]);
    return mensaje[0];
  } catch (error) {
    logs.error(error)
    throw error;
  }
}

export async function cambiarEstadoMailFav(iconFav, id) {

  try {
    await pool.query(
      `UPDATE MensajesMail 
      SET favorito = ?
      WHERE id = ?`,
      [iconFav, id]
    );
    return;
  } catch (error) {
    logs.error(error)

  }
}

export async function cambiarEstadoMailTrash(iconTrash, id) {

  try {
    await pool.query(
      `UPDATE MensajesMail 
       SET eliminado = ?
       WHERE id = ?`,
      [iconTrash, id]
    );
    return;
  } catch (error) {
    logs.error(error)

  }

}

export async function registrarNotificacion(notificacionRecibida) {
  try {
    const [result] = await pool.query(
      "INSERT INTO Notificaciones (id_usuario, contenido_notificacion, tipo_notificacion, fecha) VALUES (UUID_TO_BIN(?), ?, ?, NOW())",
      [
        notificacionRecibida.idUsuarioReceptor,
        notificacionRecibida.contenido_notificacion,
        notificacionRecibida.tipo_notificacion,
      ]
    );
    // Obtener la fila recién creada
    const [nuevaFila] = await pool.query(
      "SELECT id, contenido_notificacion, tipo_notificacion, DATE_FORMAT(fecha, '%d/%m/%y %H:%i') AS fecha_formateada FROM Notificaciones WHERE id = ?",
      [result.insertId]
    );

    return nuevaFila; // Devolver la primera (y única) fila
  } catch (error) {
    logs.error(error)
    throw error;
  }
}

export async function cargarListaNotificaciones(id) {
  try {
    const notificaciones = await pool.query(
      "SELECT id, BIN_TO_UUID(id_usuario) as id_usuario, DATE_FORMAT(fecha, '%d/%m/%y %H:%i') AS fecha_formateada, tipo_notificacion, contenido_notificacion FROM Notificaciones WHERE leido = 0 AND id_usuario= UUID_TO_BIN(?)",
      [id]
    );
    

    if (notificaciones.length === 0) {
      return null;
    } else {
      return notificaciones[0];
    }
  } catch (err) {
    logs.error(err)
    return null;
  }
}

export async function marcarLeidaNotificacion(notificacionId) {
  try {
    await pool.query(
      "UPDATE Notificaciones Set leido = 1 WHERE id = ?",
      [notificacionId]
    );
    return;
  } catch (err) {
    logs.error(err)
  }
}

export async function programarNotificacionesAutomaticas(id, fecha_emision) {
  try {
    const fechaEmision = new Date(fecha_emision);

    const ahora = new Date();

    // Verificar si la fecha de emisión es futura
    if (fechaEmision > ahora) {
      // Convertir fecha_emision a formato cron
      const minutos = fechaEmision.getMinutes();
      const horas = fechaEmision.getHours();
      const dia = fechaEmision.getDate();
      const mes = fechaEmision.getMonth() + 1; // Los meses en JS son 0-based
      const cronExpression = `${minutos} ${horas} ${dia} ${mes} *`;

      // Programar la tarea con node-cron
      const tarea = cron.schedule(
        cronExpression,
        async () => {
          try {
            // Realizar la petición POST a /enviarNotificacionAutomatica
            const response = await axios.post(
              `${URL_BASE}/enviarNotificacionAutomatica`,
              { id },
              { timeout: 5000 }
            );
       

            // Actualizar el estado de la notificación a 'Enviada'
            await pool.query(
              "UPDATE NotificacionesAutomaticas SET estado = ? WHERE id = ?",
              ["Enviada", id]
            );

          
          } catch (error) {
            logs.error(error)
          }
        },
        {
          scheduled: true,
          timezone: "Europe/Madrid",
        }
      );

    } else {
      // Si la fecha ya pasó, marcar como 'Cancelada'
      await pool.query(
        "UPDATE NotificacionesAutomaticas SET estado = ? WHERE id = ?",
        ["Cancelada", id]
      );
    }
  } catch (error) {
    logs.error(error)
  }
}

export async function obtenerNotificacionAutomaticaPorId(id) {
  try {
    const [infoNotificacionAutomatica] = await pool.query(
      "SELECT contenido, tipo_notificacion, BIN_TO_UUID(id_receptor) AS id_receptor FROM NotificacionesAutomaticas WHERE id = ?",
      [id]
    );
    if (infoNotificacionAutomatica.length < 0) {
      return null;
    }
    await pool.query(
      "UPDATE NotificacionesAutomaticas SET estado = 'Enviada' WHERE id = ?",
      [id]
    );

    return infoNotificacionAutomatica[0];
  } catch (err) {
    logs.error(err)
    return null;
  }
}

export async function startServerConfigurarEventos() {
  try {
    const [notificacionesPendientes] = await pool.query(
      "SELECT id , DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS fecha_emision FROM NotificacionesAutomaticas WHERE estado = 'Pendiente'"
    );
    

    for (const notificacion of notificacionesPendientes) {
      const { id, fecha_emision } = notificacion;
      try {
        const fechaEmision = new Date(fecha_emision);     
        const ahora = new Date();

        // Verificar si la fecha de emisión es futura
        if (fechaEmision > ahora) {
          // Convertir fecha_emision a formato cron
          const minutos = fechaEmision.getMinutes();
          const horas = fechaEmision.getHours();
          const dia = fechaEmision.getDate();
          const mes = fechaEmision.getMonth() + 1; // Los meses en JS son 0-based
          const cronExpression = `${minutos} ${horas} ${dia} ${mes} *`;

          // Programar la tarea con node-cron
          cron.schedule(
            cronExpression,
            async () => {
              try {
                // Realizar la petición POST a /enviarNotificacionAutomatica
                const response = await axios.post(
                  `${URL_BASE}/enviarNotificacionAutomatica`,
                  { id },
                  { timeout: 5000 }
                );
                

                // Actualizar el estado de la notificación a 'Enviada'
                await pool.query(
                  "UPDATE NotificacionesAutomaticas SET estado = ? WHERE id = ?",
                  ["Enviada", id]
                );             
              } catch (error) {

                logs.error(error)

              }
            },
            {
              scheduled: true,
              timezone: "Europe/Madrid",
            }
          );

        } else {
          // Si la fecha ya pasó, marcar como 'Cancelada'
          await pool.query(
            "UPDATE NotificacionesAutomaticas SET estado = ? WHERE id = ?",
            ["Cancelada", id]
          );
        }
      } catch (error) {
        logs.error(error);
      }
    }

    

    //Configuración de respaldo semanal | copias de seguridad todos los lunes a las 00:00
    const cronExpressionCopiasDeSeg = "0 0 0 * * 1";
    cron.schedule(cronExpressionCopiasDeSeg, async () => {
      try {
        const response = await axios.post(
          `${URL_BASE}/hacerCopiaDeSeguridad`,
          {},
          { timeout: 5000 }
        );
      } catch (error) {
        logs.error(error);

      }
    });

  } catch (error) {
    logs.error(error)
    throw error;
  }
}
