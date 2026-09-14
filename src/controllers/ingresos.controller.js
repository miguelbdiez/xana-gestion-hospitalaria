/**
 * Controlador de ingresos
 *
 * Ingresos hospitalarios, camas y traslados.
 *
 * Los manejadores asumen que ya han pasado por `requireAuth`, de modo que
 * `req.usuario` esta disponible, y por `cargarContextoUsuario` cuando la
 * pantalla necesita la barra lateral de chat y notificaciones.
 */

import { actualizarZonaDeTrabajo, buscarIngresado, cambiarEstadoDeBloqueoCama, cargarEspecialidades, cargarIngresadosFiltro, cargarMedicosEspecialidad, cargarMedicosYCamas, cargarTodosLosMedicos, ingresarPaciente, nuevaAltaMedicaPaciente } from "../repositories/ingresos.repository.js";
import { logs } from "../services/logs.service.js";
export const ingresarPacienteHandler = async (req, res) => {

  const {
    documento_identificacion,
    nombre,
    apellido1,
    apellido2,
    especialidad,
    cama_id,
    doctor_id,
    motivoIngreso,
    fecha_nacimiento,
    sexo,
    direccion,
    telefono,
    correo_electronico,
    persona_emergencia,
    contacto_emergencia,
    nacionalidad,
  } = req.body;
  const respuesta = await ingresarPaciente(
    documento_identificacion,
    nombre,
    apellido1,
    apellido2,
    especialidad,
    cama_id,
    doctor_id,
    motivoIngreso,
    fecha_nacimiento,
    sexo,
    direccion,
    telefono,
    correo_electronico,
    persona_emergencia,
    contacto_emergencia,
    nacionalidad
  );
  if (respuesta.success) {
    res.status(200).send(respuesta);
  } else {

    res.status(200).send(respuesta);
  }
};

export const cargarEspecialidadesAPI = async (req, res) => {
  const respuesta = await cargarEspecialidades();
  res.send(respuesta);
};

export const cargarIngresadosFiltroHandler = async (req, res) => {
  const medico_id = req.query.medico_id;
  const especialidad = req.query.especialidad;

  
  const respuesta = await cargarIngresadosFiltro(
    medico_id,
    especialidad
  );
  res.send(respuesta);
};

export const cargarTodosLosMedicosHandler = async (req, res) => {
  const respuesta = await cargarTodosLosMedicos();
  res.send(respuesta);
};

export const buscarIngresadoHandler = async (req, res) => {
  const documento_identificacion_paciente =
    req.query.documento_identificacion_paciente;
  const respuesta = await buscarIngresado(
    documento_identificacion_paciente
  );
  res.send(respuesta);
};

export const cargarMedicosEspecialidadHandler = async (req, res) => {
   const especialidad = req.query.especialidad;
  const respuesta = await cargarMedicosEspecialidad(
    especialidad
  );
  res.send(respuesta);
};

export const cargarMedicosYCamasHandler = async (req, res) => {
  const especialidad = req.query.especialidad;
  const respuesta = await cargarMedicosYCamas(especialidad);
  res.send(respuesta);
};

export const actualizarZonaDeTrabajoHandler = async (req, res) => {
   const infoZonaDeTrabajo = req.body;
   const success = await actualizarZonaDeTrabajo(
    infoZonaDeTrabajo
  );
  
  res.send({ success: success });
};

export const cambiarEstadoDeBloqueoCamaHandler = async (req, res) => {
  try {
    const { cama_id, nuevoEstadoBloqueo } = req.body;
    const success = await cambiarEstadoDeBloqueoCama(
      cama_id,
      nuevoEstadoBloqueo
    );

    if (success) {
      res.status(200).json({
        success: true,
        message: "medicamento agrado correctamente",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al agregar medicamento",
      });
    }
  } catch (error) {
    logs.error(error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor al agregar medicamento",
      error: error.message,
    });
  }
};

export const nuevaAltaMedicaPacienteHandler = async (req, res) => {
  try {
    const info = req.body;
    const success = await nuevaAltaMedicaPaciente(info);

    if (success) {
      res.status(200).json({
        success: true,
        message: "alta regsitrada correctamente",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al registrar el alta ",
      });
    }
  } catch (error) {
    logs.error(error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

/**
 * Lista de especialidades del hospital.
 *
 * En la version original esta ruta apuntaba a un ayudante sin (req, res): no
 * respondia nunca y la peticion quedaba colgada hasta agotar el tiempo.
 */
export const cargarEspecialidadesHandler = async (req, res) => {
  const especialidades = await cargarEspecialidades();
  return res.json(especialidades);
};
