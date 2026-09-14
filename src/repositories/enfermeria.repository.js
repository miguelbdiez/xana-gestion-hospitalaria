/**
 * Repositorio de enfermeria
 *
 * Actividad de enfermeria: evolutivo, constantes, tests, balances, vias e incidencias.
 *
 * Acceso a datos unicamente: no contiene logica de presentacion ni HTTP.
 */
import { pool } from "../db/pool.js";
import { logs } from "../services/logs.service.js";
import fileS from "fs";
import { createCanvas, loadImage } from "canvas";
import { calcularTipoPersona } from "../utils/avatar.js";
import { calcularEdad } from "../utils/fechas.js";

export async function panelResumenPaciente(paciente, cama_id) {
  try {
    // Cargar la imagen de la plantilla

    const [bufferPlantillaPaciente] = await pool.query(
      "SELECT panelPaciente FROM Camas WHERE cama_id=?",
      [cama_id]
    );

    if (
      bufferPlantillaPaciente.length === 0 ||
      !bufferPlantillaPaciente[0].panelPaciente
    ) {
      throw new Error(`No se encontró panelPaciente para cama_id ${cama_id}`);
    }

    const plantillaPaciente = await loadImage(
      bufferPlantillaPaciente[0].panelPaciente
    );
    // Crear un lienzo con las dimensiones de la plantilla
    const canvas = createCanvas(
      plantillaPaciente.width,
      plantillaPaciente.height
    );

    const ctx = canvas.getContext("2d");

    // Dibujar la plantilla en el lienzo
    ctx.drawImage(plantillaPaciente, 0, 0);

    const edad = await calcularEdad(paciente.fecha_nacimiento);
    const tipoPersona = await calcularTipoPersona(paciente.sexo, edad);

    const imagePath = "./imagenes/tipoPersona/" + tipoPersona;

    const imagenPersona = await loadImage(imagePath);

    ctx.fillStyle = "white"; // Color blanco
    ctx.fillRect(240, 10, 60, 30); // Cuadrado en (240, 10) con ancho 60px y alto 30px

    ctx.font = "20px Arial Black"; // Tamaño 36px, fuente Arial
    ctx.fillStyle = "black"; // Color negro

    ctx.fillText(edad, 245, 25); // Posición (26, 55)
    ctx.drawImage(imagenPersona, 228, 35); // Posición (228, 156)

    // Cargar y dibujar la imagen de tipoPersona

    if (paciente.tipo_alergia != "non") {
      let imagenAlergia = "";
      if (paciente.tipo_alergia == "leve") {
        imagenAlergia = "./imagenes/panelResumen/alergias/alergiaLeve.png";
      } else if (paciente.tipo_alergia == "moderada") {
        imagenAlergia =
          "./imagenes/panelResumen/alergias/alergiaModerada.png";
      } else {
        imagenAlergia = "./imagenes/panelResumen/alergias/alergiaGrave.png";
      }
      const imagenAlergiaLoad = await loadImage(imagenAlergia);
      ctx.drawImage(imagenAlergiaLoad, 7, 64); // Posición (228, 156)
    } else {
      ctx.fillStyle = "grey";
      ctx.fillRect(7, 64, 43, 39);
    }

    if (paciente.incidencia) {
      const imagenIncidencia = await loadImage(
        "./imagenes/panelResumen/incidencia.png"
      );
      ctx.drawImage(imagenIncidencia, 118, 114);
    } else {
      ctx.fillStyle = "grey"; // Color blanco
      ctx.fillRect(118, 114, 43, 39); // Cuadrado en (240, 10) con ancho 60px y alto 30px;
    }

    if (paciente.balance) {
      const imagenbalance = await loadImage(
        "./imagenes/panelResumen/balance.png"
      );
      ctx.drawImage(imagenbalance, 62, 114); // Posición (228, 156)
    } else {
      ctx.fillStyle = "grey"; // Color blanco
      ctx.fillRect(62, 114, 43, 39); // Cuadrado en (240, 10) con ancho 60px y alto 30px;
    }

    if (paciente.aislamiento) {
      const imagenAislamiento = await loadImage(
        "./imagenes/panelResumen/aislamiento.png"
      );
      ctx.drawImage(imagenAislamiento, 7, 114); // Posición (228, 156)
    } else {
      ctx.fillStyle = "grey"; // Color blanco
      ctx.fillRect(7, 114, 43, 39); // Cuadrado en (240, 10) con ancho 60px y alto 30px;
    }

    if (paciente.escala_barthel >= 0) {
      let imagenDependecia = "";

      if (paciente.escala_barthel <= 20) {
        imagenDependecia =
          "./imagenes/panelResumen/dependenciaBarthel/dependienteTotal.png";
      } else if (
        paciente.escala_barthel >= 21 &&
        paciente.escala_barthel <= 35
      ) {
        imagenDependecia =
          "./imagenes/panelResumen/dependenciaBarthel/dependienteGrave.png";
      } else if (
        paciente.escala_barthel >= 36 &&
        paciente.escala_barthel <= 55
      ) {
        imagenDependecia =
          "./imagenes/panelResumen/dependenciaBarthel/dependienteModerado.png";
      } else if (
        paciente.escala_barthel >= 56 &&
        paciente.escala_barthel <= 90
      ) {
        imagenDependecia =
          "./imagenes/panelResumen/dependenciaBarthel/dependienteLeve.png";
      } else {
        imagenDependecia =
          "./imagenes/panelResumen/dependenciaBarthel/independiente.png";
      }

      const imagenDependeciaLoad = await loadImage(imagenDependecia);
      ctx.drawImage(imagenDependeciaLoad, 62, 64); // Posición (62, 64)
    } else {
      ctx.fillStyle = "grey";
      ctx.fillRect(62, 64, 43, 39);
    }

    if (paciente.tipo_via != "non") {
      let imagenTipoVia = "";
      if (paciente.tipo_via == "VVP") {
        imagenTipoVia = "./imagenes/panelResumen/tipo_Via/VVP.png";
      } else {
        imagenTipoVia = "./imagenes/panelResumen/tipo_Via/VC.png";
      }
      const imagentipoViaLoad = await loadImage(imagenTipoVia);
      ctx.drawImage(imagentipoViaLoad, 174, 64); // Posición (228, 156)
    } else {
      ctx.fillStyle = "grey";
      ctx.fillRect(174, 64, 43, 39);
    }

    if (paciente.tipo_dieta != "non") {
      let imagenDieta = "";
      if (paciente.tipo_dieta == "normal") {
        imagenDieta = "./imagenes/panelResumen/dietas/dietaNormal.png";
      } else if (paciente.tipo_dieta == "blanda") {
        imagenDieta = "./imagenes/panelResumen/dietas/dietaBlanda.png";
      } else if (paciente.tipo_dieta == "liquidos") {
        imagenDieta = "./imagenes/panelResumen/dietas/dietaLiquidos.png";
      }
      const imagenDietaLoad = await loadImage(imagenDieta);

      ctx.drawImage(imagenDietaLoad, 117, 64); // Posición (228, 156)
    } else {
      ctx.fillStyle = "grey";
      ctx.fillRect(117, 64, 43, 39);
    }

    const buffer = canvas.toBuffer("image/png");

    await pool.query(
      "UPDATE Camas SET panelPaciente = ? WHERE cama_id = ?",
      [buffer, cama_id]
    );

    fileS.writeFileSync(
      "./imagenes/panelResumen/panelModificado.png",
      buffer
    );
    
    return buffer;
  } catch (error) {
    logs.error(error)
  }
}

export async function recuperarIncidenciasIngreso(ingreso_id) {
  try {
    const [infoIncidecias] = await pool.query(
      "SELECT id_incidencia, ingreso_id, informacion_incidencia, cama_id, activa, DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS fecha_emision, DATE_FORMAT(fecha_desactivacion, '%Y-%m-%d %H:%i:%s') AS fecha_desactivacion FROM Incidencias WHERE ingreso_id=? ORDER BY fecha_emision DESC",
      [ingreso_id]
    );
    return infoIncidecias;
  } catch (err) {
    logs.error(err)
    return "";
  }
}

export async function reportarIncidencia(
  ingreso_id,
  cuerpo,
  activa,
  cama_id,
  documento_identificacion_paciente
) {
  const now = new Date();
  // Formato para MySQL: YYYY-MM-DD HH:mm:ss
  const fecha_emision_mysql = now
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  // Formato para nuevaIncidencia: dd/mm/aaaa hh:mm
  const fecha_emision = now.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [insertRows] = await pool.query(
    "INSERT INTO Incidencias (ingreso_id, informacion_incidencia, activa, cama_id, fecha_emision) VALUES (?, ?, ?, ?, ?)",
    [ingreso_id, cuerpo, activa, cama_id, fecha_emision_mysql]
  );
  const id_incidencia = insertRows.insertId; // Obtener el ID de la incidencia insertada

  await pool.query(
    "UPDATE Ingresados SET incidencia = 1 WHERE documento_identificacion_paciente = ?",
    [documento_identificacion_paciente]
  );
  const [selectPacienteIngresado] = await pool.query(
    "SELECT * FROM Ingresados WHERE ingreso_id = ?",
    [ingreso_id]
  );
  if (selectPacienteIngresado.length === 0) {
    throw new Error("No se encontró el paciente ingresado");
  }

  //Actualizar el panel de resumen del paciente
  if (selectPacienteIngresado[0].incidencia === 1) {
    const [selectPacienteIngresado] = await pool.query(
      "SELECT i.*, p.fecha_nacimiento, p.sexo FROM Ingresados i LEFT JOIN Pacientes p ON i.documento_identificacion_paciente = p.documento_identificacion WHERE i.ingreso_id = ?",
      [ingreso_id]
    );

    if (selectPacienteIngresado.length === 0) {
      throw new Error("No se encontró el ingreso asociado");
    }
    await panelResumenPaciente(selectPacienteIngresado[0], cama_id);
  }

  const [panelPacienteRow] = await pool.query(
    "SELECT panelPaciente FROM Camas WHERE cama_id = ?",
    [cama_id]
  );

  let panelPaciente = "";
  if (panelPacienteRow.length > 0 && panelPacienteRow[0].panelPaciente) {
    const base64Image = panelPacienteRow[0].panelPaciente.toString("base64");
    panelPaciente = `data:image/png;base64,${base64Image}`;
  }
  const nuevaIncidencia = {
    id_incidencia,
    ingreso_id,
    informacion_incidencia: cuerpo,
    activa,
    cama_id,
    fecha_emision,
    panelPaciente,
  };
  return nuevaIncidencia;
}

