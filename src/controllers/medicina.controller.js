/**
 * Controlador de medicina
 *
 * Diagnostico, expedientes y codificacion CIE-11.
 *
 * Los manejadores asumen que ya han pasado por `requireAuth`, de modo que
 * `req.usuario` esta disponible, y por `cargarContextoUsuario` cuando la
 * pantalla necesita la barra lateral de chat y notificaciones.
 */

import { actualizarDiagnosticoPaciente, buscarPalabraClaveCIE11, emitirDiagnosticoPaciente } from "../repositories/medicina.repository.js";
import { cargarTodosPacientesInicio } from "../repositories/pacientes.repository.js";
import { logs } from "../services/logs.service.js";
import { estaConfigurado as cie11Configurado } from "../services/cie11.service.js";
export const buscarDetallesCodigoCIE11 = async (req, res) => {
  // Delegado en buscarDetallesCodigoCIE11, migrado desde el antiguo XanaController.
  return buscarDetallesCodigoCIE11Handler(req, res);
};

export const postBuscarPalabraClaveCIE11 = async (req, res) => {
  if (!cie11Configurado()) {
    return res.status(503).json({
      error: "La integracion con la API CIE-11 de la OMS no esta configurada",
    });
  }

  // Delegado en buscarPalabraClavaCIE11, migrado desde el antiguo XanaController.
  return buscarPalabraClavaCIE11(req, res);
};

export const medicinaConsultarExpedientes = async (req, res) => {
  const data = req.usuario;


        try {

          const rol = data.rol

          const pacientes = await cargarTodosPacientesInicio();

          const info = {
      ...res.locals.contexto,
            pacientes: pacientes,
          };

          switch(rol){

            case 'medico':
              return res.render("medico/expedientes/consultarExpedientes", { info });
            default:
              res.status(403).send('No autorizado');
          }
        }catch (error) {
          console.error("Error:", error);
          res.status(500).send("Error interno del servidor");
        }
};

export const buscarPalabraClavaCIE11 = async (req, res) => {
  try {
    const palabra = req.body.term;
    const respuestaApiOms = await buscarPalabraClaveCIE11(
      palabra
    ); // Ej: MG30.0

    res.send(respuestaApiOms);
  } catch (error) {
    logs.error(error)

    res.status(500).json({ error: "No se pudo consultar la API de la OMS" });
  }
};

export const buscarDetallesCodigoCIE11Handler = async (req, res) => {
  if (!cie11Configurado()) {
    return res.status(503).json({
      error: "La integracion con la API CIE-11 de la OMS no esta configurada",
    });
  }

  try {
    const codigo = req.query.codigo;
    const respuestaApiOms = await buscarDetallesCodigoCIE11(
      codigo
    ); // Ej: MG30.0

    res.json(respuestaApiOms);
  } catch (error) {
    logs.error(error)

    res.status(500).json({ error: "No se pudo consultar la API de la OMS" });
  }
};

export const emitirDiagnosticoPacienteHandler = async (req, res) => {
  try {
    const info = req.body;
    const diagnostico = await emitirDiagnosticoPaciente(info);


    if (diagnostico) {
      res.status(200).json({
        success: true,
        message: "Retirada regsitrada correctamente",
        data: diagnostico,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al registradala retirada de la via",
      });
    }
  } catch (error) {
    logs.error(error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor al añadir la vía",
      error: error.message,
    });
  }
};

export const actualizarDiagnosticoPacienteHandler = async (req, res) => {
  try {
    const info = req.body;
    const diagnosticoActualizado =
      await actualizarDiagnosticoPaciente(info);

    if (diagnosticoActualizado) {
      res.status(200).json({
        success: true,
        message: "actualizacion registrada correctamente",
        data: diagnosticoActualizado,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el diagnostico",
      });
    }
  } catch (error) {
    logs.error(error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor al actualizar diagnostico",
      error: error.message,
    });
  }
};
