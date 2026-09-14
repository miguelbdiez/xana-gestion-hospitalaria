/**
 * Rutas de farmacia
 *
 * Medicacion, inventario, pedidos y consulta al catalogo CIMA de la AEMPS.
 */
import { Router } from "express";
import { asyncHandler } from "../middleware/errores.js";
import { requireAuth } from "../middleware/auth.js";
import { cargarContextoUsuario } from "../middleware/contextoUsuario.js";
import * as controlador from "../controllers/farmacia.controller.js";

export const router = Router();

router.get("/cima/cimaHome", requireAuth, cargarContextoUsuario, asyncHandler(controlador.cimaCimaHome));
router.get("/cima/medicamentosCima", requireAuth, cargarContextoUsuario, asyncHandler(controlador.cimaMedicamentosCima));
router.get("/cima/medicamentoCima", requireAuth, cargarContextoUsuario, asyncHandler(controlador.cimaMedicamentoCima));
router.get("/cima/documentoSegmentadoCima", requireAuth, cargarContextoUsuario, asyncHandler(controlador.cimaDocumentoSegmentadoCima));
router.get("/cima/descripcionClinicaCima", requireAuth, cargarContextoUsuario, asyncHandler(controlador.cimaDescripcionClinicaCima));
router.get("/cima/registroCambiosCima", requireAuth, cargarContextoUsuario, asyncHandler(controlador.cimaRegistroCambiosCima));
router.get("/cima/presentacionesCima", requireAuth, cargarContextoUsuario, asyncHandler(controlador.cimaPresentacionesCima));
router.get("/cima/maestrasCima", requireAuth, cargarContextoUsuario, asyncHandler(controlador.cimaMaestrasCima));
router.get("/cima/notasSeguridadCima", requireAuth, cargarContextoUsuario, asyncHandler(controlador.cimaNotasSeguridadCima));
router.get("/cima/materialesInformativosSeguridadCima", requireAuth, cargarContextoUsuario, asyncHandler(controlador.cimaMaterialesInformativosSeguridadCima));
router.get("/enfermeria/farmacia", requireAuth, cargarContextoUsuario, asyncHandler(controlador.enfermeriaFarmacia));

// Rutas de API: devuelven datos, no pantallas.
router.get("/SimulacionRecibirPedidosFarmacia", requireAuth, asyncHandler(controlador.SimulacionRecibirPedidosFarmaciaHandler));
router.get("/buscarMedicamentosCoincidenciaNombre", requireAuth, asyncHandler(controlador.buscarMedicamentosCoincidenciaNombreHandler));
router.post("/paciente/agregarMedicacion", requireAuth, asyncHandler(controlador.agregarMedicacionHandler));
router.post("/paciente/actualizarMedicacion", requireAuth, asyncHandler(controlador.actualizarMedicacionHandler));
router.post("/enfermeria/administrarMedicacion", requireAuth, asyncHandler(controlador.nuevaEntradaAdministracionMedicacionHandler));
router.post("/enfermeria/nuevoPedidoFarmacia", requireAuth, asyncHandler(controlador.nuevoPedidoFarmaciaHandler));