export async function desactivarIncidencia(
  id_incidencia,
  activa,
  cama_id,
  ingreso_id
) {
  try {
    const now = new Date();
    // Formato para MySQL: YYYY-MM-DD HH:mm:ss
    const fecha_desactivacion_mysql = now
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const fecha_desactivacion = now.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Actualizar la incidencia para desactivarla

    const [updateRows] = await pool.query(
      "UPDATE Incidencias SET activa = 0, fecha_desactivacion = ? WHERE id_incidencia = ?",
      [fecha_desactivacion_mysql, id_incidencia]
    );

    if (updateRows.affectedRows === 0) {
      throw new Error("No se encontró la incidencia para desactivar");
    }

    // Contar incidencias activas para el ingreso_id
    const [selectRows] = await pool.query(
      "SELECT COUNT(*) AS incidencias_activas FROM Incidencias WHERE activa = 1 AND ingreso_id = ?",
      [ingreso_id]
    );

    // Si no hay incidencias activas, actualizar el panel y el estado de Ingresados
    if (selectRows[0].incidencias_activas === 0) {
      await pool.query(
        "UPDATE Ingresados SET incidencia = 0 WHERE ingreso_id = ?",
        [ingreso_id]
      );
      const [selectPacienteIngresado] = await pool.query(
        "SELECT i.*, p.fecha_nacimiento, p.sexo FROM Ingresados i LEFT JOIN Pacientes p ON i.documento_identificacion_paciente = p.documento_identificacion WHERE i.ingreso_id = ?",
        [ingreso_id]
      );

      if (selectPacienteIngresado.length === 0) {
        throw new Error("No se encontró el ingreso asociado");
      }
      await panelResumenPaciente(selectPacienteIngresado[0], cama_id);
      const [panelPacienteRow] = await pool.query(
        "SELECT panelPaciente FROM Camas WHERE cama_id = ?",
        [cama_id]
      );

      let panelPaciente = "";
      if (panelPacienteRow.length > 0 && panelPacienteRow[0].panelPaciente) {
        const base64Image =
          panelPacienteRow[0].panelPaciente.toString("base64");
        panelPaciente = `data:image/png;base64,${base64Image}`;
      }

      const nuevaIncidenciaDesactivada = {
        id_incidencia: id_incidencia,
        activa: activa,
        ingreso_id: ingreso_id,
        fecha_desactivacion: fecha_desactivacion,
        panelPaciente: panelPaciente,
      };
      return nuevaIncidenciaDesactivada;
    }
    const nuevaIncidenciaDesactivada = {
      id_incidencia: id_incidencia,
      activa: activa,
      ingreso_id: ingreso_id,
      fecha_desactivacion: fecha_desactivacion,
      panelPaciente: null,
    };
    return nuevaIncidenciaDesactivada;

    // Actualizar el campo incidencia en Ingresados
  } catch (error) {
    logs.error(error)
    throw error; // Propagar el error para manejarlo en el llamador
  }
}

export async function actualizarInformacionCabecera(informacionCabecera) {
  try {
    const grupo_rh =
      informacionCabecera.grupo_sanguineo === "No especificado"
        ? null
        : informacionCabecera.grupo_sanguineo;
    const aislamiento = informacionCabecera.aislamiento ? 1 : 0;

    const [selectRows] = await pool.query(
      "SELECT tipo_alergia, tipo_dieta, aislamiento FROM Ingresados WHERE ingreso_id = ?",
      [informacionCabecera.ingreso_id]
    );

    let cambiarPanel = false;
    if (
      selectRows[0].tipo_dieta !== informacionCabecera.tipo_dieta ||
      selectRows[0].tipo_alergia !== informacionCabecera.tipo_alergia ||
      selectRows[0].aislamiento !== aislamiento
    ) {
      cambiarPanel = true;
    }

    if (cambiarPanel === true) {
      const [updateRows] = await pool.query(
        `UPDATE Ingresados 
       SET diagnostico = ?, tipo_alergia = ?, alergia = ?, tipo_dieta = ?, dieta = ?, aislamiento = ?, grupo_rh = ?
       WHERE ingreso_id = ?`,
        [
          informacionCabecera.diagnostico,
          informacionCabecera.tipo_alergia,
          informacionCabecera.alergia,
          informacionCabecera.tipo_dieta,
          informacionCabecera.dieta,
          aislamiento,
          grupo_rh,
          informacionCabecera.ingreso_id,
        ]
      );

      const [selectPacienteIngresado] = await pool.query(
        "SELECT i.*, p.fecha_nacimiento, p.sexo FROM Ingresados i LEFT JOIN Pacientes p ON i.documento_identificacion_paciente = p.documento_identificacion WHERE i.ingreso_id = ?",
        [informacionCabecera.ingreso_id]
      );

      if (selectPacienteIngresado.length === 0) {
        throw new Error("No se encontró el ingreso asociado");
      }
      await panelResumenPaciente(
        selectPacienteIngresado[0],
        informacionCabecera.cama_id
      );
      const [panelPacienteRow] = await pool.query(
        "SELECT panelPaciente FROM Camas WHERE cama_id = ?",
        [informacionCabecera.cama_id]
      );

      let panelPaciente = "";
      if (panelPacienteRow.length > 0 && panelPacienteRow[0].panelPaciente) {
        const base64Image =
          panelPacienteRow[0].panelPaciente.toString("base64");
        panelPaciente = `data:image/png;base64,${base64Image}`;
      }

      const respuesta = {
        success: true,
        panelPaciente: panelPaciente,
      };
      return respuesta;
    } else {
      const [updateRows] = await pool.query(
        `UPDATE Ingresados 
       SET diagnostico = ?, alergia = ?, dieta = ?, grupo_rh = ?
       WHERE ingreso_id = ?`,
        [
          informacionCabecera.diagnostico,
          informacionCabecera.alergia,
          informacionCabecera.dieta,
          grupo_rh,
          informacionCabecera.ingreso_id,
        ]
      );

      const respuesta = {
        success: true,
        panelPaciente: null,
      };
      return respuesta;
    }
  } catch (err) {
    logs.error(err)
    const respuesta = { success: false };
    return respuesta;
  }
}

export async function cambiarEstadoBalancePanel(balance, cama_id, ingreso_id) {
  try {
    const [comprobacionEstadoBalanceIngreso] = await pool.query(
      "SELECT balance FROM Ingresados WHERE ingreso_id = ?",
      [ingreso_id]
    );

    if (comprobacionEstadoBalanceIngreso[0].balance === balance) {
      return null;
    } else {
      await pool.query(
        "UPDATE Ingresados SET balance = ? WHERE ingreso_id = ?",
        [balance, ingreso_id]
      );
      const [selectPacienteIngresado] = await pool.query(
        "SELECT i.*, p.fecha_nacimiento, p.sexo FROM Ingresados i LEFT JOIN Pacientes p ON i.documento_identificacion_paciente = p.documento_identificacion WHERE i.ingreso_id = ?",
        [ingreso_id]
      );

      if (selectPacienteIngresado.length === 0) {
        throw new Error("No se encontró el ingreso asociado");
      }
      await panelResumenPaciente(selectPacienteIngresado[0], cama_id);
      const [panelPacienteRow] = await pool.query(
        "SELECT panelPaciente FROM Camas WHERE cama_id = ?",
        [cama_id]
      );

      let panelPaciente = "";
      if (panelPacienteRow.length > 0 && panelPacienteRow[0].panelPaciente) {
        const base64Image =
          panelPacienteRow[0].panelPaciente.toString("base64");
        panelPaciente = `data:image/png;base64,${base64Image}`;
      }
      return panelPaciente;
    }
  } catch (err) {
    logs.error(err)
  }
}

