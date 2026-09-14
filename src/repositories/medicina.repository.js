/**
 * Repositorio de medicina
 *
 * Actividad medica: evolutivo, diagnostico y codificacion CIE-11.
 *
 * Acceso a datos unicamente: no contiene logica de presentacion ni HTTP.
 */
import { pool } from "../db/pool.js";
import { logs } from "../services/logs.service.js";
import { getOmsToken } from "../services/cie11.service.js";

export async function recuperarEvolutivoMedicina(id_ingreso) {
  try {

    // Consultar todas las entradas para el ingreso_id
    const [entradasEvolutivo] = await pool.query(
      `SELECT 
        evolutivo_id,
        ingreso_id,
        historia,
        BIN_TO_UUID(medico_id) AS medico_id,
        nombreTrabajador,
        DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS fecha_emision,
        turno,
        paciente_nombre_completo,
        especialidad,
        informacion_evolutivo
      FROM evolutivoMedico
      WHERE ingreso_id = ?
      ORDER BY evolutivo_id DESC
      `,
      [id_ingreso]
    );

    return entradasEvolutivo;
  } catch (err) {
    logs.error(err)
    return [];
  }
}

export async function nuevaEntradaEvolutivoMedicina(info) {
  // Validar que todos los campos requeridos estén presentes
  const requiredFields = [
    "ingreso_id",
    "historia",
    "medico_id",
    "nombreTrabajador",
    "fecha_emision",
    "turno",
    "paciente_nombre_completo",
    "especialidad",
    "informacion_evolutivo",
  ];
  for (const field of requiredFields) {
    if (!info[field]) {
      throw new Error(`El campo ${field} es requerido`);
    }
  }
  const fechaEmision = new Date(info.fecha_emision);
  if (isNaN(fechaEmision)) {
    throw new Error("Formato de fecha_emision inválido");
  }
  const fechaEmisionMySQL = fechaEmision
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  // Validar el formato del turno
  if (!["Mañana", "Tarde", "Noche"].includes(info.turno)) {
    throw new Error("El turno debe ser Mañana, Tarde o Noche");
  }

  try {
    // Insertar la nueva entrada
    const [result] = await pool.query(
      `INSERT INTO evolutivoMedico (
          ingreso_id, historia, medico_id, nombreTrabajador, fecha_emision,
          turno, paciente_nombre_completo, especialidad, informacion_evolutivo
        ) VALUES (?, ?, UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)`,
      [
        info.ingreso_id,
        info.historia,
        info.medico_id,
        info.nombreTrabajador,
        fechaEmisionMySQL,
        info.turno,
        info.paciente_nombre_completo,
        info.especialidad,
        info.informacion_evolutivo,
      ]
    );

    // Obtener el evolutivo_id generado
    const evolutivo_id = result.insertId;

    // Devolver la estructura con todos los campos
    return {
      evolutivo_id,
      ingreso_id: info.ingreso_id,
      historia: info.historia,
      enfermero_id: info.enfermero_id, // Devolver como string (UUID)
      nombreTrabajador: info.nombreTrabajador,
      fecha_emision: info.fecha_emision,
      turno: info.turno,
      paciente_nombre_completo: info.paciente_nombre_completo,
      especialidad: info.especialidad,
      informacion_evolutivo: info.informacion_evolutivo,
    };
  } catch (err) {
    logs.error(err)
    return null;
  }
}

