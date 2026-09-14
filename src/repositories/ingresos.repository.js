/**
 * Repositorio de ingresos
 *
 * Ingresos hospitalarios, asignacion de cama y medico, traslados y altas.
 *
 * Acceso a datos unicamente: no contiene logica de presentacion ni HTTP.
 */
import { pool } from "../db/pool.js";
import { logs } from "../services/logs.service.js";
import { panelResumenPaciente } from "./enfermeria.repository.js";

export async function ingresarPaciente(
  documento_identificacion,
  nombre,
  apellido1,
  apellido2,
  especialidad,
  cama_id,
  medico_id,
  motivoIngreso,
  fecha_nacimiento,
  sexo,
  direccion,
  telefono,
  correo_electronico,
  persona_emergencia,
  contacto_emergencia,
  nacionalidad
) {
  //Conprobar si ya esta ingresado

  const [result] = await pool.query(
    "SELECT fecha_fin from Ingresados WHERE documento_identificacion_paciente = ?",
    [documento_identificacion]
  );

  const [historia_id] = await pool.query(
    "SELECT historia_id from Pacientes WHERE documento_identificacion = ?",
    [documento_identificacion]
  );

  //Comprobamos si el paciente ya esta en la tabla de ingresados
 

  if (result.length !== 0) {

    if (result.length !== 0) {
      // Verificamos si algún registro tiene fecha_fin como NULL
      const estaIngresado = result.some((ingreso) => ingreso.fecha_fin === null);

      if (estaIngresado) {
        return {
          success: false,
          message: "El paciente ya se encuentra ingresado en el hospital",
        };
      }
    }
  }
  //formalizar el ingreso en la base de datos

  //Crear imagen resumen standar de ingreso
  const paciente = {
    documento_identificacion: documento_identificacion,
    cama_id: cama_id,
    fecha_nacimiento: fecha_nacimiento,
    sexo: sexo,
    tipo_alergia: "non",
    incidencia: false,
    balance: false,
    escala_barthel: -1,
    tipo_via: "non",
    aislamiento: false,
    tipo_dieta: "non",
  };

  //conseguir el nombre del medico

  const [resultNombreMedico] = await pool.query(
    "SELECT CONCAT(nombre, ' ', apellido1, ' ', apellido2) AS medico_nombre_completo FROM Medicos WHERE id = UUID_TO_BIN(?) ",
    [medico_id]
  );

  const medico_nombre_completo = resultNombreMedico[0].medico_nombre_completo;

  const paciente_nombre_comleto = nombre + " " + apellido1 + " " + apellido2;
  try {
    const [insert] = await pool.query(
      "INSERT INTO Ingresados (documento_identificacion_paciente, medico_id, paciente_nombre_completo, medico_nombre_completo, especialidad, cama_id, motivo_ingreso, historia_id) VALUES (?,UUID_TO_BIN(?),?,?,?,?,?,?)",
      [
        documento_identificacion,
        medico_id,
        paciente_nombre_comleto,
        medico_nombre_completo,
        especialidad,
        cama_id,
        motivoIngreso,
        historia_id[0].historia_id,
      ]
    );

    await pool.query(
      "UPDATE Camas SET ocupada = 1 , id_ingreso =? WHERE cama_id = ?",
      [insert.insertId, cama_id]
    );
    const [selectPacienteIngresado] = await pool.query(
      "SELECT i.*, p.fecha_nacimiento, p.sexo FROM Ingresados i LEFT JOIN Pacientes p ON i.documento_identificacion_paciente = p.documento_identificacion WHERE i.ingreso_id = ?",
      [insert.insertId]
    );

    await panelResumenPaciente(selectPacienteIngresado[0], cama_id);

    //Tabla Medicos

    await pool.query(
      "UPDATE Medicos SET numero_pacientes = numero_pacientes + 1 WHERE id = UUID_TO_BIN(?)",
      [medico_id]
    );
  } catch (error) {
    logs.error(error)
    const respuesta = {
      success: false,
      message:
        "ocurrio un error en el servidor, error al notificar ingreso de paciente en la base de datos",
    };
    return respuesta;
  }
  const entrada = `${documento_identificacion} | ${paciente_nombre_comleto} | ${medico_nombre_completo} | ${new Date().toLocaleString()}`;
  logs.ingreso(entrada);

  const respuesta = {
    success: true,
    message: "El Paciente fue ingresado con exito",
  };

  return respuesta;
}

