/**
 * Eventos de Socket.IO: chat interno, notificaciones y llamadas.
 *
 * Mantiene en memoria el mapa de usuarios conectados para poder entregar los
 * mensajes a todas las sesiones abiertas de un mismo usuario.
 */
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config/index.js";
import {
  cambiarEstadoMailFav,
  cambiarEstadoMailTrash,
  guardarMensajeChat,
  marcarLeidaNotificacion,
  obtenerNotificacionAutomaticaPorId,
  registrarNotificacion,
  verificarExistenciaCorreo,
} from "../repositories/comunicaciones.repository.js";

const usuariosConectados = {}; // Objeto para almacenar la relación entre socketId y usuarioId
const usuariosOcupadosLLamada = new Set(); // Objeto para almacenar la relación entre socketId y usuarioId

export const socketController = async function (io) {
  io.on("connection", (socket) => {
    const usuarioId = socket.handshake.query.usuarioId;

    usuariosConectados[socket.id] = usuarioId; // Asociar el socketId con el usuarioId


    // Recibir mensaje del cliente y enviarlo solo al destinatario específico
    /**CHAT */
    socket.on("mensaje", async (data) => {
     
      const usuarioIdEmisor = usuariosConectados[socket.id];

      // Encontrar el socketId del usuario al que se le enviará el mensaje
      const destinatarioSocketIds = Object.keys(usuariosConectados).filter(
        (key) => usuariosConectados[key] === data.usuarioReceptorMensaje
      );

      const mensajeChatDB = {
        emisor: usuarioIdEmisor,
        receptor: data.usuarioReceptorMensaje,
        contenido: data.contenido,
      };

      if (destinatarioSocketIds.length > 0) {
        // Enviar el mensaje a todas las sesiones activas del receptor
        destinatarioSocketIds.forEach((socketId) => {
          io.to(socketId).emit("mensaje", {
            contenido: data.contenido,
            idEmisor: usuarioIdEmisor,
          });
        });
        
      } 

      await guardarMensajeChat(mensajeChatDB);
    });

    /** MAIL */
    socket.on("cambiarEstadoMailFav", async (data) => {
      const iconFav = data.icon;
      const mailId = data.id;

      await cambiarEstadoMailFav(iconFav, mailId);
    });
    socket.on("cambiarEstadoMailTrash", async (data) => {
      const iconTrash = data.icon;
      const mailId = data.id;
      await cambiarEstadoMailTrash(iconTrash, mailId);
    });

    socket.on("mail", async (data) => {

      const recuperarId = await verificarExistenciaCorreo(
        data.mail.receptorMail
      );
      const destinatarioSocketIds = Object.keys(usuariosConectados).filter(
        (key) => usuariosConectados[key] === recuperarId.id
      );
    


      const notificaionRecibida = {
        tipo_notificacion: 
        "tipo_mail",
        contenido_notificacion: data.mail.asunto,
        idUsuarioReceptor: recuperarId.id,
      };

      const notificacionEnviar = await registrarNotificacion(
        notificaionRecibida
      );

      if (destinatarioSocketIds.length > 0) {
        // Enviar el mensaje a todas las sesiones activas del receptor
        destinatarioSocketIds.forEach((socketId) => {
          io.to(socketId).emit("mail", data.mail);
          io.to(socketId).emit("notificacion", {
            notificacionEnviar: notificacionEnviar,
          });
        });
      }
    });

    //**LLAMADAS */

    socket.on("llamarUsuario", async (data) => {
      usuariosOcupadosLLamada.add(data.emisorId);
      

      if (usuariosOcupadosLLamada.has(data.receptorId) != true) {
        usuariosOcupadosLLamada.add(data.receptorId);


        const receptorSocketId = Object.keys(usuariosConectados).filter(
          (key) => usuariosConectados[key] === data.receptorId
        );
        if (receptorSocketId.length > 0) {
          io.to(receptorSocketId).emit("llamadaEntrante", {
            oferta: data.oferta,
            emisorId: data.emisorId,
            emisorNombre: data.emisorNombre,
          });
        }
      }
    });

    // Manejar candidatos ICE por separado
    socket.on("enviarCandidatoICE", async (data) => {
      const receptorSocketId = Object.keys(usuariosConectados).find(
        (key) => usuariosConectados[key] === data.receptorId
      );
      if (receptorSocketId) {
        if (receptorSocketId.length > 0) {
          io.to(receptorSocketId).emit("recibirCandidatoICE", {
            candidate: data.candidatoICE,
            emisorId: data.emisorId,
          });
        }
      }
    });

    // Aceptar llamada
    socket.on("aceptarLlamada", async (data) => {
      const receptorSocketId = Object.keys(usuariosConectados).filter(
        (key) => usuariosConectados[key] === data.receptorId
      );

      if (receptorSocketId.length > 0) {
        io.to(receptorSocketId).emit("llamadaAceptada", {
          respuestaLlamada: data.respuestaLlamada,
          emisorId: data.emisorId,
          emisorNombre: data.receptorDeLaLLamadaNombre,
        });
      }
    });

    socket.on("rechazarLlamada", async (data) => {
      usuariosOcupadosLLamada.delete(data.emisorId);
      usuariosOcupadosLLamada.delete(data.receptorId);

      const receptorSocketId = Object.keys(usuariosConectados).filter(
        (key) => usuariosConectados[key] === data.receptorId
      );

      if (receptorSocketId.length > 0) {
        io.to(receptorSocketId).emit("llamadaRechazada");
      }
    });

    socket.on("finalizarLlamada", async (data) => {
      usuariosOcupadosLLamada.delete(data.emisorId);
      usuariosOcupadosLLamada.delete(data.receptorId);

      const receptorSocketId = Object.keys(usuariosConectados).filter(
        (key) => usuariosConectados[key] === data.receptorId
      );

      if (receptorSocketId.length > 0) {
        io.to(receptorSocketId).emit("llamadaFinalizada");
      }
    });
    socket.on("finalizarLlamadaEnCurso", async (data) => {
      usuariosOcupadosLLamada.delete(data.emisorId);
      usuariosOcupadosLLamada.delete(data.receptorId);

      const receptorSocketId = Object.keys(usuariosConectados).filter(
        (key) => usuariosConectados[key] === data.receptorId
      );

      if (receptorSocketId.length > 0) {
        io.to(receptorSocketId).emit("llamadaEnCursoFinalizada");
      }
    });

    socket.on("notificacion", async (data) => {

      const notificaionRecibida = {
        tipo_notificacion: data.tipo_notificacion,
        contenido_notificacion: data.contenido_notificacion,
        idUsuarioReceptor: data.idUsuarioReceptor,
      };

      const notificacionEnviar = await registrarNotificacion(
        notificaionRecibida
      );

      const receptorSocketId = Object.keys(usuariosConectados).find(
        (key) => usuariosConectados[key] === data.idUsuarioReceptor
      );
      if (receptorSocketId) {
        if (receptorSocketId.length > 0) {
          io.to(receptorSocketId).emit("notificacion", {
            notificacionEnviar: notificacionEnviar,
          });
        }
      }
    });
    socket.on("notificacionVisto", async (data) => {
      const notificacionId = data.id;
      await marcarLeidaNotificacion(notificacionId);
    });

    socket.on("disconnect", () => {
      // Eliminar la relación entre socketId y usuarioId al desconectar
      delete usuariosConectados[socket.id];
    });
  });
};

export const enviarNotificacionAutomatica = (io) => async (req, res) => {
  try {
    const { id } = req.body; // ID de la notificación
    res.status(200).send;
    // Obtener información de la notificación desde la base de datos
    const notificacion = await obtenerNotificacionAutomaticaPorId(id);
    if (!notificacion) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }

    const notificacionRecibida = {
      tipo_notificacion: notificacion.tipo_notificacion,
      contenido_notificacion: notificacion.contenido,
      idUsuarioReceptor: notificacion.id_receptor,
    };

    const notificacionEnviar = await registrarNotificacion(
      notificacionRecibida
    );

    const receptorSocketId = Object.keys(usuariosConectados).find(
      (key) =>
        usuariosConectados[key] === notificacionRecibida.idUsuarioReceptor
    );
   ;

    if (receptorSocketId) {
      io.to(receptorSocketId).emit("notificacion", {
        notificacionEnviar: notificacionEnviar,
      });
      res.status(200).json({ message: "Notificación enviada con éxito" });
    } else {
      res.status(404).json({ error: "Usuario receptor no conectado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