export async function recuperarDiagnosticoPaciente(ingreso_id) {
  try {
    // Validar ingreso_id
    if (!ingreso_id || isNaN(Number(ingreso_id))) {
      throw new Error("El ID de ingreso es inválido");
    }

    // Consultar la tabla diagnosticoPaciente
    const [rows] = await pool.query(
      `SELECT 
        id_diagnostico,
        id_url,
        codigo,
        descripcion,
        diagnosticoEscrito,
        sintomasAsociados,
        pruebasDiagnostico,
        estadoDiagnostico,
        gravedad,
        planTratamiento,
        nombre_medico,
        BIN_TO_UUID(id_medico) AS id_medico,
        id_paciente,
        DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS fecha_emision,   
        ingreso_id
      FROM diagnosticoPaciente
      WHERE ingreso_id = ?`,
      [Number(ingreso_id)]
    );

    // Si no hay resultados, devolver null
    if (rows.length === 0) {
      
      return null;
    }

    // Mapear los resultados para devolverlos en el formato esperado
    const diagnosticos = rows.map((row) => ({
      id_diagnostico: row.id_diagnostico,
      id_url: row.id_url,
      codigo: row.codigo,
      descripcion: row.descripcion,
      diagnosticoEscrito: row.diagnosticoEscrito,
      sintomasAsociados: row.sintomasAsociados,
      pruebasDiagnostico: row.pruebasDiagnostico,
      estadoDiagnostico: row.estadoDiagnostico,
      gravedad: row.gravedad,
      planTratamiento: row.planTratamiento,
      nombre_medico: row.nombre_medico,
      id_medico: row.id_medico,
      id_paciente: row.id_paciente,
      fecha_emision: row.fecha_emision, // Convertir a milisegundos
      ingreso_id: row.ingreso_id,
    }));

    return diagnosticos;
  } catch (error) {
    logs.error(error)
    throw new Error(`Error al recuperar diagnósticos: ${error.message}`);
  }
}

export async function emitirDiagnosticoPaciente(info) {
  try {
    const diagnosticoData = info.diagnostico;
    if (!diagnosticoData) {
      throw new Error("Faltan datos del diagnóstico");
    }

    // Validar que nombre_medico no sea una cadena vacía
    if (diagnosticoData.nombre_medico === "") {
      throw new Error("El nombre del médico no puede estar vacío");
    }

    // Validar formato de fecha_emision
    let fecha_emision_mysql = null;
    if (diagnosticoData.fecha_emision) {
      const fecha = new Date(Number(diagnosticoData.fecha_emision));
      if (!isNaN(fecha.getTime())) {
        fecha_emision_mysql = fecha
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      } else {
        throw new Error("Fecha de emisión inválida");
      }
    } else {
      throw new Error("Fecha de emisión es requerida");
    }

    // Corregir id_paciente (manejar id_pacinete como fallback)
    const id_paciente =
      diagnosticoData.id_pacinete || diagnosticoData.id_paciente;

    // Preparar inserción para diagnosticoPaciente
    const insertDiagnostico = {
      id_url: diagnosticoData.id_url,
      codigo: diagnosticoData.codigo,
      descripcion: diagnosticoData.descripcion,
      diagnosticoEscrito: diagnosticoData.diagnosticoEscrito || null,
      sintomasAsociados: diagnosticoData.sintomasAsociados || null,
      pruebasDiagnostico: diagnosticoData.pruebasDiagnostico || null,
      estadoDiagnostico: diagnosticoData.estadoDiagnostico,
      gravedad: diagnosticoData.gravedad,
      planTratamiento: diagnosticoData.planTratamiento || null,
      nombre_medico: diagnosticoData.nombre_medico,
      id_medico: diagnosticoData.id_medico,
      id_paciente: id_paciente,
      fecha_emision: fecha_emision_mysql,
      ingreso_id: Number(diagnosticoData.ingreso_id),
    };

    // Insertar en diagnosticoPaciente
    const [result] = await pool.query(
      `INSERT INTO diagnosticoPaciente (
        id_url, codigo, descripcion, diagnosticoEscrito, sintomasAsociados, pruebasDiagnostico,
        estadoDiagnostico, gravedad, planTratamiento, nombre_medico, id_medico, id_paciente,
        fecha_emision, ingreso_id
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?), ?, ?, ?
      )`,
      [
        insertDiagnostico.id_url,
        insertDiagnostico.codigo,
        insertDiagnostico.descripcion,
        insertDiagnostico.diagnosticoEscrito,
        insertDiagnostico.sintomasAsociados,
        insertDiagnostico.pruebasDiagnostico,
        insertDiagnostico.estadoDiagnostico,
        insertDiagnostico.gravedad,
        insertDiagnostico.planTratamiento,
        insertDiagnostico.nombre_medico,
        insertDiagnostico.id_medico,
        insertDiagnostico.id_paciente,
        insertDiagnostico.fecha_emision,
        insertDiagnostico.ingreso_id,
      ]
    );
    await pool.query(
      "UPDATE Ingresados SET diagnostico = ? WHERE ingreso_id= ? ",
      [insertDiagnostico.descripcion, insertDiagnostico.ingreso_id]
    );

    // Preparar objeto de retorno
    const nuevoDiagnostico = {
      id_diagnostico: result.insertId,
      id_url: insertDiagnostico.id_url,
      codigo: insertDiagnostico.codigo,
      descripcion: insertDiagnostico.descripcion,
      diagnosticoEscrito: insertDiagnostico.diagnosticoEscrito,
      sintomasAsociados: insertDiagnostico.sintomasAsociados,
      pruebasDiagnostico: insertDiagnostico.pruebasDiagnostico,
      estadoDiagnostico: insertDiagnostico.estadoDiagnostico,
      gravedad: insertDiagnostico.gravedad,
      planTratamiento: insertDiagnostico.planTratamiento,
      nombre_medico: insertDiagnostico.nombre_medico,
      id_medico: insertDiagnostico.id_medico,
      id_paciente: insertDiagnostico.id_paciente,
      fecha_emision: insertDiagnostico.fecha_emision,
      ingreso_id: insertDiagnostico.ingreso_id,
    };

    return nuevoDiagnostico;
  } catch (error) {
    logs.error(error)
    return null;
  }
}