export async function buscarIngresado(documento_identificacion_paciente) {

  try {
    const [resultIngresado] = await pool.query(
      "SELECT medico_nombre_completo, cama_id, especialidad FROM Ingresados WHERE documento_identificacion_paciente = ?",
      [documento_identificacion_paciente]
    );

    return resultIngresado;
    
  } catch (error) {
    logs.error(error)
    
  }
  
  
}

export async function cargarIngresadosFiltro(medico_id, especialidad) {

  try {
    let peticion = "null";
    let parametros = "null";
    if (especialidad == "Cualquiera" && medico_id == "Cualquiera") {
      peticion =
        "SELECT ingreso_id, documento_identificacion_paciente, paciente_nombre_completo, medico_nombre_completo, especialidad , DATE_FORMAT(fecha_ini, '%Y-%m-%d %H:%i:%s') AS fecha_ini,  motivo_ingreso, cama_id FROM Ingresados";
      parametros = "";
    } else if (especialidad == "Cualquiera" && medico_id != "Cualquiera") {
      peticion =
        "SELECT ingreso_id, documento_identificacion_paciente, paciente_nombre_completo, medico_nombre_completo, especialidad , DATE_FORMAT(fecha_ini, '%Y-%m-%d %H:%i:%s') AS fecha_ini,  motivo_ingreso, cama_id FROM Ingresados WHERE medico_id = UUID_TO_BIN(?)";
      parametros = [medico_id];
    } else if (especialidad != "Cualquiera" && medico_id == "Cualquiera") {
      peticion =
        "SELECT ingreso_id, documento_identificacion_paciente, paciente_nombre_completo, medico_nombre_completo, especialidad , DATE_FORMAT(fecha_ini, '%Y-%m-%d %H:%i:%s') AS fecha_ini,  motivo_ingreso, cama_id FROM Ingresados WHERE especialidad = ?";
      parametros = [especialidad];
    } else {
      peticion =
        "SELECT ingreso_id, documento_identificacion_paciente, paciente_nombre_completo, medico_nombre_completo, especialidad , DATE_FORMAT(fecha_ini, '%Y-%m-%d %H:%i:%s') AS fecha_ini,  motivo_ingreso, cama_id FROM Ingresados WHERE especialidad =? AND medico_id = UUID_TO_BIN(?)";
      parametros = [especialidad, medico_id];
    }

    // La consulta se realiza con la peticion y parámetros necesarios

    const [resultIngresadosFiltro] = await pool.query(
      peticion,
      parametros
    );

    return resultIngresadosFiltro;
    
  } catch (error) {

  }
 
}

export async function cargarTodosLosIngresados() {
  try {
    const [resultTodosLosIngresados] = await pool.query(
      "SELECT ingreso_id, documento_identificacion_paciente, paciente_nombre_completo, medico_nombre_completo, especialidad , DATE_FORMAT(fecha_ini, '%Y-%m-%d %H:%i:%s') AS fecha_ini,  motivo_ingreso, cama_id FROM Ingresados"
    );
    return resultTodosLosIngresados;
    
  } catch (error) {
    logs.error(error)
  }
  
}

export async function cargarTodosIngresados() {
  try {
    const [resultIngresados] = await pool.query(
      "SELECT ingreso_id, documento_identificacion_paciente, paciente_nombre_completo, medico_nombre_completo, especialidad , DATE_FORMAT(fecha_ini, '%Y-%m-%d %H:%i:%s') AS fecha_ini,  motivo_ingreso, cama_id FROM Ingresados WHERE fecha_fin IS NULL"
    );
    return resultIngresados;  
  } catch (error) {
    logs.error(error)      
  }    
}

