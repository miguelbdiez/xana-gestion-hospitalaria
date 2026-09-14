/**
 * Rutas de clinica
 *
 * Planta, ficha del paciente y toda su actividad clinica.
 */
import { Router } from "express";
import { asyncHandler } from "../middleware/errores.js";
import { requireQuery } from "../middleware/validacion.js";
import { requireAuth } from "../middleware/auth.js";
import { cargarContextoUsuario } from "../middleware/contextoUsuario.js";
import * as controlador from "../controllers/clinica.controller.js";

export const router = Router();

router.get("/planta", requireAuth, cargarContextoUsuario, asyncHandler(controlador.planta));
router.get("/paciente", requireAuth, cargarContextoUsuario, requireQuery("ingreso_id", "cama_id"), asyncHandler(controlador.paciente));
router.get("/paciente/diagnosticoPaciente", requireAuth, cargarContextoUsuario, requireQuery("ingreso_id"), asyncHandler(controlador.pacienteDiagnosticoPaciente));
router.get("/paciente/medicacionPaciente", requireAuth, cargarContextoUsuario, requireQuery("ingreso_id"), asyncHandler(controlador.pacienteMedicacionPaciente));
router.get("/paciente/evolutivoMedico", requireAuth, cargarContextoUsuario, requireQuery("ingreso_id"), asyncHandler(controlador.pacienteEvolutivoMedico));
router.get("/paciente/evolutivoEnfermeria", requireAuth, cargarContextoUsuario, requireQuery("ingreso_id"), asyncHandler(controlador.pacienteEvolutivoEnfermeria));
router.get("/paciente/constantesPaciente", requireAuth, cargarContextoUsuario, requireQuery("ingreso_id"), asyncHandler(controlador.pacienteConstantesPaciente));
router.get("/paciente/balancePaciente", requireAuth, cargarContextoUsuario, requireQuery("ingreso_id"), asyncHandler(controlador.pacienteBalancePaciente));
router.get("/paciente/viasPaciente", requireAuth, cargarContextoUsuario, requireQuery("ingreso_id"), asyncHandler(controlador.pacienteViasPaciente));
router.get("/paciente/viaPaciente", requireAuth, cargarContextoUsuario, requireQuery("ingreso_id", "id_via"), asyncHandler(controlador.pacienteViaPaciente));
router.get("/paciente/testPaciente", requireAuth, cargarContextoUsuario, requireQuery("ingreso_id"), asyncHandler(controlador.pacienteTestPaciente));
router.get("/secretaria/PacientesIngresados", requireAuth, cargarContextoUsuario, asyncHandler(controlador.secretariaPacientesIngresados));
router.get("/secretaria/PacientesIngresados/pacientesHome", requireAuth, cargarContextoUsuario, asyncHandler(controlador.secretariaPacientesIngresadosPacientesHome));
router.get("/secretaria/PacientesIngresados/ingresadosHome", requireAuth, cargarContextoUsuario, asyncHandler(controlador.secretariaPacientesIngresadosIngresadosHome));
router.get("/secretaria/consultarIngresados", requireAuth, cargarContextoUsuario, asyncHandler(controlador.secretariaConsultarIngresados));
router.get("/secretaria/consultarPacientes", requireAuth, cargarContextoUsuario, asyncHandler(controlador.secretariaConsultarPacientes));
router.get("/secretaria/registrarPaciente", requireAuth, cargarContextoUsuario, asyncHandler(controlador.secretariaRegistrarPaciente));
router.get("/secretaria/ingresoPaciente", requireAuth, cargarContextoUsuario, asyncHandler(controlador.secretariaIngresoPaciente));
router.get("/medicina/consultarEpisodiosPaciente", requireAuth, cargarContextoUsuario, requireQuery("historia_id"), asyncHandler(controlador.medicinaConsultarEpisodiosPaciente));
router.get("/medicina/episodioPaciente", requireAuth, cargarContextoUsuario, requireQuery("episodio", "historia_id"), asyncHandler(controlador.medicinaEpisodioPaciente));

// Rutas de API: devuelven datos, no pantallas.
router.post("/medico/paciente/nuevaEntradaEvolutivoMedicina", requireAuth, asyncHandler(controlador.nuevaEntradaEvolutivoMedicinaHandler));
router.get("/enfermeria/recuperarVariablesTest", requireAuth, requireQuery("id_del_test", "ingreso_id", "tipo_prueba"), asyncHandler(controlador.recuperarVariablesTestHandler));
router.post("/enfermeria/nuevaEntradaMantenimiento", requireAuth, asyncHandler(controlador.nuevaEntradaMantenimientoHandler));
router.post("/enfermeria/retirarVia", requireAuth, asyncHandler(controlador.nuevaRetirarViaHandler));
router.post("/enfermeria/nuevaEntradaVia", requireAuth, asyncHandler(controlador.nuevaEntradaViaHandler));
router.post("/enfermeria/cambiarEstadoBalancePanel", requireAuth, asyncHandler(controlador.cambiarEstadoBalancePanelHandler));
router.get("/enfermeria/recuperarConstantesGraficos", requireAuth, requireQuery("constantes", "ingreso_id"), asyncHandler(controlador.recuperarValoresConstantesGraficosHandler));
router.post("/enfermeria/paciente/nuevaEntradaEvolutivo", requireAuth, asyncHandler(controlador.nuevaEntradaEvolutivoEnfermeriaHandler));
router.post("/enfermeria/paciente/nuevaEntradaTest", requireAuth, asyncHandler(controlador.nuevaEntradaTestHandler));
router.post("/enfermeria/paciente/nuevaEntradaConstantes", requireAuth, asyncHandler(controlador.nuevaEntradaConstantesHandler));
router.post("/enfermeria/nuevaEntradaBalance", requireAuth, asyncHandler(controlador.nuevaEntradaBalanceHandler));
router.get("/enfermeria/recuperarDetallesBalance", requireAuth, requireQuery("id_balance", "ingreso_id"), asyncHandler(controlador.recuperarDetallesBalanceHandler));
router.post("/enfermeria/reportarIncidencia", requireAuth, asyncHandler(controlador.reportarIncidenciaHandler));
router.post("/enfermeria/desactivarIncidencia", requireAuth, asyncHandler(controlador.desactivarIncidenciaHandler));
router.post("/enfermeria/actualizarInformacionCabecera", requireAuth, asyncHandler(controlador.actualizarInformacionCabeceraHandler));