export async function actualizarDiagnosticoPaciente(info) {

  try {
    const query = `
          UPDATE diagnosticoPaciente
          SET
              codigo = ?,
              descripcion = ?,
              diagnosticoEscrito = ?,
              sintomasAsociados = ?,
              pruebasDiagnostico = ?,
              estadoDiagnostico = ?,
              gravedad = ?,
              planTratamiento = ?
          WHERE id_diagnostico = ?
      `;

    const values = [
      info.diagnostico.codigo,
      info.diagnostico.descripcion,
      info.diagnostico.diagnosticoEscrito,
      info.diagnostico.sintomasAsociados,
      info.diagnostico.pruebasDiagnostico,
      info.diagnostico.estadoDiagnostico,
      info.diagnostico.gravedad,
      info.diagnostico.planTratamiento,
      info.diagnostico.id_diagnostico,
    ];

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return null;
    }

    return result;
  } catch (error) {
    logs.error(error)
    return null;
  }
}

export async function buscarPalabraClaveCIE11(palabra) {
  try {
    const token = await getOmsToken();
    const url = `https://id.who.int/icd/release/11/2023-01/mms/search?q=${encodeURIComponent(
      palabra
    )}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Accept-Language": "es", // Para resultados en español
        "API-Version": "v2",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error en la solicitud: ${response.status} ${response.statusText}`
      );
    }

    // Procesar la respuesta
    const data = await response.json();

    // Verificar si existe destinationEntities y es un array
    if (!data || !Array.isArray(data.destinationEntities)) {
      throw new Error(
        "La respuesta de la API no contiene un array de resultados válido en destinationEntities"
      );
    }

    // Mapear y filtrar los resultados
    const mappedData = data.destinationEntities
      .filter(
        (item) =>
          item?.id &&
          item?.title &&
          item?.theCode &&
          typeof item.id === "string" &&
          typeof item.title === "string" &&
          typeof item.theCode === "string"
      )
      .map((item) => ({
        id: item.id,
        title: item.title.replace(/<[^>]+>/g, ""), // Eliminar etiquetas HTML
        theCode: item.theCode,
      }));

    return mappedData; // Retorna los resultados de la búsqueda
  } catch (error) {
    logs.error(error)

    throw error;
  }
}