export async function cargarPacientesMedico(medico_id, especialidad) {

  try {

    const [resultPacientesMedico] = await pool.query(
      "SELECT * FROM Ingresados WHERE medico_id = UUID_TO_BIN(?) AND especialidad = ?",
      [medico_id, especialidad]
    );
    const [resultPacientesOtroMedico] = await pool.query(
      "SELECT * FROM Ingresados WHERE especialidad = ? AND medico_id != UUID_TO_BIN(?) AND medico_id IS NOT NULL",
      [especialidad, medico_id]
    );

    const respuesta = {
      pacientesMedico: resultPacientesMedico,
      pacientesPlanta: resultPacientesOtroMedico,
    };

    return respuesta;
    
  }catch (error) {
    logs.error(error)
    return null   
  }
}

export async function cargarMedicosYCamas(especialidad) {

  try {
    const [resultMedicos] = await pool.query(
      "SELECT BIN_TO_UUID(id) AS id, CONCAT(nombre, ' ', apellido1, ' ', apellido2) AS medico_nombre_completo FROM Medicos WHERE departamento = ? ORDER BY numero_pacientes ASC",
      [especialidad]
    );
    if (resultMedicos.length === 0) {
      const respuesta = {
        success: false,
        message: `no existen medicos especializados en ${especialidad} en la base de datos`,
      };

      return respuesta;
    }

    resultMedicos[0].medico_nombre_completo = resultMedicos[0].medico_nombre_completo + " (Recomendado)";

    const [resultCama] = await pool.query(
      "SELECT cama_id, (SELECT COUNT(*) FROM Camas WHERE especialidad = ? AND ocupada = 0 AND bloqueado = 0) AS camas_disponibles FROM Camas WHERE especialidad = ? AND ocupada = 0 ",
      [especialidad, especialidad]
    );
    if (resultCama[0].camas_disponibles == 0) {
      const respuesta = {
        success: false,
        message: `No quedan camas disponibles en ${especialidad}`,
      };
      return respuesta;
    } else if (((20 - resultCama[0].camas_disponibles) / 20) * 100 > 70) {
      const respuesta = {
        success: true,
        message:
          "ADVERTENCIA: la ocupacion de la planta supera el 70% de la capacidad total",

        cama_id: resultCama,
        medicos: resultMedicos,
      };
      return respuesta;
    } else {
      const respuesta = {
        success: true,
        cama_id: resultCama,
        medicos: resultMedicos,
      };

      return respuesta;
    }
  } catch (error) {
    logs.error(error)
  }

}

export async function cargarMedicosEspecialidad(especialidad) {

  try {
    const [resultMedicos] = await pool.query(
      "SELECT BIN_TO_UUID(id) AS id, CONCAT(nombre, ' ', apellido1, ' ', apellido2) AS medico_nombre_completo FROM Medicos WHERE departamento = ?",
      [especialidad]
    );
    if (resultMedicos.length === 0) {
      const respuesta = {
        success: false,
        message: `no existen medicos especializados en ${especialidad} en la base de datos`,
      };

      return respuesta;
    }

    const respuesta = {
      success: true,
      medicos: resultMedicos,
    };

    return respuesta;
  } catch (error) {
    logs.error(error)
  }
  
}

export async function cargarTodosLosMedicos() {
  try {
    const [resultMedicos] = await pool.query(
      "SELECT BIN_TO_UUID(id) AS id, CONCAT(nombre, ' ', apellido1, ' ', apellido2) AS medico_nombre_completo FROM Medicos"
    );
    return resultMedicos;
  } catch (error) {
    logs.error(error)

  }
  
}

