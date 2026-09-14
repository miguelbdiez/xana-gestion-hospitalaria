/**
 * Controlador de comunicaciones
 *
 * Chat interno, correo entre empleados y notificaciones.
 *
 * Los manejadores asumen que ya han pasado por `requireAuth`, de modo que
 * `req.usuario` esta disponible, y por `cargarContextoUsuario` cuando la
 * pantalla necesita la barra lateral de chat y notificaciones.
 */

import { cargarInfoPersonaPrimerChat, cargarListaMails, cargarMensajeMail, cargarMensajesChatIndividual, enviarMail, verificarExistenciaCorreo } from "../repositories/comunicaciones.repository.js";
import { cargarEspecialidades, cargarListaContactos } from "../repositories/ingresos.repository.js";
export const comunicacionHome = async (req, res) => {
  const data = req.usuario;

      try {

        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };
        switch(rol){

          case 'medico':
            res.render("medico/comunicacionHome", { info });
            break
          case 'secretario':
            res.render("secretaria/comunicacionHome", { info });
            break
          case 'enfermero':
            res.render("enfermeria/comunicacionHome", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/comunicacionHome", { info });
            break
          case 'administrador':
            res.render("administrador/comunicacionHome", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }

        res.render("secretaria/comunicacionHome", { info });
      } catch (error) {
        console.error("Error en /documentos:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const comunicacionChat = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol;

        const mensajesPrimerChat = await cargarMensajesChatIndividual(data.id,res.locals.contexto.listaPersonasChat[0].id);

        const infoChat = {
          nombre: res.locals.contexto.listaPersonasChat[0].nombre,
          id: res.locals.contexto.listaPersonasChat[0].id,
          foto_perfil: res.locals.contexto.listaPersonasChat[0].foto_perfil,
          mensajesPrimerChat: mensajesPrimerChat,
        };
        const info = {
      ...res.locals.contexto,
          infoChat: infoChat,
        };

        switch(rol){

          case 'medico':
             res.render("medico/comunicacion/chat/chat", { info });
            break
          case 'secretario':
            res.render("secretaria/comunicacion/chat/chat", { info });
            break
          case 'enfermero':
            res.render("enfermeria/comunicacion/chat/chat", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/comunicacion/chat/chat", { info });
            break
          case 'administrador':
            res.render("administrador/comunicacion/chat/chat", { info });
            break
          default:
            res.status(403).send('No autorizado');
        }
        return
      }catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const comunicacionChatChatDirecto = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const idUserReceptor = req.query.idUser;
        const mensajesPrimerChat = await cargarMensajesChatIndividual(data.id,idUserReceptor);
        const infoPersonaPrimerChat = await cargarInfoPersonaPrimerChat(idUserReceptor);

        const infoChat = {
          nombre: infoPersonaPrimerChat.nombre,
          id: infoPersonaPrimerChat.id,
          foto_perfil: infoPersonaPrimerChat.foto_perfil,
          mensajesPrimerChat: mensajesPrimerChat,
        };

        const info = {
      ...res.locals.contexto,
          infoChat: infoChat,
        };
        switch(rol){

          case 'medico':
             res.render("medico/comunicacion/chat", { info });
            break
          case 'secretario':
            res.render("secretaria/comunicacion/chat/chat", { info });
            break
          case 'enfermero':
            res.render("enfermeria/comunicacion/chat", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/comunicacion/chat", { info });
            break
          case 'administrador':
            res.render("administrador/comunicacion/chat", { info });
            break
          default:
            res.status(403).send('No autorizado');
        }
        return
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const comunicacionContactos = async (req, res) => {
  const data = req.usuario;

      try {

        const rol = data.rol;

        const listaContactos = await cargarListaContactos();
        const especialidades = await cargarEspecialidades();

        const info = {
      ...res.locals.contexto,
          listaContactos: listaContactos,
          especialidades: especialidades,
        };

        switch(rol){

          case 'medico':
             res.render("medico/comunicacion/contactos/contactos", { info });
            break
          case 'secretario':
            res.render("secretaria/comunicacion/contactos/contactos", { info });
            break
          case 'enfermero':
            res.render("enfermeria/comunicacion/contactos/contactos", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/comunicacion/contactos/contactos", { info });
            break
          case 'administrador':
            res.render("administrador/comunicacion/contactos/contactos", { info });
            break
          default:
            res.status(403).send('No autorizado');
        }

      }catch (error) {
        console.error("Error en /documentos:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const comunicacionMailBandeja = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const listaMails = await cargarListaMails(data.correo_electronico,"Bandeja");

        const info = {
      ...res.locals.contexto,
          listaMails: listaMails,
          tipo_mail:"Bandeja"
        };

        switch(rol){

          case 'medico':
             res.render("medico/comunicacion/mail/mailComun", { info });
            break
          case 'secretario':
            res.render("secretaria/comunicacion/mail/mailComun", { info });
            break
          case 'enfermero':
            res.render("enfermeria/comunicacion/mail/mailComun", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/comunicacion/mail/mailComun", { info });
            break
          case 'administrador':
            res.render("administrador/comunicacion/mail/mailComun", { info });
            break
          default:
            res.status(403).send('No autorizado');
        }
        return

      }catch (error) {
        console.error("Error en /documentos:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const comunicacionMailMailFavoritos = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const listaMails = await cargarListaMails(data.correo_electronico,"Favoritos");

        const info = {
      ...res.locals.contexto,
          listaMails: listaMails,
          tipo_mail:"Favoritos"
        };

        switch(rol){

          case 'medico':
             res.render("medico/comunicacion/mail/mailComun", { info });
            break
          case 'secretario':
            res.render("secretaria/comunicacion/mail/mailComun", { info });
            break
          case 'enfermero':
            res.render("enfermeria/comunicacion/mail/mailComun", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/comunicacion/mail/mailComun", { info });
            break
          case 'administrador':
            res.render("administrador/comunicacion/mail/mailComun", { info });
            break
          default:
            res.status(403).send('No autorizado');
        }
        return

      }catch (error) {
        console.error("Error en :", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const comunicacionMailMailEliminados = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const listaMails = await cargarListaMails(data.correo_electronico,"Eliminados");

        const info = {
      ...res.locals.contexto,
          listaMails: listaMails,
          tipo_mail:"Eliminados"
        };

        switch(rol){

          case 'medico':
             res.render("medico/comunicacion/mail/mailComun", { info });
            break
          case 'secretario':
            res.render("secretaria/comunicacion/mail/mailComun", { info });
            break
          case 'enfermero':
            res.render("enfermeria/comunicacion/mail/mailComun", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/comunicacion/mail/mailComun", { info });
            break
          case 'administrador':
            res.render("administrador/comunicacion/mail/mailComun", { info });
            break
          default:
            res.status(403).send('No autorizado');
        }
        return

      }catch (error) {
        console.error("Error :", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const comunicacionMailMailEnviados = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const listaMails = await cargarListaMails(data.correo_electronico,"Enviados");

        const info = {
      ...res.locals.contexto,
          listaMails: listaMails,
          tipo_mail:"Enviados"
        };

        switch(rol){

          case 'medico':
             res.render("medico/comunicacion/mail/mailComun", { info });
            break
          case 'secretario':
            res.render("secretaria/comunicacion/mail/mailComun", { info });
            break
          case 'enfermero':
            res.render("enfermeria/comunicacion/mail/mailComun", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/comunicacion/mail/mailComun", { info });
            break
          case 'administrador':
            res.render("administrador/comunicacion/mail/mailComun", { info });
            break
          default:
            res.status(403).send('No autorizado');
        }
        return

      }catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const comunicacionMailVerMail = async (req, res) => {
  const data = req.usuario;

      try {

        const mensajeId = req.query.mailId;
        const rol = data.rol

        const mensaje = await cargarMensajeMail(mensajeId);

        const info = {
      ...res.locals.contexto,
          mensaje,
        };

        switch(rol){

          case 'medico':
             res.render("medico/comunicacion/mail/verMail", { info });
            break
          case 'secretario':
            res.render("secretaria/comunicacion/mail/verMail", { info });
            break
          case 'enfermero':
            res.render("enfermeria/comunicacion/mail/verMail", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/comunicacion/mail/verMail", { info });
            break
          case 'administrador':
            res.render("administrador/comunicacion/mail/verMail", { info });
            break
          default:
            res.status(403).send('No autorizado');
        }
        return

      }catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const comunicacionMailNewMail = async (req, res) => {
  const data = req.usuario;

      try {

        const rol = data.rol
        const correo_electronico = data.correo_electronico

        const info = {
      ...res.locals.contexto,
          correo_electronico
        };

        switch(rol){

          case 'medico':
             res.render("medico/comunicacion/mail/newMail", { info });
            break
          case 'secretario':
            res.render("secretaria/comunicacion/mail/newMail", { info });
            break
          case 'enfermero':
            res.render("enfermeria/comunicacion/mail/newMail", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/comunicacion/mail/newMail", { info });
            break
          case 'administrador':
            res.render("administrador/comunicacion/mail/newMail", { info });
            break
          default:
            res.status(403).send('No autorizado');
        }
        return

      }catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const comunicacionMailNewMailDirecto = async (req, res) => {
  const data = req.usuario;

      try {

        const correo_electronico_receptor = req.query.correo;
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
          correo_electronico_receptor,
          correo_electronico: data.correo_electronico,
        };

        switch(rol){

          case 'medico':
             res.render("medico/comunicacion/mail/newMailDirecto", { info });
            break
          case 'secretario':
            res.render("secretaria/comunicacion/mail/newMailDirecto", { info });
            break
          case 'enfermero':
            res.render("enfermeria/comunicacion/mail/newMailDirecto", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/comunicacion/mail/newMailDirecto", { info });
            break
          case 'administrador':
            res.render("administrador/comunicacion/mail/newMailDirecto", { info });
            break
          default:
            res.status(403).send('No autorizado');
        }
        return

      }catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const enviarMailHandler = async (req, res) => {
  const { from, to, asunto, message } = req.body;

  const respuestaExisteCorreo =
    await verificarExistenciaCorreo(to);
  if (respuestaExisteCorreo.success != true) {
    res.send(respuestaExisteCorreo);
    return;
  }

  const respuesta = await enviarMail(
    from,
    to,
    asunto,
    message
  );

  res.send(respuesta);
};

export const cargarMensajesChatIndividualHandler = async (req, res) => {
  const { usuarioEmisorId, usuarioReceptorId } = req.query;

  const mensajesChatOrdenados =
    await cargarMensajesChatIndividual(
      usuarioEmisorId,
      usuarioReceptorId
    );
  res.send(mensajesChatOrdenados);
};
