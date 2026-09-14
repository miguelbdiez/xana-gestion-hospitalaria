/**
 * Repositorio de pacientes
 *
 * Ficha del paciente: alta en el sistema, datos personales e historial de episodios.
 *
 * Acceso a datos unicamente: no contiene logica de presentacion ni HTTP.
 */
import { pool } from "../db/pool.js";
import { logs } from "../services/logs.service.js";


/**
 * Siguiente numero de expediente disponible.
 *
 * Se calcula a partir del maximo existente, tal y como hacia la version
 * original del sistema.
 */
async function crearNumeroExpediente() {
  const [ultimoExpediente] = await pool.query(
    "SELECT MAX(id) AS numero_expediente FROM Historias"
  );
  return ultimoExpediente[0].numero_expediente + 1;
}

export async function registroPaciente(
  documento_identificacion,
  nombre,
  primerApellido,
  segundoApellido,
  fechaNacimiento,
  sexo,
  direccion,
  telefono,
  correoElectronico,
  personaEmergencia,
  contactoEmergencia,
  nacionalidad,
  directo
) {
  try {
    const [result] = await pool.query(
      "SELECT documento_identificacion FROM Pacientes WHERE documento_identificacion = ?",
      [documento_identificacion]
    );

    if (result.length > 0) {

      respuesta = {
        success: false,
        message: "El ususario ya esta regsitrado en el sistema",
      };
      return respuesta;
    }
    if (directo !== null) {
      await pool.query(
        "UPDATE documentos_hospital_bandeja SET estado= 'procesado' WHERE id =?",
        [directo]
      );
    }

    const numeroExpediente = await crearNumeroExpediente();
    const fecha_creacion = new Date();
  

    await pool.query(
      "INSERT INTO Pacientes (documento_identificacion,  nombre, apellido_1, apellido_2, fecha_nacimiento, sexo, direccion, telefono, correo_electronico, persona_emergencia, telefono_emergencia, nacionalidad, historia_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)",
      [
        documento_identificacion,
        nombre,
        primerApellido,
        segundoApellido,
        fechaNacimiento,
        sexo,
        direccion,
        telefono,
        correoElectronico,
        personaEmergencia,
        contactoEmergencia,
        nacionalidad,
        numeroExpediente,
      ]
    );

    await pool.query(
      "INSERT INTO Historias (id,  documento_identificacion_paciente, fecha_creacion) VALUES (?, ?, ?)",
      [numeroExpediente, documento_identificacion, fecha_creacion]
    );

    const instante = new Date().toLocaleString();
    const entrada = `El ${instante} | El paciente con número de documento ${documento_identificacion}, nombre completo ${nombre} ${primerApellido} ${segundoApellido}, ha sido dado de alta en el sistema.`;
    logs.registroPaciente(entrada);

    return {
      success: true,
      paciente: {
        documento_identificacion: documento_identificacion,
        nombre: nombre,
        apellido_1: primerApellido,
        apellido_2: segundoApellido,
        numero_expediente: numeroExpediente,
        fecha_nacimiento: fechaNacimiento,
        sexo: sexo,
        direccion: direccion,
        telefono: telefono,
        correo_electronico: correoElectronico,
        persona_emergencia: personaEmergencia,
        telefono_emergencia: contactoEmergencia,
        nacionalidad: nacionalidad,
      },
    };
  } catch (error) {
     logs.error(error)
    return {
      success: false,
      message: "El ususario ya esta regsitrado en el sistema",
    };
  }
}

export async function modificarDatosPaciente(infoActualizadaPaciente) {
  try {

    const validSexoValues = ['Hombre', 'Mujer', 'Otro'];
    const sexo = validSexoValues.includes(infoActualizadaPaciente.sexo) 
      ? infoActualizadaPaciente.sexo 
      : 'Otro'; 
    await pool.query(
      `UPDATE Pacientes 
       SET fecha_nacimiento = ?, 
           sexo = ?, 
           direccion = ?, 
           telefono = ?, 
           correo_electronico = ?, 
           persona_emergencia = ?, 
           telefono_emergencia = ?, 
           nacionalidad = ? 
       WHERE documento_identificacion = ?`,
      [
        infoActualizadaPaciente.fecha_nacimiento,
        sexo,
        infoActualizadaPaciente.direccion,
        infoActualizadaPaciente.telefono,
        infoActualizadaPaciente.correo_electronico,
        infoActualizadaPaciente.persona_emergencia,
        infoActualizadaPaciente.telefono_emergencia,
        infoActualizadaPaciente.nacionalidad,
        infoActualizadaPaciente.documento_identificacion
      ]
    );
    return true;
  } catch (error) {
    logs.error(error)
    return false;
  }
}

export async function buscarPaciente(documento_identificacion) {

  try {
    const [resultPaciente] = await pool.query(
      "SELECT documento_identificacion, CONCAT(nombre, ' ', apellido_1, ' ', apellido_2) AS paciente_nombre_completo, fecha_nacimiento, direccion, telefono , correo_electronico,  persona_emergencia, telefono_emergencia, nacionalidad, sexo  FROM Pacientes WHERE documento_identificacion = ?",
      [documento_identificacion]
    );

    return resultPaciente;
    
  } catch (error) {
    logs.error(error)      

  }
  
}

export async function verificarExistePaciente(documentoDeIdentificacion) {

  try {
    const [result] = await pool.query(
      "SELECT * FROM Pacientes WHERE documento_identificacion = ?",
      [documentoDeIdentificacion]
    );

    if (result.length === 0) {
      return {
        success: false,
        message: "USUARIO NO EXISTE EN LA BASE DE DATOS",
      };
    } else {
      return {
        success: true,
        paciente: {
          nombre: result[0].nombre,
          apellido1: result[0].apellido_1,
          apellido2: result[0].apellido_2,
          numero_expediente: result[0].numero_expediente,
          fechaNacimiento: result[0].fecha_nacimiento,
          direccion: result[0].direccion,
          telefono: result[0].telefono,
          correo: result[0].correo_electronico,
          personaEmergencia: result[0].persona_emergencia,
          contactoEmergencia: result[0].telefono_emergencia,
          nacionalidad: result[0].nacionalidad,
          sexo: result[0].sexo,
        },
      };
    }
  } catch (error) {
    logs.error(error)

  }
  
}

export async function cargarTodosPacientesInicio() {
  try {
    const [resultPacientes] = await pool.query(
      "SELECT documento_identificacion, CONCAT(nombre, ' ', apellido_1, ' ', apellido_2) AS paciente_nombre_completo, fecha_nacimiento, direccion, telefono , correo_electronico,  persona_emergencia, telefono_emergencia, nacionalidad,historia_id, sexo  FROM Pacientes"
    );
    return resultPacientes;
  } catch (error) {
    logs.error(error)
  }
}

export async function recuperarEpisodiosPaciente(historia_id) {
  try {
    const episodiosPaciente = await pool.query(
      "SELECT (ingreso_id) AS episodio, documento_identificacion_paciente, paciente_nombre_completo, medico_nombre_completo, especialidad, cama_id, DATE_FORMAT(fecha_ini, '%Y-%m-%d %H:%i:%s') AS fecha_ini, DATE_FORMAT(fecha_fin, '%Y-%m-%d %H:%i:%s') AS fecha_fin, motivo_ingreso,diagnostico, historia_id FROM Ingresados WHERE historia_id = ?",
      [historia_id]
    );
    if (episodiosPaciente.length <= 0) {
      return null;
    } else {
      return episodiosPaciente[0];
    }
  } catch (err) {
    logs.error(err)
    return null;
  }
}
