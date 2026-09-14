/**
 * Rutas de medicina
 *
 * Diagnostico, expedientes y codificacion CIE-11.
 */
import { Router } from "express";
import { asyncHandler } from "../middleware/errores.js";
import { requireAuth } from "../middleware/auth.js";
import { cargarContextoUsuario } from "../middleware/contextoUsuario.js";
import * as controlador from "../controllers/medicina.controller.js";

export const router = Router();

router.get("/buscarDetallesCodigoCIE11", asyncHandler(controlador.buscarDetallesCodigoCIE11));
router.post("/buscarPalabraClaveCIE11", asyncHandler(controlador.postBuscarPalabraClaveCIE11));
router.get("/medicina/consultarExpedientes", requireAuth, cargarContextoUsuario, asyncHandler(controlador.medicinaConsultarExpedientes));

// Rutas de API: devuelven datos, no pantallas.
router.post("/medicina/emitirDiagnosticoPaciente", requireAuth, asyncHandler(controlador.emitirDiagnosticoPacienteHandler));
router.post("/medicina/actualizarDiagnosticoPaciente", requireAuth, asyncHandler(controlador.actualizarDiagnosticoPacienteHandler));
