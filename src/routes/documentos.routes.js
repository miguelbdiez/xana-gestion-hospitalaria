/**
 * Rutas de documentos
 *
 * Documentacion oficial: generacion, bandeja y tramites.
 */
import { Router } from "express";
import { asyncHandler } from "../middleware/errores.js";
import { requireQuery } from "../middleware/validacion.js";
import { requireAuth } from "../middleware/auth.js";
import { cargarContextoUsuario, cargarManualUsuario } from "../middleware/contextoUsuario.js";
import * as controlador from "../controllers/documentos.controller.js";

export const router = Router();

router.get("/recuperarPDF", requireQuery("id"), asyncHandler(controlador.recuperarPDF));
router.get("/crearpdfrellenable", asyncHandler(controlador.crearpdfrellenable));
router.get("/consultarManual", requireAuth, cargarContextoUsuario, cargarManualUsuario, asyncHandler(controlador.consultarManual));
router.get("/documentos", requireAuth, cargarContextoUsuario, asyncHandler(controlador.documentos));
router.get("/documentos/listaEmitirDocumento", requireAuth, cargarContextoUsuario, asyncHandler(controlador.documentosListaEmitirDocumento));
router.get("/documentos/visorDocumentoWeb", requireAuth, cargarContextoUsuario, requireQuery("tipo_documento"), asyncHandler(controlador.documentosVisorDocumentoWeb));
router.get("/documentos/listaDocumentos", requireAuth, cargarContextoUsuario, asyncHandler(controlador.documentosListaDocumentos));
router.get("/documentos/imprimirDocumento", requireAuth, cargarContextoUsuario, requireQuery("tipo_documento"), asyncHandler(controlador.documentosImprimirDocumento));
router.get("/documentos/todosDocumentos", requireAuth, cargarContextoUsuario, asyncHandler(controlador.documentosTodosDocumentos));
router.get("/documentos/visorDocumento", requireAuth, cargarContextoUsuario, requireQuery("idDocumento"), asyncHandler(controlador.documentosVisorDocumento));
router.get("/secretaria/tramitarRegistro", requireAuth, cargarContextoUsuario, requireQuery("id"), asyncHandler(controlador.secretariaTramitarRegistro));
router.get("/secretaria/documentos/bandejaEntrada_Documentos", requireAuth, cargarContextoUsuario, asyncHandler(controlador.secretariaDocumentosBandejaEntradaDocumentos));

// Rutas de API: devuelven datos, no pantallas.
router.post("/secretariaEnviarBandejaDocumentos", requireAuth, asyncHandler(controlador.enviarBandejaDocumentosHandler));
router.post("/secretaria/documentos/generarPdf", requireAuth, asyncHandler(controlador.generarPdfHandler));
router.post("/secretaria/documentos/accionPdf", requireAuth, asyncHandler(controlador.accionPdfHandler));
router.post("/secretaria/documentos/descartarPeticionDocumento", requireAuth, asyncHandler(controlador.descartarPeticionDeDocumento));
