/**
 * Rutas de ingresos
 *
 * Ingresos hospitalarios, camas y traslados.
 */
import { Router } from "express";
import { asyncHandler } from "../middleware/errores.js";
import { requireQuery } from "../middleware/validacion.js";
import { requireAuth } from "../middleware/auth.js";
import * as controlador from "../controllers/ingresos.controller.js";

export const router = Router();


// Rutas de API: devuelven datos, no pantallas.
router.get("/cargarMedicosYCamas", requireAuth, asyncHandler(controlador.cargarMedicosYCamasHandler));
router.get("/cargarEspecialidadesAPI", requireAuth, asyncHandler(controlador.cargarEspecialidadesAPI));
router.get("/cargarIngresadosFiltro", requireAuth, requireQuery("medico_id"), asyncHandler(controlador.cargarIngresadosFiltroHandler));
router.get("/buscarIngresado", requireAuth, requireQuery("documento_identificacion_paciente"), asyncHandler(controlador.buscarIngresadoHandler));
router.get("/cargarTodosLosMedicos", requireAuth, asyncHandler(controlador.cargarTodosLosMedicosHandler));
router.get("/cargarMedicosEspecialidad", requireAuth, asyncHandler(controlador.cargarMedicosEspecialidadHandler));
router.post("/medicina/altaMedicaPaciente", requireAuth, asyncHandler(controlador.nuevaAltaMedicaPacienteHandler));
router.post("/enfermeria/cambiarEstadoDeBloqueoCama", requireAuth, asyncHandler(controlador.cambiarEstadoDeBloqueoCamaHandler));
router.post("/enfermeria/actualizarZonaDeTrabajo", requireAuth, asyncHandler(controlador.actualizarZonaDeTrabajoHandler));
router.post("/ingresarPaciente", requireAuth, asyncHandler(controlador.ingresarPacienteHandler));
router.get("/cargarEspecialidades", requireAuth, asyncHandler(controlador.cargarEspecialidadesHandler));