export async function recuperarEvolutivoEnfermeria(id_ingreso) {
  try {

    // Consultar todas las entradas para el ingreso_id
    const [entradasEvolutivo] = await pool.query(
      `SELECT 
        evolutivo_id,
        ingreso_id,
        historia,
        BIN_TO_UUID(enfermero_id) AS enfermero_id,
        nombreTrabajador,
        DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS fecha_emision,
        turno,
        paciente_nombre_completo,
        especialidad,
        informacion_evolutivo
      FROM evolutivoEnfermeria
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

export async function nuevaEntradaEvolutivoEnfermeria(info) {
  // Validar que todos los campos requeridos estén presentes
  const requiredFields = [
    "ingreso_id",
    "historia",
    "enfermero_id",
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
      `INSERT INTO evolutivoEnfermeria (
          ingreso_id, historia, enfermero_id, nombreTrabajador, fecha_emision,
          turno, paciente_nombre_completo, especialidad, informacion_evolutivo
        ) VALUES (?, ?, UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)`,
      [
        info.ingreso_id,
        info.historia,
        info.enfermero_id,
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

export async function nuevaEntradaConstantes(info) {
 
  try {
    const { dataAttributes, constantes } = info.data;
    let fecha_emision_mysql = null;
    if (constantes.fecha_emision) {
      const fecha = new Date(constantes.fecha_emision);
      if (!isNaN(fecha.getTime())) {
        fecha_emision_mysql = fecha
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      } else {
        throw new Error("Fecha de emisión inválida");
      }
    }

    const params = {
      ingreso_id: parseInt(dataAttributes.ingreso_id) || null,
      paciente_id: dataAttributes.paciente_id || null,
      id_trabajador: dataAttributes.id_trabajador || null,
      cama_id: dataAttributes.cama_id || null,
      historia: parseInt(dataAttributes.historia) || null,
      fecha_emision: fecha_emision_mysql,
      temperatura: constantes.temperatura
        ? parseFloat(constantes.temperatura)
        : null,
      tos: constantes.tos || null,
      disnea: constantes.disnea || null,
      saturacionO2: constantes.saturacionO2
        ? parseInt(constantes.saturacionO2)
        : null,
      frecCardiaca: constantes.frecCardiaca
        ? parseInt(constantes.frecCardiaca)
        : null,
      tas: constantes.tas ? parseInt(constantes.tas) : null,
      tad: constantes.tad ? parseInt(constantes.tad) : null,
      frecRespiratoria: constantes.frecRespiratoria
        ? parseInt(constantes.frecRespiratoria)
        : null,
      glucemia: constantes.glucemia ? parseInt(constantes.glucemia) : null,
      insulinaBasal: constantes.insulinaBasal
        ? parseInt(constantes.insulinaBasal)
        : null,
      insulinaRapida: constantes.insulinaRapida
        ? parseInt(constantes.insulinaRapida)
        : null,
      concO2: constantes.concO2 ? parseInt(constantes.concO2) : null,
      oxigeno: constantes.oxigeno ? parseFloat(constantes.oxigeno) : null,
      dispositivos: constantes.dispositivos || null,
      peso: constantes.peso ? parseFloat(constantes.peso) : null,
      talla: constantes.talla ? parseFloat(constantes.talla) : null,
      perimetroAbdominal: constantes.perimetroAbdominal
        ? parseFloat(constantes.perimetroAbdominal)
        : null,
      imc: constantes.imc ? parseFloat(constantes.imc) : null,
      perdidaPeso: constantes.perdidaPeso
        ? parseFloat(constantes.perdidaPeso)
        : null,
      pesoIngreso: constantes.pesoIngreso
        ? parseFloat(constantes.pesoIngreso)
        : null,
      ingestaOral: constantes.ingestaOral
        ? parseInt(constantes.ingestaOral)
        : null,
      aguaEndogena: constantes.aguaEndogena
        ? parseInt(constantes.aguaEndogena)
        : null,
      medicacion: constantes.medicacion
        ? parseInt(constantes.medicacion)
        : null,
      hemoderivados: constantes.hemoderivados
        ? parseInt(constantes.hemoderivados)
        : null,
      nutricionEnteral: constantes.nutricionEnteral
        ? parseInt(constantes.nutricionEnteral)
        : null,
      sueroterapia: constantes.sueroterapia
        ? parseInt(constantes.sueroterapia)
        : null,
      aguaEnteral: constantes.aguaEnteral
        ? parseInt(constantes.aguaEnteral)
        : null,
      sueroLavadorEntrada: constantes.sueroLavadorEntrada
        ? parseInt(constantes.sueroLavadorEntrada)
        : null,
      diuresis: constantes.diuresis ? parseInt(constantes.diuresis) : null,
      drenajes: constantes.drenajes ? parseInt(constantes.drenajes) : null,
      sueroLavadorSalida: constantes.sueroLavadorSalida
        ? parseInt(constantes.sueroLavadorSalida)
        : null,
      perdidasInsensibles: constantes.perdidasInsensibles
        ? parseInt(constantes.perdidasInsensibles)
        : null,
      vomitosLiquidos: constantes.vomitosLiquidos
        ? parseInt(constantes.vomitosLiquidos)
        : null,
      nefrostomiaDerecha: constantes.nefrostomiaDerecha
        ? parseInt(constantes.nefrostomiaDerecha)
        : null,
      nefrostomiaIzquierda: constantes.nefrostomiaIzquierda
        ? parseInt(constantes.nefrostomiaIzquierda)
        : null,
      ureteralDerecha: constantes.ureteralDerecha
        ? parseInt(constantes.ureteralDerecha)
        : null,
      ureteralIzquierda: constantes.ureteralIzquierda
        ? parseInt(constantes.ureteralIzquierda)
        : null,
      cistotomia: constantes.cistotomia
        ? parseInt(constantes.cistotomia)
        : null,
      pvc: constantes.pvc ? parseFloat(constantes.pvc) : null,
      dolor: constantes.dolor ? parseInt(constantes.dolor) : null,
      micciones: constantes.micciones ? parseInt(constantes.micciones) : null,
      deposiciones: constantes.deposiciones
        ? parseInt(constantes.deposiciones)
        : null,
      vomitos: constantes.vomitos ? parseInt(constantes.vomitos) : null,
      cambioPostural: constantes.cambioPostural
        ? parseInt(constantes.cambioPostural)
        : null,
      aspiracionGastrica: constantes.aspiracionGastrica
        ? parseInt(constantes.aspiracionGastrica)
        : null,
      frecCardiacaAcum: constantes.frecCardiacaAcum
        ? parseInt(constantes.frecCardiacaAcum)
        : null,
      eng: constantes.eng || null,
      expectoracion: constantes.expectoracion || null,
      inr: constantes.inr ? parseFloat(constantes.inr) : null,
      valoracionIngesta: constantes.valoracionIngesta || null,
    };

    const values = [
      params.ingreso_id,
      params.paciente_id,
      params.id_trabajador,
      params.cama_id,
      params.historia,
      params.fecha_emision,
      params.temperatura,
      params.tos,
      params.disnea,
      params.saturacionO2,
      params.frecCardiaca,
      params.tas,
      params.tad,
      params.frecRespiratoria,
      params.glucemia,
      params.insulinaBasal,
      params.insulinaRapida,
      params.concO2,
      params.oxigeno,
      params.dispositivos,
      params.peso,
      params.talla,
      params.perimetroAbdominal,
      params.imc,
      params.perdidaPeso,
      params.pesoIngreso,
      params.ingestaOral,
      params.aguaEndogena,
      params.medicacion,
      params.hemoderivados,
      params.nutricionEnteral,
      params.sueroterapia,
      params.aguaEnteral,
      params.sueroLavadorEntrada,
      params.diuresis,
      params.drenajes,
      params.sueroLavadorSalida,
      params.perdidasInsensibles,
      params.vomitosLiquidos,
      params.nefrostomiaDerecha,
      params.nefrostomiaIzquierda,
      params.ureteralDerecha,
      params.ureteralIzquierda,
      params.cistotomia,
      params.pvc,
      params.dolor,
      params.micciones,
      params.deposiciones,
      params.vomitos,
      params.cambioPostural,
      params.aspiracionGastrica,
      params.frecCardiacaAcum,
      params.eng,
      params.expectoracion,
      params.inr,
      params.valoracionIngesta,
    ];

    
    if (values.length !== 56) {
      console.log("Entra")
      throw new Error(
        `Value count (${values.length}) does not match column count (55)`
      );
    }

    
    const query = `
          INSERT INTO constantesPaciente (
              ingreso_id, paciente_id, id_trabajador, cama_id, historia, fecha_emision,
              temperatura, tos, disnea, saturacionO2, frecCardiaca, tas, tad,
              frecRespiratoria, glucemia, insulinaBasal, insulinaRapida, concO2,
              oxigeno, dispositivos, peso, talla, perimetroAbdominal, imc,
              perdidaPeso, pesoIngreso, ingestaOral, aguaEndogena, medicacion,
              hemoderivados, nutricionEnteral, sueroterapia, aguaEnteral,
              sueroLavadorEntrada, diuresis, drenajes, sueroLavadorSalida,
              perdidasInsensibles, vomitosLiquidos, nefrostomiaDerecha,
              nefrostomiaIzquierda, ureteralDerecha, ureteralIzquierda, cistotomia,
              pvc, dolor, micciones, deposiciones, vomitos, cambioPostural,
              aspiracionGastrica, frecCardiacaAcum, eng, expectoracion, inr,
              valoracionIngesta
          )
          VALUES (?, ?, UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

  

    
    await pool.query(query, values);
    return true;
  } catch (error) {
    console.log(error)
    logs.error(error)
    throw error;
  }
}

export async function nuevaEntradaTest(info) {
  const tipoTest = info.tipo_test;

  if (tipoTest === "Barthel") {
    
    if (!info.detalles || !info.resultado_total || !info.interpretacion) {
      throw new Error("Faltan datos requeridos para el test Barthel");
    }
    let fecha_emision_mysql = null;
    if (info.fecha) {
      const fecha = new Date(info.fecha);
      if (!isNaN(fecha.getTime())) {
        // Verificar que la fecha sea válida
        fecha_emision_mysql = fecha
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      } else {
        throw new Error("Fecha de emisión inválida");
      }
    }
    
    const insertTablaBarthel = {
      ingreso_id: info.ingreso_id,
      documento_identificacion: info.paciente_id,
      fecha_emision: fecha_emision_mysql,
      alimentacion: info.detalles.alimentacion || 0,
      baño: info.detalles.baño || 0,
      aseo_personal: info.detalles.aseo_personal || 0,
      vestirse: info.detalles.vestirse || 0,
      control_intestino: info.detalles.control_intestino || 0,
      control_vejiga: info.detalles.control_vejiga || 0,
      uso_inodoro: info.detalles.uso_inodoro || 0,
      transferencias: info.detalles.transferencias || 0,
      movilidad: info.detalles.movilidad || 0,
      subir_escaleras: info.detalles.subir_escaleras || 0,
      resultado: info.resultado_total,
      interpretacion: info.interpretacion,
    };

    const [barthelResult] = await pool.query(
      `INSERT INTO testBarthel (
                  ingreso_id, documento_identificacion, fecha_emision,
                  alimentacion, baño, aseo_personal, vestirse, control_intestino,
                  control_vejiga, uso_inodoro, transferencias, movilidad, subir_escaleras,
                  resultado, interpretacion
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        insertTablaBarthel.ingreso_id,
        insertTablaBarthel.documento_identificacion,
        insertTablaBarthel.fecha_emision,
        insertTablaBarthel.alimentacion,
        insertTablaBarthel.baño,
        insertTablaBarthel.aseo_personal,
        insertTablaBarthel.vestirse,
        insertTablaBarthel.control_intestino,
        insertTablaBarthel.control_vejiga,
        insertTablaBarthel.uso_inodoro,
        insertTablaBarthel.transferencias,
        insertTablaBarthel.movilidad,
        insertTablaBarthel.subir_escaleras,
        insertTablaBarthel.resultado,
        insertTablaBarthel.interpretacion,
      ]
    );

    const insertTestPacientes = {
      tipo_prueba: tipoTest,
      resultado: info.resultado_total,
      interpretacion: info.interpretacion,
      id_del_test: barthelResult.insertId,
      documento_identificacion: info.paciente_id,
      fecha_emision: fecha_emision_mysql,
      ingreso_id: info.ingreso_id,
      id_trabajador: info.id_trabajador,
      nombreTrabajador: info.nombreTrabajador,
    };

    const [pacienteResult] = await pool.query(
      `INSERT INTO testPaciente (
                  tipo_prueba, resultado, interpretacion, id_del_test,
                  documento_identificacion, fecha_emision, ingreso_id,
                  nombreTrabajador,id_trabajador
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?))`,
      [
        insertTestPacientes.tipo_prueba,
        insertTestPacientes.resultado,
        insertTestPacientes.interpretacion,
        insertTestPacientes.id_del_test,
        insertTestPacientes.documento_identificacion,
        insertTestPacientes.fecha_emision,
        insertTestPacientes.ingreso_id,
        insertTestPacientes.nombreTrabajador,
        insertTestPacientes.id_trabajador,
      ]
    );

    const [resultadoBarthel] = await pool.query(
      `SELECT escala_barthel FROM Ingresados WHERE ingreso_id = ?`,
      [info.ingreso_id]
    );

    let panelPaciente = null;
    const newScore = info.resultado_total;

    //rangos de dependencia para el crear el panel
    const getBarthelRange = (score) => {
      if (score <= 20)
        return {
          range: "Dependiente Total",
          interpretacion: "Dependiente Total",
        };
      if (score <= 35)
        return {
          range: "Dependiente Grave",
          interpretacion: "Dependiente Grave",
        };
      if (score <= 55)
        return {
          range: "Dependiente Moderado",
          interpretacion: "Dependiente Moderado",
        };
      if (score <= 90)
        return {
          range: "Dependiente Leve",
          interpretacion: "Dependiente Leve",
        };
      return { range: "Independiente", interpretacion: "Independiente" };
    };

    const currentScore = resultadoBarthel[0]?.escala_barthel || -1;
    const currentRange = getBarthelRange(currentScore);
    const newRange = getBarthelRange(newScore);

    if (currentScore === -1 || currentRange.range !== newRange.range) {
      await pool.query(
        `UPDATE Ingresados SET escala_barthel = ?  WHERE ingreso_id = ?`,
        [newScore, info.ingreso_id]
      );

      const [selectPacienteIngresado] = await pool.query(
        `SELECT i.*, p.fecha_nacimiento, p.sexo 
                   FROM Ingresados i 
                   LEFT JOIN Pacientes p ON i.documento_identificacion_paciente = p.documento_identificacion 
                   WHERE i.ingreso_id = ?`,
        [info.ingreso_id]
      );

      if (selectPacienteIngresado.length === 0) {
        throw new Error("No se encontró el ingreso asociado");
      }

      // generar panel
      await panelResumenPaciente(
        selectPacienteIngresado[0],
        info.cama_id
      );
s
      const [panelPacienteRow] = await pool.query(
        `SELECT panelPaciente FROM Camas WHERE cama_id = ?`,
        [info.cama_id]
      );

      if (panelPacienteRow.length > 0 && panelPacienteRow[0].panelPaciente) {
        const base64Image =
          panelPacienteRow[0].panelPaciente.toString("base64");
        panelPaciente = `data:image/png;base64,${base64Image}`;
      }
    }

    const nuevaEntradaTest = {
      panelPaciente,
      tipo_prueba: insertTestPacientes.tipo_prueba,
      resultado: insertTestPacientes.resultado,
      interpretacion: insertTestPacientes.interpretacion,
      id_del_test: insertTestPacientes.id_del_test,
      documento_identificacion: insertTestPacientes.documento_identificacion,
      fecha_emision: insertTestPacientes.fecha_emision,
      ingreso_id: insertTestPacientes.ingreso_id,
      id_trabajador: insertTestPacientes.id_trabajador,
      nombreTrabajador: insertTestPacientes.nombreTrabajador,
      testPaciente_id: pacienteResult.insertId,
    };
    return nuevaEntradaTest;
  } else if (tipoTest === "EVA") {

    if (!info.detalles || !info.interpretacion) {
      throw new Error("Faltan datos requeridos para el test EVA");
    }
    let fecha_emision_mysql = null;
    if (info.fecha) {
      const fecha = new Date(info.fecha);
      if (!isNaN(fecha.getTime())) {
        // Verificar que la fecha sea válida
        fecha_emision_mysql = fecha
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      } else {
        throw new Error("Fecha de emisión inválida");
      }
    }
    const insertTablaEva = {
      ingreso_id: info.ingreso_id,
      documento_identificacion: info.paciente_id,
      fecha_emision: fecha_emision_mysql,
      dolor_puntuacion: info.detalles.dolor_puntuacion,
      dolor_localizacion: info.detalles.dolor_localizacion,
      interpretacion: info.interpretacion,
    };

    const [evaResult] = await pool.query(
      `INSERT INTO testEva (
                  ingreso_id, documento_identificacion, fecha_emision,
                  dolor_puntuacion, dolor_localizacion,
                   interpretacion
              ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        insertTablaEva.ingreso_id,
        insertTablaEva.documento_identificacion,
        insertTablaEva.fecha_emision,
        insertTablaEva.dolor_puntuacion,
        insertTablaEva.dolor_localizacion,
        insertTablaEva.interpretacion,
      ]
    );

    const insertTestPacientes = {
      tipo_prueba: tipoTest,
      resultado: info.detalles.dolor_puntuacion,
      interpretacion: info.interpretacion,
      id_del_test: evaResult.insertId,
      documento_identificacion: info.paciente_id,
      fecha_emision: fecha_emision_mysql,
      ingreso_id: info.ingreso_id,
      id_trabajador: info.id_trabajador,
      nombreTrabajador: info.nombreTrabajador,
    };

    const [pacienteResult] = await pool.query(
      `INSERT INTO testPaciente (
                  tipo_prueba, resultado, interpretacion, id_del_test,
                  documento_identificacion, fecha_emision, ingreso_id,
                  nombreTrabajador,id_trabajador
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?))`,
      [
        insertTestPacientes.tipo_prueba,
        insertTestPacientes.resultado,
        insertTestPacientes.interpretacion,
        insertTestPacientes.id_del_test,
        insertTestPacientes.documento_identificacion,
        insertTestPacientes.fecha_emision,
        insertTestPacientes.ingreso_id,
        insertTestPacientes.nombreTrabajador,
        insertTestPacientes.id_trabajador,
      ]
    );
    const nuevaEntradaTest = {
      tipo_prueba: insertTestPacientes.tipo_prueba,
      resultado: insertTestPacientes.resultado,
      interpretacion: insertTestPacientes.interpretacion,
      id_del_test: insertTestPacientes.id_del_test,
      documento_identificacion: insertTestPacientes.documento_identificacion,
      fecha_emision: insertTestPacientes.fecha_emision,
      ingreso_id: insertTestPacientes.ingreso_id,
      id_trabajador: insertTestPacientes.id_trabajador,
      nombreTrabajador: insertTestPacientes.nombreTrabajador,
      testPaciente_id: pacienteResult.insertId,
    };
    return nuevaEntradaTest;
  } else if (tipoTest === "Downtown") {

    if (!info.detalles || !info.interpretacion || !info.resultado_total) {
      throw new Error("Faltan datos requeridos para el test EVA");
    }
    let fecha_emision_mysql = null;
    if (info.fecha) {
      const fecha = new Date(info.fecha);
      if (!isNaN(fecha.getTime())) {
        // Verificar que la fecha sea válida
        fecha_emision_mysql = fecha
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      } else {
        throw new Error("Fecha de emisión inválida");
      }
    }
    const insertTablaDowntown = {
      ingreso_id: info.ingreso_id,
      documento_identificacion: info.paciente_id,
      fecha_emision: fecha_emision_mysql,
      resultado: info.resultado_total,
      caidas_previas: info.detalles.caidas_previas,
      medicacion: info.detalles.medicacion,
      deficiencia_sensorial: info.detalles.deficiencia_sensorial,
      estado_mental: info.detalles.estado_mental,
      capacidad_movilidad: info.detalles.capacidad_movilidad,
      interpretacion: info.interpretacion,
    };

    const [downtownResult] = await pool.query(
      `INSERT INTO testDowntown (
        ingreso_id, documento_identificacion, fecha_emision, resultado,
        caidas_previas, medicacion, deficiencia_sensorial, estado_mental,
        capacidad_movilidad, interpretacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        insertTablaDowntown.ingreso_id,
        insertTablaDowntown.documento_identificacion,
        insertTablaDowntown.fecha_emision,
        insertTablaDowntown.resultado,
        insertTablaDowntown.caidas_previas,
        insertTablaDowntown.medicacion,
        insertTablaDowntown.deficiencia_sensorial,
        insertTablaDowntown.estado_mental,
        insertTablaDowntown.capacidad_movilidad,
        insertTablaDowntown.interpretacion,
      ]
    );

    const insertTestPacientes = {
      tipo_prueba: tipoTest,
      resultado: info.resultado_total,
      interpretacion: info.interpretacion,
      id_del_test: downtownResult.insertId,
      documento_identificacion: info.paciente_id,
      fecha_emision: fecha_emision_mysql,
      ingreso_id: info.ingreso_id,
      id_trabajador: info.id_trabajador,
      nombreTrabajador: info.nombreTrabajador,
    };

    const [pacienteResult] = await pool.query(
      `INSERT INTO testPaciente (
                  tipo_prueba, resultado, interpretacion, id_del_test,
                  documento_identificacion, fecha_emision, ingreso_id,
                  nombreTrabajador,id_trabajador
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?))`,
      [
        insertTestPacientes.tipo_prueba,
        insertTestPacientes.resultado,
        insertTestPacientes.interpretacion,
        insertTestPacientes.id_del_test,
        insertTestPacientes.documento_identificacion,
        insertTestPacientes.fecha_emision,
        insertTestPacientes.ingreso_id,
        insertTestPacientes.nombreTrabajador,
        insertTestPacientes.id_trabajador,
      ]
    );
    const nuevaEntradaTest = {
      tipo_prueba: insertTestPacientes.tipo_prueba,
      resultado: insertTestPacientes.resultado,
      interpretacion: insertTestPacientes.interpretacion,
      id_del_test: insertTestPacientes.id_del_test,
      documento_identificacion: insertTestPacientes.documento_identificacion,
      fecha_emision: insertTestPacientes.fecha_emision,
      ingreso_id: insertTestPacientes.ingreso_id,
      id_trabajador: insertTestPacientes.id_trabajador,
      nombreTrabajador: insertTestPacientes.nombreTrabajador,
      testPaciente_id: pacienteResult.insertId,
    };
    return nuevaEntradaTest;
  } else if (tipoTest === "Norton") {
    // Validate required fields
    if (!info.detalles || !info.interpretacion || !info.resultado_total) {
      throw new Error("Faltan datos requeridos para el test Norton");
    }
    let fecha_emision_mysql = null;
    if (info.fecha) {
      const fecha = new Date(info.fecha);
      if (!isNaN(fecha.getTime())) {
        // Verificar que la fecha sea válida
        fecha_emision_mysql = fecha
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      } else {
        throw new Error("Fecha de emisión inválida");
      }
    }
    const insertTablaNorton = {
      ingreso_id: info.ingreso_id,
      documento_identificacion: info.paciente_id,
      fecha_emision: fecha_emision_mysql,
      resultado: info.resultado_total,
      condicion_fisica: info.detalles.condicion_fisica,
      condicion_mental: info.detalles.condicion_mental,
      actividad: info.detalles.actividad,
      movilidad: info.detalles.movilidad,
      incontinencia: info.detalles.incontinencia,
      interpretacion: info.interpretacion,
    };

    const [nortonResult] = await pool.query(
      `INSERT INTO testNorton (
        ingreso_id, documento_identificacion, fecha_emision, resultado,
        condicion_fisica, condicion_mental, actividad, movilidad,
        incontinencia, interpretacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        insertTablaNorton.ingreso_id,
        insertTablaNorton.documento_identificacion,
        insertTablaNorton.fecha_emision,
        insertTablaNorton.resultado,
        insertTablaNorton.condicion_fisica,
        insertTablaNorton.condicion_mental,
        insertTablaNorton.actividad,
        insertTablaNorton.movilidad,
        insertTablaNorton.incontinencia,
        insertTablaNorton.interpretacion,
      ]
    );

    const insertTestPacientes = {
      tipo_prueba: tipoTest,
      resultado: info.resultado_total,
      interpretacion: info.interpretacion,
      id_del_test: nortonResult.insertId,
      documento_identificacion: info.paciente_id,
      fecha_emision: fecha_emision_mysql,
      ingreso_id: info.ingreso_id,
      id_trabajador: info.id_trabajador,
      nombreTrabajador: info.nombreTrabajador,
    };

    const [pacienteResult] = await pool.query(
      `INSERT INTO testPaciente (
        tipo_prueba, resultado, interpretacion, id_del_test,
        documento_identificacion, fecha_emision, ingreso_id,
        nombreTrabajador, id_trabajador
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?))`,
      [
        insertTestPacientes.tipo_prueba,
        insertTestPacientes.resultado,
        insertTestPacientes.interpretacion,
        insertTestPacientes.id_del_test,
        insertTestPacientes.documento_identificacion,
        insertTestPacientes.fecha_emision,
        insertTestPacientes.ingreso_id,
        insertTestPacientes.nombreTrabajador,
        insertTestPacientes.id_trabajador,
      ]
    );

    const nuevaEntradaTest = {
      tipo_prueba: insertTestPacientes.tipo_prueba,
      resultado: insertTestPacientes.resultado,
      interpretacion: insertTestPacientes.interpretacion,
      id_del_test: insertTestPacientes.id_del_test,
      documento_identificacion: insertTestPacientes.documento_identificacion,
      fecha_emision: insertTestPacientes.fecha_emision,
      ingreso_id: insertTestPacientes.ingreso_id,
      id_trabajador: insertTestPacientes.id_trabajador,
      nombreTrabajador: insertTestPacientes.nombreTrabajador,
      testPaciente_id: pacienteResult.insertId,
    };
    return nuevaEntradaTest;
  } else if (tipoTest === "Braden") {
    if (!info.detalles || !info.resultado_total) {
      throw new Error("Faltan datos requeridos para el test Braden");
    }
    let fecha_emision_mysql = null;
    if (info.fecha) {
      const fecha = new Date(info.fecha);
      if (!isNaN(fecha.getTime())) {
        // Verificar que la fecha sea válida
        fecha_emision_mysql = fecha
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      } else {
        throw new Error("Fecha de emisión inválida");
      }
    }
    const insertTablaBraden = {
      ingreso_id: info.ingreso_id,
      documento_identificacion: info.paciente_id,
      fecha_emision: fecha_emision_mysql,
      resultado: info.resultado_total,
      percepcion_sensorial: info.detalles.percepcion_sensorial,
      humedad: info.detalles.humedad,
      actividad: info.detalles.actividad,
      movilidad: info.detalles.movilidad,
      nutricion: info.detalles.nutricion,
      friccion_cizallamiento: info.detalles.friccion_cizallamiento,
      interpretacion: info.interpretacion,
    };

    const [bradenResult] = await pool.query(
      `INSERT INTO testBraden (
        ingreso_id, documento_identificacion, fecha_emision, resultado,
        percepcion_sensorial, humedad, actividad, movilidad,
        nutricion, friccion_cizallamiento,interpretacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        insertTablaBraden.ingreso_id,
        insertTablaBraden.documento_identificacion,
        insertTablaBraden.fecha_emision,
        insertTablaBraden.resultado,
        insertTablaBraden.percepcion_sensorial,
        insertTablaBraden.humedad,
        insertTablaBraden.actividad,
        insertTablaBraden.movilidad,
        insertTablaBraden.nutricion,
        insertTablaBraden.friccion_cizallamiento,
        insertTablaBraden.interpretacion,
      ]
    );

    const insertTestPacientes = {
      tipo_prueba: tipoTest,
      resultado: info.resultado_total,
      interpretacion: info.interpretacion || null,
      id_del_test: bradenResult.insertId,
      documento_identificacion: info.paciente_id,
      fecha_emision: fecha_emision_mysql,
      ingreso_id: info.ingreso_id,
      id_trabajador: info.id_trabajador,
      nombreTrabajador: info.nombreTrabajador,
    };

    const [pacienteResult] = await pool.query(
      `INSERT INTO testPaciente (
        tipo_prueba, resultado, interpretacion, id_del_test,
        documento_identificacion, fecha_emision, ingreso_id,
        nombreTrabajador, id_trabajador
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?))`,
      [
        insertTestPacientes.tipo_prueba,
        insertTestPacientes.resultado,
        insertTestPacientes.interpretacion,
        insertTestPacientes.id_del_test,
        insertTestPacientes.documento_identificacion,
        insertTestPacientes.fecha_emision,
        insertTestPacientes.ingreso_id,
        insertTestPacientes.nombreTrabajador,
        insertTestPacientes.id_trabajador,
      ]
    );

    const nuevaEntradaTest = {
      tipo_prueba: insertTestPacientes.tipo_prueba,
      resultado: insertTestPacientes.resultado,
      interpretacion: insertTestPacientes.interpretacion,
      id_del_test: insertTestPacientes.id_del_test,
      documento_identificacion: insertTestPacientes.documento_identificacion,
      fecha_emision: insertTestPacientes.fecha_emision,
      ingreso_id: insertTestPacientes.ingreso_id,
      id_trabajador: insertTestPacientes.id_trabajador,
      nombreTrabajador: insertTestPacientes.nombreTrabajador,
      testPaciente_id: pacienteResult.insertId,
    };
    return nuevaEntradaTest;
  } else {
    throw new Error(`Tipo de test no soportado: ${tipoTest}`);
  }
}

export async function nuevaEntradaMantenimiento(info) {
  try {
    const mantenimientoData = info;
    if (!mantenimientoData) {
      throw new Error("Faltan datos de la entrada de mantenimiento");
    }

    // Validar campos requeridos
    if (
      !mantenimientoData.fecha_mantenimiento ||
      !mantenimientoData.ingreso_id ||
      !mantenimientoData.paciente_id ||
      !mantenimientoData.id_trabajador ||
      !mantenimientoData.nombre_trabajador ||
      !mantenimientoData.id_via
    ) {
      throw new Error(
        "Faltan datos requeridos para la entrada de mantenimiento"
      );
    }

    // Validar formato de fecha_mantenimiento
    let fecha_mantenimiento_mysql = null;
    if (mantenimientoData.fecha_mantenimiento) {
      const fecha = new Date(mantenimientoData.fecha_mantenimiento);
      if (!isNaN(fecha.getTime())) {
        fecha_mantenimiento_mysql = fecha
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      } else {
        throw new Error("Fecha de mantenimiento inválida");
      }
    } else {
      throw new Error("Fecha de mantenimiento es requerida");
    }

    // Preparar inserción para viasMantenimiento
    const insertMantenimiento = {
      enfermero: mantenimientoData.enfermero, // Si no se proporciona enfermero, usa nombre_trabajador
      fecha_mantenimiento: fecha_mantenimiento_mysql,
      actuacion: mantenimientoData.actuacion,
      complicaciones: mantenimientoData.complicaciones || null,
      observaciones: mantenimientoData.observaciones || null,
      escala_maddox: Number(mantenimientoData.escala_maddox),
      ingreso_id: mantenimientoData.ingreso_id,
      paciente_id: mantenimientoData.paciente_id,
      id_trabajador: mantenimientoData.id_trabajador,
      nombre_trabajador: mantenimientoData.nombre_trabajador,
      id_via: mantenimientoData.id_via,
    };

    // Insertar en viasMantenimiento
    const [result] = await pool.query(
      `INSERT INTO viasMantenimiento (
              enfermero, fecha_mantenimiento, actuacion, complicaciones, observaciones,
              escala_maddox, ingreso_id, paciente_id, id_trabajador, nombre_trabajador, id_via
          ) VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?), ?, ?
          )`,
      [
        insertMantenimiento.enfermero,
        insertMantenimiento.fecha_mantenimiento,
        insertMantenimiento.actuacion,
        insertMantenimiento.complicaciones,
        insertMantenimiento.observaciones,
        insertMantenimiento.escala_maddox,
        insertMantenimiento.ingreso_id,
        insertMantenimiento.paciente_id,
        insertMantenimiento.id_trabajador,
        insertMantenimiento.nombre_trabajador,
        insertMantenimiento.id_via,
      ]
    );

    // Preparar objeto de retorno
    const nuevaEntrada = {
      id: result.insertId,
      enfermero: insertMantenimiento.enfermero,
      fecha_mantenimiento: insertMantenimiento.fecha_mantenimiento,
      actuacion: insertMantenimiento.actuacion,
      complicaciones: insertMantenimiento.complicaciones,
      observaciones: insertMantenimiento.observaciones,
      escala_maddox: insertMantenimiento.escala_maddox,
      ingreso_id: insertMantenimiento.ingreso_id,
      paciente_id: insertMantenimiento.paciente_id,
      id_trabajador: insertMantenimiento.id_trabajador,
      nombre_trabajador: insertMantenimiento.nombre_trabajador,
      id_via: insertMantenimiento.id_via,
    };
    return nuevaEntrada;
  } catch (error) {
    logs.error(error)

    return null;
  }
}

export async function nuevaEntradaBalance(info) {
  try {
    const balanceData = info.balanceData;
    if (!balanceData) {
      throw new Error("Faltan datos del balance");
    }

    // Validar campos requeridos
    if (
      !balanceData.ingreso_id ||
      !balanceData.paciente_id ||
      !balanceData.id_trabajador ||
      !balanceData.nombreTrabajador ||
      !balanceData.fecha_emision ||
      !balanceData.entradas ||
      !balanceData.salidas ||
      balanceData.total_entradas === undefined ||
      balanceData.total_salidas === undefined
    ) {
      throw new Error("Faltan datos requeridos para el balance");
    }

    // Validar formato de fecha_emision
    let fecha_emision_mysql = null;
    if (balanceData.fecha_emision) {
      const fecha = new Date(balanceData.fecha_emision);
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

    // Convertir valores numéricos
    const total_entradas = parseFloat(balanceData.total_entradas) || 0;
    const total_salidas = parseFloat(balanceData.total_salidas) || 0;
    const balance_total = total_entradas - total_salidas;

    // Preparar inserción para balanceDetallesPaciente
    const insertDetalles = {
      ingreso_id: parseInt(balanceData.ingreso_id),
      fecha_emision: fecha_emision_mysql,
      sueroterapia: parseFloat(balanceData.entradas.sueroterapia) || 0,
      nutricion_parenteral:
        parseFloat(balanceData.entradas.nutricion_parenteral) || 0,
      hemoderivados: parseFloat(balanceData.entradas.hemoderivados) || 0,
      agua_endogena: parseFloat(balanceData.entradas.agua_endogena) || 0,
      alimentos_liquidos:
        parseFloat(balanceData.entradas.alimentos_liquidos) || 0,
      formula_enteral: parseFloat(balanceData.entradas.formula_enteral) || 0,
      medicacion: parseFloat(balanceData.entradas.medicacion) || 0,
      otros_entradas: parseFloat(balanceData.entradas.otros_entradas) || 0,
      diuresis: parseFloat(balanceData.salidas.diuresis) || 0,
      drenaje: parseFloat(balanceData.salidas.drenaje) || 0,
      vomitos: parseFloat(balanceData.salidas.vomitos) || 0,
      deposiciones: parseFloat(balanceData.salidas.deposiciones) || 0,
      aspiracion_gastrica:
        parseFloat(balanceData.salidas.aspiracion_gastrica) || 0,
      perdidas_sensibles:
        parseFloat(balanceData.salidas.perdidas_sensibles) || 0,
      otros_salidas: parseFloat(balanceData.salidas.otros_salidas) || 0,
      balance_total: balance_total.toFixed(2),
    };

    // Insertar en balanceDetallesPaciente
    const [insertBalanceDetalle] = await pool.query(
      `INSERT INTO balanceDetallesPaciente (
          ingreso_id, fecha_emision, sueroterapia, nutricion_parenteral, hemoderivados,
          agua_endogena, alimentos_liquidos, formula_enteral, medicacion, otros_entradas,
          diuresis, drenaje, vomitos, deposiciones, aspiracion_gastrica, perdidas_sensibles,
          otros_salidas, balance_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        insertDetalles.ingreso_id,
        insertDetalles.fecha_emision,
        insertDetalles.sueroterapia.toFixed(2),
        insertDetalles.nutricion_parenteral.toFixed(2),
        insertDetalles.hemoderivados.toFixed(2),
        insertDetalles.agua_endogena.toFixed(2),
        insertDetalles.alimentos_liquidos.toFixed(2),
        insertDetalles.formula_enteral.toFixed(2),
        insertDetalles.medicacion.toFixed(2),
        insertDetalles.otros_entradas.toFixed(2),
        insertDetalles.diuresis.toFixed(2),
        insertDetalles.drenaje.toFixed(2),
        insertDetalles.vomitos.toFixed(2),
        insertDetalles.deposiciones.toFixed(2),
        insertDetalles.aspiracion_gastrica.toFixed(2),
        insertDetalles.perdidas_sensibles.toFixed(2),
        insertDetalles.otros_salidas.toFixed(2),
        insertDetalles.balance_total,
      ]
    );

    // Preparar inserción para balanceResumenPaciente
    const insertResumen = {
      id: insertBalanceDetalle.insertId,
      entradas: total_entradas.toFixed(2),
      salidas: total_salidas.toFixed(2),
      balance_total: balance_total.toFixed(2),
      documento_identificacion: balanceData.paciente_id,
      fecha_emision: fecha_emision_mysql,
      ingreso_id: parseInt(balanceData.ingreso_id),
      id_trabajador: balanceData.id_trabajador,
      nombre_trabajador: balanceData.nombreTrabajador,
    };

    // Insertar en balanceResumenPaciente
    const [resumenResult] = await pool.query(
      `INSERT INTO balanceResumenPaciente (
        id, entradas, salidas, balance_total, documento_identificacion, fecha_emision,
        ingreso_id, id_trabajador, nombre_trabajador
      ) VALUES (?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?), ?)`,
      [
        insertResumen.id,
        insertResumen.entradas,
        insertResumen.salidas,
        insertResumen.balance_total,
        insertResumen.documento_identificacion,
        insertResumen.fecha_emision,
        insertResumen.ingreso_id,
        insertResumen.id_trabajador,
        insertResumen.nombre_trabajador,
      ]
    );

    const id_resumen = resumenResult.insertId;

    // Preparar objeto de retorno
    const nuevaEntradaBalance = {
      id: id_resumen,
      ingreso_id: insertResumen.ingreso_id,
      documento_identificacion: insertResumen.documento_identificacion,
      fecha_emision: insertResumen.fecha_emision,
      entradas: insertResumen.entradas,
      salidas: insertResumen.salidas,
      balance_total: insertResumen.balance_total,
      id_trabajador: insertResumen.id_trabajador,
      nombre_trabajador: insertResumen.nombre_trabajador,
    };

    return nuevaEntradaBalance;
  } catch (error) {
    logs.error(error)
    return null;
  }
}

