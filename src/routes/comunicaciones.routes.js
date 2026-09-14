/**
 * Rutas de comunicaciones
 *
 * Chat interno, correo entre empleados y notificaciones.
 */
import { Router } from "express";
import { asyncHandler } from "../middleware/errores.js";
import { requireQuery } from "../middleware/validacion.js";
import { requireAuth } from "../middleware/auth.js";
import { cargarContextoUsuario } from "../middleware/contextoUsuario.js";
import * as controlador from "../controllers/comunicaciones.controller.js";

export const router = Router();

router.get("/comunicacionHome", requireAuth, cargarContextoUsuario, asyncHandler(controlador.comunicacionHome));
router.get("/comunicacion/chat", requireAuth, cargarContextoUsuario, asyncHandler(controlador.comunicacionChat));
router.get("/comunicacion/chat/chatDirecto", requireAuth, cargarContextoUsuario, requireQuery("idUser"), asyncHandler(controlador.comunicacionChatChatDirecto));
router.get("/comunicacion/contactos", requireAuth, cargarContextoUsuario, asyncHandler(controlador.comunicacionContactos));
router.get("/comunicacion/mail/bandeja", requireAuth, cargarContextoUsuario, asyncHandler(controlador.comunicacionMailBandeja));
router.get("/comunicacion/mail/mailFavoritos", requireAuth, cargarContextoUsuario, asyncHandler(controlador.comunicacionMailMailFavoritos));
router.get("/comunicacion/mail/mailEliminados", requireAuth, cargarContextoUsuario, asyncHandler(controlador.comunicacionMailMailEliminados));
router.get("/comunicacion/mail/mailEnviados", requireAuth, cargarContextoUsuario, asyncHandler(controlador.comunicacionMailMailEnviados));
router.get("/comunicacion/mail/verMail", requireAuth, cargarContextoUsuario, requireQuery("mailId"), asyncHandler(controlador.comunicacionMailVerMail));
router.get("/comunicacion/mail/newMail", requireAuth, cargarContextoUsuario, asyncHandler(controlador.comunicacionMailNewMail));
router.get("/comunicacion/mail/newMailDirecto", requireAuth, cargarContextoUsuario, requireQuery("correo"), asyncHandler(controlador.comunicacionMailNewMailDirecto));

// Rutas de API: devuelven datos, no pantallas.
router.get("/cargarMensajesChatIndividual", requireAuth, requireQuery("usuarioEmisorId", "usuarioReceptorId"), asyncHandler(controlador.cargarMensajesChatIndividualHandler));
// /enviarNotificacionAutomatica se monta en app.js: necesita la instancia de Socket.IO.
router.post("/enviarMail", requireAuth, asyncHandler(controlador.enviarMailHandler));
