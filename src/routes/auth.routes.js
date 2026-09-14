/**
 * Rutas de auth
 *
 * Inicio y cierre de sesion, alta de usuarios y recuperacion de contrasena.
 */
import { Router } from "express";
import { asyncHandler } from "../middleware/errores.js";
import { requireQuery } from "../middleware/validacion.js";
import { requireAuth } from "../middleware/auth.js";
import { cargarContextoUsuario } from "../middleware/contextoUsuario.js";
import * as controlador from "../controllers/auth.controller.js";

export const router = Router();

router.get("/cerrarSesion", asyncHandler(controlador.cerrarSesion));
router.get("/home", requireAuth, cargarContextoUsuario, asyncHandler(controlador.home));
router.get("/resetearContrasena", asyncHandler(controlador.resetearContrasena));
router.get("/recuperarContrasenaMensaje", requireQuery("documento_identificacion"), asyncHandler(controlador.recuperarContrasenaMensaje));
router.post("/resetearContrasena", asyncHandler(controlador.postResetearContrasena));
router.get("/registrarUsuario", requireAuth, cargarContextoUsuario, asyncHandler(controlador.registrarUsuario));
router.get("/RegistroPublicoHospital", asyncHandler(controlador.registroPublicoHospital));

// Rutas de API: devuelven datos, no pantallas.
router.post("/inicioSesion", asyncHandler(controlador.inicioSesionHandler));
router.get("/verificarExistenciaEmpleado", requireQuery("documento_identificacion"), asyncHandler(controlador.verificarExistenciaEmpleadoHandler));
router.post("/registroUsuario", asyncHandler(controlador.registroUsuarioHandler2));