export async function nuevaEntradaVia(info) {
  try {
    const viaData = info;
    if (!viaData) {
      throw new Error("Faltan datos de la vía");
    }

    // Validar campos requeridos
    if (
      !viaData.fecha_emision ||
      !viaData.tipo_cateter ||
      !viaData.tamano ||
      !viaData.lugar_insercion ||
      !viaData.lateralidad ||
      !viaData.vena_vaso ||
      !viaData.ingreso_id ||
      !viaData.paciente_id
    ) {
      throw new Error("Faltan datos requeridos para la vía");
    }

    // Validar formato de fecha_emision
    let fecha_emision_mysql = null;
    if (viaData.fecha_emision) {
      const fecha = new Date(viaData.fecha_emision);
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

    // Preparar inserción para viasDetalles
    const insertViaDetalles = {
      fecha_emision: fecha_emision_mysql,
      fecha_fin: null, // No se proporciona fecha_fin en info, se deja como NULL
      tipo_cateter: viaData.tipo_cateter,
      tamano: viaData.tamano,
      lugar_insercion: viaData.lugar_insercion,
      lateralidad: viaData.lateralidad,
      vena_vaso: viaData.vena_vaso,
      uso_via: viaData.uso_via || "",
      perfusion: viaData.perfusion || "",
      fijacion_cateter: viaData.fijacion_cateter || "",
      numero_luces: viaData.numero_luces
        ? Number(viaData.numero_luces)
        : null,
      longitud_insercion: viaData.longitud_insercion
        ? Number(viaData.longitud_insercion)
        : null,
      marca_cateter: viaData.marca_cateter || "",
      dolor_asociado: viaData.dolor_asociado || "",
      manejo_dolor: viaData.manejo_dolor || "",
      accesorios: viaData.accesorios || "",
      educacion_sanitaria: viaData.educacion_sanitaria || "",
      extremidad_dominante: viaData.extremidad_dominante || "",
      preparacion_piel: viaData.preparacion_piel || "",
      observaciones: viaData.observaciones || "",
      ingreso_id: viaData.ingreso_id,
      documento_identificacion: viaData.paciente_id,
      id_trabajador: viaData.id_trabajador,
      nombre_trabajador: viaData.nombre_trabajador,
    };

    // Insertar en viasDetalles
    const [idResult] = await pool.query(
      `INSERT INTO viasDetalles (
              fecha_emision, fecha_fin, tipo_cateter, tamano, lugar_insercion, lateralidad, vena_vaso,
              uso_via, perfusion, fijacion_cateter, numero_luces, longitud_insercion, marca_cateter,
              dolor_asociado, manejo_dolor, accesorios, educacion_sanitaria, extremidad_dominante,
              preparacion_piel, observaciones, ingreso_id, documento_identificacion, id_trabajador,
              nombre_trabajador
          ) VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?), ?
          )`,
      [
        insertViaDetalles.fecha_emision,
        insertViaDetalles.fecha_fin,
        insertViaDetalles.tipo_cateter,
        insertViaDetalles.tamano,
        insertViaDetalles.lugar_insercion,
        insertViaDetalles.lateralidad,
        insertViaDetalles.vena_vaso,
        insertViaDetalles.uso_via,
        insertViaDetalles.perfusion,
        insertViaDetalles.fijacion_cateter,
        insertViaDetalles.numero_luces,
        insertViaDetalles.longitud_insercion,
        insertViaDetalles.marca_cateter,
        insertViaDetalles.dolor_asociado,
        insertViaDetalles.manejo_dolor,
        insertViaDetalles.accesorios,
        insertViaDetalles.educacion_sanitaria,
        insertViaDetalles.extremidad_dominante,
        insertViaDetalles.preparacion_piel,
        insertViaDetalles.observaciones,
        insertViaDetalles.ingreso_id,
        insertViaDetalles.documento_identificacion,
        insertViaDetalles.id_trabajador,
        insertViaDetalles.nombre_trabajador,
      ]
    );

    const id_via = idResult.insertId;

    // Preparar inserción para viasPaciente
    const insertViaPaciente = {
      id_via: id_via,
      fecha_emision: fecha_emision_mysql,
      fecha_fin: null, // No se proporciona fecha_fin en info
      tipo_via: viaData.tipo_cateter,
      descripcion: `Vía ${viaData.tipo_cateter} en ${viaData.lugar_insercion} (${viaData.lateralidad}, vena ${viaData.vena_vaso}), calibre ${viaData.tamano}G`,
      ingreso_id: viaData.ingreso_id,
      documento_identificacion: viaData.paciente_id,
      id_trabajador: viaData.id_trabajador,
      nombre_trabajador: viaData.nombre_trabajador,
    };

    // Insertar en viasPaciente
    const [pacienteResult] = await pool.query(
      `INSERT INTO viasPaciente (
              id_via, fecha_emision, fecha_fin, tipo_via, descripcion, ingreso_id,
              documento_identificacion, id_trabajador, nombre_trabajador
          ) VALUES (?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?), ?)`,
      [
        insertViaPaciente.id_via,
        insertViaPaciente.fecha_emision,
        insertViaPaciente.fecha_fin,
        insertViaPaciente.tipo_via,
        insertViaPaciente.descripcion,
        insertViaPaciente.ingreso_id,
        insertViaPaciente.documento_identificacion,
        insertViaPaciente.id_trabajador,
        insertViaPaciente.nombre_trabajador,
      ]
    );

    const [tipo_viaResult] = await pool.query(
      `Select tipo_via FROM Ingresados WHERE ingreso_id =?`,
      [insertViaPaciente.ingreso_id]
    );
    if (viaData.tipo_cateter === "periferica") {
      if (tipo_viaResult.tipo_via !== "VVP") {
        await pool.query(`UPDATE Ingresados SET tipo_via='VVP'`);
        const [selectPacienteIngresado] = await pool.query(
          "SELECT i.*, p.fecha_nacimiento, p.sexo FROM Ingresados i LEFT JOIN Pacientes p ON i.documento_identificacion_paciente = p.documento_identificacion WHERE i.ingreso_id = ?",
          [viaData.ingreso_id]
        );

        if (selectPacienteIngresado.length === 0) {
          throw new Error("No se encontró el ingreso asociado");
        }
        await panelResumenPaciente(
          selectPacienteIngresado[0],
          viaData.cama_id
        );
      }
    } else if (viaData.tipo_cateter === "central") {
      if (tipo_viaResult.tipo_via !== "VC") {
        await pool.query(`UPDATE Ingresados SET tipo_via='VC'`);
        const [selectPacienteIngresado] = await pool.query(
          "SELECT i.*, p.fecha_nacimiento, p.sexo FROM Ingresados i LEFT JOIN Pacientes p ON i.documento_identificacion_paciente = p.documento_identificacion WHERE i.ingreso_id = ?",
          [viaData.ingreso_id]
        );

        if (selectPacienteIngresado.length === 0) {
          throw new Error("No se encontró el ingreso asociado");
        }
        await panelResumenPaciente(
          selectPacienteIngresado[0],
          viaData.cama_id
        );
      }
    }

    // Preparar objeto de retorno
    const nuevaEntradaVia = {
      id: pacienteResult.insertId,
      id_via: insertViaPaciente.id_via,
      ingreso_id: insertViaPaciente.ingreso_id,
      documento_identificacion: insertViaPaciente.documento_identificacion,
      fecha_emision: insertViaPaciente.fecha_emision,
      fecha_fin: insertViaPaciente.fecha_fin,
      tipo_via: insertViaPaciente.tipo_via,
      descripcion: insertViaPaciente.descripcion,
      id_trabajador: insertViaPaciente.id_trabajador,
      nombre_trabajador: insertViaPaciente.nombre_trabajador,
    };

    return nuevaEntradaVia;
  } catch (error) {
    logs.error(error)
    return null;
  }
}

export async function nuevaRetirarVia(info) {
  try {
    const retiradaData = info;
    if (!retiradaData) {
      throw new Error("Faltan datos de la retirada de la vía");
    }

    // Validar campos requeridos
    // Validar campos requeridos (aceptar enfermero como nombre_trabajador si no está presente)
    const nombreTrabajador =
      retiradaData.nombre_trabajador || retiradaData.enfermero;
    if (
      !retiradaData.fecha_retirada ||
      !retiradaData.ingreso_id ||
      !retiradaData.paciente_id ||
      !retiradaData.id_trabajador ||
      !nombreTrabajador ||
      !retiradaData.id_via
    ) {
      throw new Error("Faltan datos requeridos para la retirada de la vía");
    }

    // Validar formato de fecha_retirada
    let fecha_retirada_mysql = null;
    if (retiradaData.fecha_retirada) {
      const fecha = new Date(retiradaData.fecha_retirada);
      if (!isNaN(fecha.getTime())) {
        fecha_retirada_mysql = fecha
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      } else {
        throw new Error("Fecha de retirada inválida");
      }
    } else {
      throw new Error("Fecha de retirada es requerida");
    }

    // Preparar inserción para viasRetirada
    const insertRetirada = {
      enfermero: retiradaData.enfermero || retiradaData.nombre_trabajador, // Si no se proporciona enfermero, usa nombre_trabajador
      fecha_retirada: fecha_retirada_mysql,
      motivo: retiradaData.motivo,
      cultivos: retiradaData.cultivos || null,
      observaciones: retiradaData.observaciones || null,
      ingreso_id: retiradaData.ingreso_id,
      paciente_id: retiradaData.paciente_id,
      id_trabajador: retiradaData.id_trabajador,
      id_via: retiradaData.id_via,
    };

    // Iniciar una transacción para asegurar consistencia

    try {
      // Insertar en viasRetirada
      const [result] = await pool.query(
        `INSERT INTO viasRetirada (
                  enfermero, fecha_retirada, motivo, cultivos, observaciones,
                  ingreso_id, paciente_id, id_trabajador, id_via
              ) VALUES (
                  ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?), ?
              )`,
        [
          insertRetirada.enfermero,
          insertRetirada.fecha_retirada,
          insertRetirada.motivo,
          insertRetirada.cultivos,
          insertRetirada.observaciones,
          insertRetirada.ingreso_id,
          insertRetirada.paciente_id,
          insertRetirada.id_trabajador,
          insertRetirada.id_via,
        ]
      );

      // Actualizar fecha_fin en viasDetalles
      await pool.query(
        `UPDATE viasDetalles SET fecha_fin = ? WHERE id_via = ?`,
        [fecha_retirada_mysql, insertRetirada.id_via]
      );

      // Actualizar fecha_fin en viasPaciente
      await pool.query(
        `UPDATE viasPaciente SET fecha_fin = ? WHERE id_via = ?`,
        [fecha_retirada_mysql, insertRetirada.id_via]
      );

      const [viasEnProceso] = await pool.query(
        "SELECT tipo_via FROM viasPaciente WHERE fecha_fin IS NULL AND ingreso_id = ?",
        [retiradaData.ingreso_id]
      );
      const [cama_id] = await pool.query(
        "SELECT cama_id FROM Ingresados WHERE  ingreso_id = ?",
        [retiradaData.ingreso_id]
      );

      if (viasEnProceso.length === 0) {
        //Cambiar Pnel y acualizar Ingresados
        await pool.query(
          "UPDATE Ingresados SET tipo_via='non' WHERE  ingreso_id = ?",
          [retiradaData.ingreso_id]
        );

        const [selectPacienteIngresado] = await pool.query(
          "SELECT i.*, p.fecha_nacimiento, p.sexo FROM Ingresados i LEFT JOIN Pacientes p ON i.documento_identificacion_paciente = p.documento_identificacion WHERE i.ingreso_id = ?",
          [retiradaData.ingreso_id]
        );

        if (selectPacienteIngresado.length === 0) {
          throw new Error("No se encontró el ingreso asociado");
        }
        await panelResumenPaciente(
          selectPacienteIngresado[0],
          cama_id[0].cama_id
        );
      } else {
        const [tipo_via_retirada] = await pool.query(
          "SELECT tipo_via FROM viasPaciente WHERE  id_via = ?",
          [retiradaData.id_via]
        );

        let tipo_via_parse;
        if (viasEnProceso[0].tipo_via === "central") {
          tipo_via_parse = "VC";
        } else {
          tipo_via_parse = "VVP";
        }

        if (tipo_via_parse !== viasEnProceso[0].tipo_via) {
          await pool.query(
            "UPDATE Ingresados SET tipo_via = ?  WHERE  ingreso_id = ?",
            [tipo_via_parse, retiradaData.ingreso_id]
          );
          const [selectPacienteIngresado] = await pool.query(
            "SELECT i.*, p.fecha_nacimiento, p.sexo FROM Ingresados i LEFT JOIN Pacientes p ON i.documento_identificacion_paciente = p.documento_identificacion WHERE i.ingreso_id = ?",
            [retiradaData.ingreso_id]
          );

          if (selectPacienteIngresado.length === 0) {
            throw new Error("No se encontró el ingreso asociado");
          }
          await panelResumenPaciente(
            selectPacienteIngresado[0],
            cama_id[0].cama_id
          );
        }
      }

      // Confirmar la transacción

      // Preparar objeto de retorno
      const nuevaRetirada = {
        id: result.insertId,
        enfermero: insertRetirada.enfermero,
        fecha_retirada: insertRetirada.fecha_retirada,
        motivo: insertRetirada.motivo,
        cultivos: insertRetirada.cultivos,
        observaciones: insertRetirada.observaciones,
        ingreso_id: insertRetirada.ingreso_id,
        paciente_id: insertRetirada.paciente_id,
        id_trabajador: insertRetirada.id_trabajador,
        id_via: insertRetirada.id_via,
      };

      return nuevaRetirada;
    } catch (error) {
      // Si hay un error, revertir la transacción
      throw error;
    }
  } catch (error) {
    logs.error(error)
    return null;
  }
}

export async function recuperarVariablesTest(id_del_test, ingreso_id, tipo_prueba) {
  try {
    let query, table;
    switch (tipo_prueba) {
      case "EVA":
        table = "testEva";
        query = `SELECT dolor_puntuacion, dolor_localizacion FROM ${table} WHERE ingreso_id = ? AND id = ?`;
        break;
      case "Downtown":
        table = "testDowntown";
        query = `SELECT caidas_previas, medicacion, deficiencia_sensorial, estado_mental, capacidad_movilidad FROM ${table} WHERE ingreso_id = ? AND id = ?`;
        break;
      case "Norton":
        table = "testNorton";
        query = `SELECT condicion_fisica, condicion_mental, actividad, movilidad, incontinencia FROM ${table} WHERE ingreso_id = ? AND id = ?`;
        break;
      case "Braden":
        table = "testBraden";
        query = `SELECT percepcion_sensorial, humedad, actividad, movilidad, nutricion, friccion_cizallamiento FROM ${table} WHERE ingreso_id = ? AND id = ?`;
        break;
      case "Barthel":
        table = "testBarthel";
        query = `SELECT alimentacion, baño, aseo_personal, vestirse, control_intestino, control_vejiga, uso_inodoro, transferencias, movilidad, subir_escaleras FROM ${table} WHERE ingreso_id = ? AND id = ?`;
        break;
      default:
        throw new Error(`Tipo de test no reconocido: ${tipo_prueba}`);
    }

    const [results] = await pool.query(query, [
      ingreso_id,
      id_del_test,
    ]);
    if (results.length === 0) {
      return null; // el controlador decide como responder
    }
    return results;
  } catch (error) {
    logs.error(error)
    return null;
  }
}

export async function recuperarConstantesPaciente(id_ingreso) {

  try {
    // Validate input
    const ingresoId = parseInt(id_ingreso);
    if (isNaN(ingresoId)) {
      throw new Error("Invalid ingreso_id: must be a number");
    }

    // SQL query to select all columns, converting id_trabajador to UUID
    const query = `
          SELECT 
              id,
              ingreso_id,
              paciente_id,
              BIN_TO_UUID(id_trabajador) AS id_trabajador,
              cama_id,
              historia,
              DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS fecha_emision,
              temperatura,
              tos,
              disnea,
              saturacionO2,
              frecCardiaca,
              tas,
              tad,
              frecRespiratoria,
              glucemia,
              insulinaBasal,
              insulinaRapida,
              concO2,
              oxigeno,
              dispositivos,
              peso,
              talla,
              perimetroAbdominal,
              imc,
              perdidaPeso,
              pesoIngreso,
              ingestaOral,
              aguaEndogena,
              medicacion,
              hemoderivados,
              nutricionEnteral,
              sueroterapia,
              aguaEnteral,
              sueroLavadorEntrada,
              diuresis,
              drenajes,
              sueroLavadorSalida,
              perdidasInsensibles,
              vomitosLiquidos,
              nefrostomiaDerecha,
              nefrostomiaIzquierda,
              ureteralDerecha,
              ureteralIzquierda,
              cistotomia,
              pvc,
              dolor,
              micciones,
              deposiciones,
              vomitos,
              cambioPostural,
              aspiracionGastrica,
              frecCardiacaAcum,
              eng,
              expectoracion,
              inr,
              valoracionIngesta
          FROM constantesPaciente
          WHERE ingreso_id = ?
      `;

    // Execute the query
    const [rows] = await pool.query(query, [ingresoId]);

    // Return null if no rows found, otherwise return the rows
    return rows;
  } catch (error) {
    logs.error(error)

    throw error; // Or return null, depending on your error handling preference
  }
}

export async function recuperarValoresConstantesGraficos(constantes, id_ingreso) {

  try {
    // Validate inputs
    if (constantes.length === 0) {
      throw new Error("No constants provided");
    }
    if (!id_ingreso || isNaN(id_ingreso)) {
      throw new Error("Invalid ingreso_id");
    }

    const validColumns = [
      "temperatura",
      "saturacionO2",
      "frecCardiaca",
      "tas",
      "tad",
      "frecRespiratoria",
      "glucemia",
      "insulinaBasal",
      "insulinaRapida",
      "concO2",
      "oxigeno",
      "peso",
      "talla",
      "perimetroAbdominal",
      "imc",
      "perdidaPeso",
      "pesoIngreso",
      "ingestaOral",
      "aguaEndogena",
      "medicacion",
      "hemoderivados",
      "nutricionEnteral",
      "sueroterapia",
      "aguaEnteral",
      "sueroLavadorEntrada",
      "diuresis",
      "drenajes",
      "sueroLavadorSalida",
      "perdidasInsensibles",
      "vomitosLiquidos",
      "nefrostomiaDerecha",
      "nefrostomiaIzquierda",
      "ureteralDerecha",
      "ureteralIzquierda",
      "cistotomia",
      "pvc",
      "dolor",
      "micciones",
      "deposiciones",
      "vomitos",
      "cambioPostural",
      "aspiracionGastrica",
      "frecCardiacaAcum",
      "inr",
    ];

    const query = `
          SELECT 
              DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i') AS fecha,
              ${constantes}
          FROM constantesPaciente
          WHERE ingreso_id = ?
          AND fecha_emision IS NOT NULL
          ORDER BY fecha_emision ASC
      `;

    const [rows] = await pool.query(query, [id_ingreso]);
    return rows;
  } catch (error) {
    logs.error(error)
    throw error; 
  }
}

export async function recuperarTestsPaciente(id_ingreso) {
  const [testsRows] = await pool.query(
    "SELECT id ,resultado, tipo_prueba,interpretacion, id_del_test, documento_identificacion,  DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS fecha_emision, ingreso_id, BIN_TO_UUID(id_trabajador) AS id_trabajador, nombreTrabajador FROM testPaciente WHERE ingreso_id = ?",
    [id_ingreso]
  );
  return testsRows;
}

export async function recuperarBalancesPaciente(id_ingreso) {
  const [balanceRows] = await pool.query(
    "SELECT id ,entradas, salidas,balance_total, documento_identificacion,  DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS fecha_emision, ingreso_id, BIN_TO_UUID(id_trabajador) AS id_trabajador, nombre_trabajador FROM balanceResumenPaciente WHERE ingreso_id = ?",
    [id_ingreso]
  );
  return balanceRows;
}

export async function recuperarViasPaciente(ingreso_id) {
  try {
    const [rows] = await pool.query(
      `SELECT id,
          id_via,
          DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS fecha_emision,
          DATE_FORMAT(fecha_fin, '%Y-%m-%d %H:%i:%s') AS fecha_fin, 
          descripcion,
          tipo_via,
          ingreso_id,
          documento_identificacion,
          nombre_trabajador,
          BIN_TO_UUID (id_trabajador) as id_trabajador
         FROM viasPaciente 
         WHERE ingreso_id = ?`,
      [ingreso_id]
    );
    if (rows.length > 0) {
      return rows;
    } else {
      return null;
    }
  } catch (error) {
    logs.error(error)
    return null;
  }
}

export async function recuperarInfoVia(ingreso_id, id_via) {
  try {
    const [rows] = await pool.query(
      `SELECT 
          id_via,
          DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS fecha_emision,
          DATE_FORMAT(fecha_fin, '%Y-%m-%d %H:%i:%s') AS fecha_fin, 
          tipo_cateter,           
          tamano,
          lugar_insercion,
          lateralidad| vena_vaso,
          uso_via,       
          perfusion,   
          fijacion_cateter,
          numero_luces,
          longitud_insercion,
          marca_cateter,
          dolor_asociado,
          manejo_dolor,
          accesorios,
          educacion_sanitaria,
          extremidad_dominante,
          preparacion_piel,
          observaciones,
          ingreso_id,
          documento_identificacion,
          nombre_trabajador,
          BIN_TO_UUID (id_trabajador) as id_trabajador
         FROM viasDetalles
         WHERE id_via = ?`,
      [id_via]
    );
    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  } catch (error) {
    logs.error(error)
    return null;
  }
}

export async function recuperarDetallesBalance(id_balance, ingreso_id) {
  try {
    const [rows] = await pool.query(
      `SELECT id,
          ingreso_id,
          DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS fecha_emision,   
          sueroterapia,
          nutricion_parenteral,
          hemoderivados ,
          agua_endogena ,
          alimentos_liquidos ,
          formula_enteral ,
          medicacion ,
          otros_entradas ,
          diuresis,
          drenaje ,
          vomitos ,
          deposiciones ,
          aspiracion_gastrica ,
          perdidas_sensibles ,
          otros_salidas ,
          balance_total
         FROM balanceDetallesPaciente 
         WHERE id = ? AND ingreso_id = ?`,
      [id_balance, ingreso_id]
    );
    if (rows.length > 0) {
      return rows;
    } else {
      return null;
    }
  } catch (error) {
    logs.error(error)
    return null;
  }
}

export async function recuperarInfoViaMantenimientos(id_via) {
  try {
    const [rows] = await pool.query(
      `SELECT id,nombre_trabajador,DATE_FORMAT(fecha_mantenimiento, '%Y-%m-%d %H:%i:%s') AS fecha_mantenimiento,   actuacion,complicaciones,observaciones ,escala_maddox ,ingreso_id ,paciente_id ,BIN_TO_UUID(id_trabajador) AS id_trabajador FROM viasMantenimiento WHERE id_via = ?`,
      [id_via]
    );
    if (rows.length > 0) {
      return rows;
    } else {
      return null;
    }
  } catch (error) {
    logs.error(error)
    return null;
  }
}

export async function recuperarInfoViaRetirada(id_via) {
  try {
    const [rows] = await pool.query(
      `SELECT id,enfermero AS nombre_trabajador,DATE_FORMAT(fecha_retirada, '%Y-%m-%d %H:%i:%s') AS fecha_retirada,   motivo,cultivos,observaciones  ,ingreso_id ,paciente_id ,BIN_TO_UUID(id_trabajador) AS id_trabajador, id_via FROM viasRetirada WHERE id_via = ?`,
      [id_via]
    );
    if (rows.length > 0) {
      return rows;
    } else {
      return null;
    }
  } catch (error) {
    logs.error(error)
    return null;
  }
}

export async function balanceActivo(id_ingreso) {
  try {
    const [comprobacionEstadoBalanceIngreso] = await pool.query(
      "SELECT balance FROM Ingresados WHERE ingreso_id = ?",
      [id_ingreso]
    );
    return comprobacionEstadoBalanceIngreso[0].balance;
  } catch (err) {
    logs.error(err)
  }
}

export async function calcularTurno() {
  try {
    // Obtener la hora actual
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeInMinutes = hours * 60 + minutes; // Convertir a minutos para facilitar comparaciones

    // Definir rangos en minutos
    const nocheInicio = 22 * 60; // 22:00 (1320 minutos)
    const nocheFin = 7 * 60; // 07:00 (420 minutos)
    const mananaFin = 15 * 60; // 15:00 (900 minutos)

    // Determinar el turno
    if (timeInMinutes >= nocheInicio || timeInMinutes < nocheFin) {
      return "Noche";
    } else if (timeInMinutes >= nocheFin && timeInMinutes < mananaFin) {
      return "Mañana";
    } else {
      return "Tarde";
    }
  } catch (error) {
    logs.error(error)
    throw new Error("No se pudo calcular el turno");
  }
}
