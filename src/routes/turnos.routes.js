/**
 * Rutas de turnos
 *
 * Cuadrantes de enfermeria y solicitudes de cambio de turno.
 */
import { Router } from "express";
import { asyncHandler } from "../middleware/errores.js";
import { requireQuery } from "../middleware/validacion.js";
import { requireAuth } from "../middleware/auth.js";
import { cargarContextoUsuario } from "../middleware/contextoUsuario.js";
import * as controlador from "../controllers/turnos.controller.js";

export const router = Router();

router.get("/enfermeria/horarios", requireAuth, cargarContextoUsuario, asyncHandler(controlador.enfermeriaHorarios));
router.get("/enfermeriaEncargado/horarios/generarHorario", requireAuth, cargarContextoUsuario, asyncHandler(controlador.enfermeriaEncargadoHorariosGenerarHorario));

// Rutas de API: devuelven datos, no pantallas.
router.get("/enfermeria/horariosHome/recuperarTurnosTrabajador", requireAuth, requireQuery("id"), asyncHandler(controlador.recuperarTurnosTrabajadorHandler));
router.get("/enfermeria/horarios/actualizarCalendario", requireAuth, requireQuery("mes", "año"), asyncHandler(controlador.actualizarCalendarioHandler));
router.post("/enfermeria/horariosHome/solicitarCambioDeTurno", requireAuth, asyncHandler(controlador.solicitarCambioDeTurnoHandler));
router.post("/enfermeria/horariosHome/accionCambioDeTurno", requireAuth, asyncHandler(controlador.accionCambioDeTurnoHandler));
router.post("/enfermeriaEncargado/horarios/confirmarHorario", requireAuth, asyncHandler(controlador.confirmarHorarioHandler));
router.post("/enfermeriaEncargado/horarios/horarioExiste", requireAuth, asyncHandler(controlador.comprobarHorarioExisteHandler));