export async function cargarEspecialidades() {

  try {
    const [result] = await pool.query(
      "SELECT especialidad FROM Especialidad"
    );
    return result;
  } catch (error) {
    logs.error(error)

  }
 
}


export async function trasladarPaciente(infoTraslado) {

  try {
    const [cama_id_libre] = await pool.query(
      "SELECT cama_id FROM Camas WHERE ocupada= 0 AND especialidad = ?",
      [infoTraslado.especialidad]
    );
    const [insert] = await pool.query(
      "INSERT INTO Ingresados (documento_identificacion_paciente, medico_id, paciente_nombre_completo, medico_nombre_completo, especialidad, cama_id, motivo_ingreso, historia_id) VALUES (?,UUID_TO_BIN(?),?,?,?,?,?,?)",
      [
        infoTraslado.documento_identificacion_paciente,
        infoTraslado.medico_id,
        infoTraslado.paciente_nombre_comleto,
        infoTraslado.medico_nombre_completo,
        infoTraslado.especialidad,
        cama_id_libre[0].cama_id,
        infoTraslado.motivo_ingreso,
        infoTraslado.historia_id,
      ]
    );

    await pool.query(
      "UPDATE Camas SET ocupada = 1 , id_ingreso = ? WHERE cama_id = ?",
      [insert.insertId, cama_id_libre[0].cama_id]
    );
    const [selectPacienteIngresado] = await pool.query(
      "SELECT i.*, p.fecha_nacimiento, p.sexo FROM Ingresados i LEFT JOIN Pacientes p ON i.documento_identificacion_paciente = p.documento_identificacion WHERE i.ingreso_id = ?",
      [insert.insertId]
    );

    await panelResumenPaciente(
      selectPacienteIngresado[0],
      cama_id_libre[0].cama_id
    );

    //Tabla Medicos

    await pool.query(
      "UPDATE Medicos SET numero_pacientes = numero_pacientes + 1 WHERE id = UUID_TO_BIN(?)",
      [infoTraslado.medico_id]
    );
    return true;
  } catch (error) {
    logs.error(error)
    return false;
  }
}

