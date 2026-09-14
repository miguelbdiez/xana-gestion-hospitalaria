/**
 * Rutas de administracion
 *
 * Empleados, estadisticas y copias de seguridad.
 */
import { Router } from "express";
import { asyncHandler } from "../middleware/errores.js";
import { requireAuth } from "../middleware/auth.js";
import { cargarContextoUsuario } from "../middleware/contextoUsuario.js";
import * as controlador from "../controllers/administracion.controller.js";

export const router = Router();

router.get("/plantillaHospital", requireAuth, cargarContextoUsuario, asyncHandler(controlador.plantillaHospital));
router.get("/recuperarInformacionEmpleado", asyncHandler(controlador.recuperarInformacionEmpleadoHandler));
router.post("/actualizarEspecialidadEmpleado", asyncHandler(controlador.postActualizarEspecialidadEmpleado));
router.post("/actualizarInformacionEmpleado", asyncHandler(controlador.postActualizarInformacionEmpleado));
router.get("/estadisticasHospital", requireAuth, cargarContextoUsuario, asyncHandler(controlador.estadisticasHospital));
router.get("/copiasDeSeguridad", requireAuth, cargarContextoUsuario, asyncHandler(controlador.copiasDeSeguridad));
router.post("/hacerCopiaDeSeguridad", asyncHandler(controlador.postHacerCopiaDeSeguridad));
