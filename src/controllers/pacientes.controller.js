/**
 * Controlador de pacientes
 */

import { buscarPaciente, modificarDatosPaciente, registroPaciente, verificarExistePaciente } from "../repositories/pacientes.repository.js";
import { logs } from "../services/logs.service.js";
export const modificarDatosPacienteHandler = async (req, res) => {
  //Comprboar campos sintacticamente y logimcamente correctos
  const infoActualizadaPaciente = req.body;

  try {
    const respuesta = await modificarDatosPaciente(infoActualizadaPaciente);
    if(respuesta){
      res.status(201).send();

    }else{
      res.status(500).send();

    }

  } catch (error) {
    logs.error(error)
    res.status(500);
  }
};

export const registroPacienteHandler = async (req, res) => {
  //Comprboar campos sintacticamente y logimcamente correctos

  const {
    documento_identificacion,
    nombreRegistro,
    apellido1Registro,
    apellido2Registro,
    fecha_nacimientoRegistro,
    sexoRegistro,
    direccionRegistro,
    telefonoRegistro,
    correo_electronicoRegistro,
    persona_emergenciaRegistro,
    contacto_emergenciaRegistro,
    nacionalidadRegistro,
    directo,
  } = req.body;

  try {
    const respuesta = await registroPaciente(
      documento_identificacion,
      nombreRegistro,
      apellido1Registro,
      apellido2Registro,
      fecha_nacimientoRegistro,
      sexoRegistro,
      direccionRegistro,
      telefonoRegistro,
      correo_electronicoRegistro,
      persona_emergenciaRegistro,
      contacto_emergenciaRegistro,
      nacionalidadRegistro,
      directo
    );

    res.status(201).send(respuesta);
  } catch (error) {
    logs.error(error)
    res.status(500);
  }
};

export const buscarPacienteHandler = async (req, res) => {
  const documento_identificacion = req.query.documento_identificacion;
  const respuesta = await buscarPaciente(
    documento_identificacion
  );
  res.send(respuesta);
};

export const verificarExistePacienteHandler = async (req, res) => {
 
  const documentoDeIdentificacion = req.query.documento;
  try {
    const result = await verificarExistePaciente(
      documentoDeIdentificacion
    );
    res.status(201).json(result);
  } catch(error){
    logs.error(error)
  }

  return;
};