export async function nuevaAltaMedicaPaciente(info) {
  try {
    //Dejar libre todos los campos

    let fecha_alta_mysql = null;
    if (info.fecha_alta) {
      const fecha = new Date(info.fecha_alta);
      if (!isNaN(fecha.getTime())) {
        // Verificar que la fecha sea válida
        fecha_alta_mysql = fecha.toISOString().slice(0, 19).replace("T", " ");
      } else {
        throw new Error("Fecha de alta inválida");
      }
    }

    await pool.query(
      "UPDATE Ingresados SET fecha_fin = ? WHERE ingreso_id = ?",
      [fecha_alta_mysql, info.ingreso_id]
    );

    await pool.query(
      "UPDATE Camas SET ocupada = 0, id_ingreso = -1 WHERE cama_id = ?",
      [info.cama_id]
    );
    await pool.query(
      "UPDATE Medicos SET numero_pacientes = numero_pacientes - 1 WHERE id = UUID_TO_BIN(?)",
      [info.medico_id]
    );
    // Procesar y validar fecha_alta

    // Prepare data, converting empty strings to NULL and handling types
    const params = {
      tipo_alta: info.tipo_alta || null,
      fecha_alta: fecha_alta_mysql,
      destino_alta: info.destino_alta || null,
      profesional_nombre: info.profesional_nombre || null,
      diagnostico_principal: info.diagnostico_principal || null,
      diagnosticos_secundarios: info.diagnosticos_secundarios || null,
      procedimientos: info.procedimientos || null,
      motivo_ingreso: info.motivo_ingreso || null,
      evolucion_clinica: info.evolucion_clinica || null,
      tratamiento_realizado: info.tratamiento_realizado || null,
      tratamiento_alta: info.tratamiento_alta || null,
      plan_seguimiento: info.plan_seguimiento || null,
      indicaciones_paciente: info.indicaciones_paciente || null,
      nivel_dependencia: info.nivel_dependencia || null,
      riesgos_alta: info.riesgos_alta || null,
      medico_nombre_completo:
        info.medico_nombre_completo || info.profesional_nombre || null,
      paciente_nombre_completo: info.paciente_nombre_completo || null,
      documento_identificacion_paciente:
        info.documento_identificacion_paciente || null,
      cama_id: info.cama_id || null,
      ingreso_id: info.ingreso_id ? parseInt(info.ingreso_id) : null,
      historia_id: info.historia_id ? parseInt(info.historia_id) : null,
    };

    // Array of values for the query (21 values)
    const values = [
      params.tipo_alta,
      params.fecha_alta,
      params.destino_alta,
      params.profesional_nombre,
      params.diagnostico_principal,
      params.diagnosticos_secundarios,
      params.procedimientos,
      params.motivo_ingreso,
      params.evolucion_clinica,
      params.tratamiento_realizado,
      params.tratamiento_alta,
      params.plan_seguimiento,
      params.indicaciones_paciente,
      params.nivel_dependencia,
      params.riesgos_alta,
      params.paciente_nombre_completo,
      params.documento_identificacion_paciente,
      params.cama_id,
      params.ingreso_id,
      params.historia_id,
    ];

    // SQL query
    const query = `
      INSERT INTO AltasMedicas (
        tipo_alta, fecha_alta, destino_alta, profesional_nombre, diagnostico_principal,
        diagnosticos_secundarios, procedimientos, motivo_ingreso, evolucion_clinica,
        tratamiento_realizado, tratamiento_alta, plan_seguimiento, indicaciones_paciente,
        nivel_dependencia, riesgos_alta, paciente_nombre_completo,
        documento_identificacion_paciente, cama_id, ingreso_id, historia_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const momentoAlta = new Date().toLocaleString();
    const entrada = `Alta: ${momentoAlta} | Paciente: ${params.paciente_nombre_completo} (${params.documento_identificacion_paciente}) , Epsiodio: ${params.ingreso_id}\n`;

        logs.alta(entrada);

    // Execute the query
    await pool.query(query, values);

    if (info.tipo_alta === "traslado") {
      const infoTraslado = {
        documento_identificacion_paciente:
          info.documento_identificacion_paciente,
        medico_id: info.traslado_medico,
        paciente_nombre_comleto: info.paciente_nombre_completo,
        medico_nombre_completo: info.profesional_nombre,
        especialidad: info.traslado_especialidad,
        motivo_ingreso: info.motivo_ingreso,
        historia_id: info.historia_id,
      };
      const success = trasladarPaciente(infoTraslado);
      return success;
    }
    return true;
  } catch (error) {
    logs.error(error)
    throw error;
  }
}

export async function recuperarAltaPaciente(ingreso_id){
    try {
      // Validar ingreso_id
      if (!ingreso_id || isNaN(Number(ingreso_id))) {
        throw new Error("El ID de ingreso es inválido");
      }

      // Consultar la tabla diagnosticoPaciente
      const [rows] = await pool.query(
        ` SELECT id, tipo_alta,DATE_FORMAT(fecha_alta, '%Y-%m-%d %H:%i:%s') AS fecha_alta, destino_alta, profesional_nombre, diagnostico_principal,diagnosticos_secundarios, procedimientos,motivo_ingreso , evolucion_clinica , tratamiento_realizado , tratamiento_alta, plan_seguimiento , indicaciones_paciente, nivel_dependencia, riesgos_alta , paciente_nombre_completo, documento_identificacion_paciente, cama_id , ingreso_id , historia_id  FROM AltasMedicas WHERE ingreso_id = ?`,
        [Number(ingreso_id)]
      );

      // Si no hay resultados, devolver null
      if (rows.length === 0) {
        
        return null;
      }

      return rows[0];
    } catch (error) {
      logs.error(error)
      throw new Error(`Error al recuperar diagnósticos: ${error.message}`);
}}

export async function recuperarInfoIngreso(id_ingreso) {
  try {
    const [rowsIngresados] = await pool.query(
      "SELECT ingreso_id ,documento_identificacion_paciente,BIN_TO_UUID(medico_id) AS medico_id,paciente_nombre_completo,medico_nombre_completo,especialidad,DATE_FORMAT(fecha_ini, '%d/%m/%Y %H:%i') AS fecha_ini,motivo_ingreso,diagnostico,tipo_alergia,alergia,incidencia,balance,tipo_via,aislamiento,tipo_dieta,dieta, grupo_rh,cama_id FROM Ingresados WHERE ingreso_id = ?",
      [id_ingreso]
    );
    const [rowsPanelPaciente] = await pool.query(
      "SELECT panelPaciente FROM Camas WHERE id_ingreso= ?",
      [id_ingreso]
    );
    if (rowsIngresados.length === 0) return null;

    const { documento_identificacion_paciente } = rowsIngresados[0];

    const [rowsHistoria] = await pool.query(
      "SELECT id AS historia FROM Historias WHERE documento_identificacion_paciente= ?",
      [documento_identificacion_paciente]
    );
    const [rowsAntecedentes] = await pool.query(
      "SELECT diagnostico FROM Ingresados WHERE documento_identificacion_paciente= ? AND ingreso_id != ?",
      [documento_identificacion_paciente, id_ingreso]
    );
    let stringAntecedentes = " ";
    if (rowsAntecedentes.length > 0) {
      rowsAntecedentes.forEach((antecedentes) => {
        stringAntecedentes =
          stringAntecedentes + " | " + antecedentes.diagnostico;
      });
    }

    let panelPaciente = "";
    if (rowsPanelPaciente[0].panelPaciente) {
      const base64Image =
        rowsPanelPaciente[0].panelPaciente.toString("base64");
      panelPaciente = `data:image/png;base64,${base64Image}`;
    }

    const infoCabecera = {
      ingreso_id: rowsIngresados[0].ingreso_id,
      documento_identificacion_paciente:
        rowsIngresados[0].documento_identificacion_paciente,
      medico_id: rowsIngresados[0].medico_id,
      paciente_nombre_completo: rowsIngresados[0].paciente_nombre_completo,
      medico_nombre_completo: rowsIngresados[0].medico_nombre_completo,
      especialidad: rowsIngresados[0].especialidad,
      cama_id: rowsIngresados[0].cama_id,
      fecha_ini: rowsIngresados[0].fecha_ini,
      fecha_fin: rowsIngresados[0].fecha_fin,
      motivo_ingreso: rowsIngresados[0].motivo_ingreso,
      diagnostico: rowsIngresados[0].diagnostico,
      tipo_alergia: rowsIngresados[0].tipo_alergia,
      alergia: rowsIngresados[0].alergia,
      incidencia: rowsIngresados[0].incidencia,
      balance: rowsIngresados[0].balance,
      tipo_via: rowsIngresados[0].tipo_via,
      aislamiento: rowsIngresados[0].aislamiento,
      tipo_dieta: rowsIngresados[0].tipo_dieta,
      dieta: rowsIngresados[0].dieta,
      grupo_rh: rowsIngresados[0].grupo_rh,
      panelPaciente: panelPaciente,
      historia: rowsHistoria[0].historia,
      antecedentes: stringAntecedentes,
    };

    return infoCabecera;
  } catch (err) {
    logs.error(err)
    throw err;
  }
}

export async function recuperarIngresadosMedico(medico_id, especialidad) {
  try {
    // Consultar camas asociadas al id_enfermero en ZonaDeTrabajoEnfermeria

    const [rowsIngresadosMedico] = await pool.query(
      `SELECT 
          i.ingreso_id, 
          i.cama_id, 
          c.panelPaciente
       FROM Ingresados i
       INNER JOIN Camas c ON i.cama_id = c.cama_id
       WHERE i.medico_id = UUID_TO_BIN(?) AND i.fecha_fin IS NULL`,
      [medico_id, especialidad]
    );

    const [rowsIngresadosNoMedico] = await pool.query(
      `SELECT 
          i.ingreso_id, 
          i.cama_id, 
          c.panelPaciente
       FROM Ingresados i
       INNER JOIN Camas c ON i.cama_id = c.cama_id
       WHERE i.medico_id != UUID_TO_BIN(?) AND i.fecha_fin IS NULL`,
      [medico_id, especialidad]
    );

    // Función para procesar filas y generar el formato de salida
    const processRows = (rows) => {
      return rows.map((row) => {
        let panelBuffer = null;

        // Seleccionar el panel según el estado de la cama
        panelBuffer = row.panelPaciente; // Fixed typo from panenPaciente

        // Convertir el buffer a dataUrl (si existe)
        let dataUrl = "";
        if (panelBuffer) {
          const base64Image = Buffer.from(panelBuffer).toString("base64");
          dataUrl = `data:image/png;base64,${base64Image}`;
        } else {
          console.warn(`No se encontró panel para cama_id ${row.cama_id}`);
        }

        return {
          cama_id: row.cama_id,
          id_ingreso: row.ingreso_id, 
          panelPaciente: dataUrl,
        };
      });
    };

    // Generar los arrays de resultados
    const ingresadosMedico = processRows(rowsIngresadosMedico);
    const ingresadosNoMedico = processRows(rowsIngresadosNoMedico);

    return {
      ingresadosMedico,
      ingresadosNoMedico,
    };
  } catch (err) {
    logs.error(err)
    throw err; // Relanzar el error para que el llamador lo maneje
  }
}

export async function recuperarIngresadosInfoPlantaEnfermero(especialidad, id_enfermero) {
  try {
    // Consultar camas por especialidad
    const [rows] = await pool.query(
      `SELECT cama_id, id_ingreso, ocupada, bloqueado, 
                  panelPaciente, panelBloqueado, panelLibre 
           FROM Camas 
           WHERE especialidad = ?`,
      [especialidad]
    );

    // Consultar camas asociadas al id_enfermero en ZonaDeTrabajoEnfermeria
    const [rowsZonaTrabajo] = await pool.query(
      `SELECT c.cama_id, c.id_ingreso, c.ocupada, c.bloqueado, 
                  c.panelPaciente, c.panelBloqueado, c.panelLibre 
           FROM Camas c
           INNER JOIN ZonaDeTrabajoEnfermeria z ON c.cama_id = z.cama_id
           WHERE c.especialidad = ? AND z.id_enfermero = UUID_TO_BIN(?)`,
      [especialidad, id_enfermero]
    );

    // Función para procesar filas y generar el formato de salida
    const processRows = (rows) => {
      return rows.map((row) => {
        let panelBuffer = null;

        // Seleccionar el panel según el estado de la cama
        if (row.bloqueado === 1) {
          panelBuffer = row.panelBloqueado;
        } else if (row.ocupada === 1) {
          panelBuffer = row.panelPaciente;
        } else {
          panelBuffer = row.panelLibre;
        }

        // Convertir el buffer a dataUrl (si existe)
        let dataUrl = "";
        if (panelBuffer) {
          const base64Image = panelBuffer.toString("base64");
          dataUrl = `data:image/png;base64,${base64Image}`;
        } else {
          console.warn(`No se encontró panel para cama_id ${row.cama_id}`);
        }

        return {
          cama_id: row.cama_id,
          id_ingreso: row.id_ingreso,
          bloqueado: row.bloqueado, // Agregar el campo ocupada
          panel: dataUrl,
        };
      });
    };

    // Generar los arrays de resultados
    const ingresadosInfo = processRows(rows);
    const ingresadosInfoZonaTrabajo = processRows(rowsZonaTrabajo);

    const ingresadosInfoReturn = {
      ingresadosInfo,
      ingresadosInfoZonaTrabajo

    }

    return ingresadosInfoReturn;
  } catch (err) {
    logs.error(err)
    throw err; // Relanzar el error para que el llamador lo maneje
  }
}

export async function cambiarEstadoDeBloqueoCama(cama_id, nuevoEstadoBloqueo) {
  try {
    await pool.query(
      "UPDATE Camas SET bloqueado = ? WHERE cama_id = ?",
      [nuevoEstadoBloqueo, cama_id]
    );
    return true;
  } catch (err) {
    logs.error(err)
    return false;
  }
}

export async function recuperarImagenHabitacion(cama_id, bloqueado) {
  try {
    let query = "";
    if (bloqueado == 0) {

      query =
        "SELECT panelLibre AS panelHabitacion  FROM Camas WHERE cama_id = ?";
    } else {
      query =
        "SELECT panelBloqueado  AS panelHabitacion  FROM Camas WHERE cama_id = ?";
    }
    // Fetch panelPaciente from Camas
    const [panelPacienteRow] = await pool.query(query, [cama_id]);
    let panelHabitacion;
    if (panelPacienteRow.length > 0 && panelPacienteRow[0].panelHabitacion) {
      const base64Image =
        panelPacienteRow[0].panelHabitacion.toString("base64");
      panelHabitacion = `data:image/png;base64,${base64Image}`;
      return panelHabitacion;
    } else {
      return null;
    }
  } catch (error) {
    logs.error(error)
  }
}

export async function actualizarZonaDeTrabajo(infoZonaDeTrabajo) {
  const id_enfermero = infoZonaDeTrabajo.usuario_id;
  const camas_id = infoZonaDeTrabajo.camas;
  const especialidad = infoZonaDeTrabajo.especialidad;
  try {
    // Eliminar registros existentes
    await pool.query(
      "DELETE FROM ZonaDeTrabajoEnfermeria WHERE id_enfermero = UUID_TO_BIN(?)",
      [id_enfermero]
    );

    if (camas_id.length > 0) {
      const values = camas_id.map((cama_id) => [
        id_enfermero,
        cama_id,
        especialidad,
      ]);
      const placeholders = camas_id
        .map(() => "(UUID_TO_BIN(?), ?, ?)")
        .join(", ");

      await pool.query(
        `INSERT INTO ZonaDeTrabajoEnfermeria (id_enfermero, cama_id, especialidad) VALUES ${placeholders}`,
        values.flat()
      );
    }

    return true;
  } catch (err) {
    logs.error(err)
    return false;
  }
}

export async function cargarListaContactos() {
  try {
    const [result] = await pool.query(
      "SELECT BIN_TO_UUID(id) AS id, CONCAT(nombre, ' ', apellido1, ' ', apellido2) AS usuario_nombre_completo, correo_electronico, foto_perfil, departamento, rol FROM empleados ORDER by departamento;"
    );
    return result;
  } catch (error) {
    logs.error(error)
  }
  
}

export async function cargarListaNombresPlantilla(especialidad, rol) {

  try {
    let sentencia = "";

    if (rol === "enfermero" || rol === "enfermeroEncargado") {
      sentencia = `
            SELECT BIN_TO_UUID(id) AS id, CONCAT(nombre, ' ', apellido1, ' ', apellido2) AS nombre_completo 
            FROM empleados 
            WHERE departamento = ? 
            AND (rol = 'enfermero' OR rol = 'enfermeroEncargado')
        `;
    } else if (rol === "medico") {
      sentencia = `
            SELECT BIN_TO_UUID(id) AS id, CONCAT(nombre, ' ', apellido1, ' ', apellido2) AS nombre_completo 
            FROM empleados 
            WHERE departamento = ? 
            AND rol = 'medico'
        `;
    } else {
      throw new Error("Rol no válido");
    }

    const [result] = await pool.query(sentencia, [especialidad]);
    return result;
  } catch (error) {
    logs.error(error)

  }

}
