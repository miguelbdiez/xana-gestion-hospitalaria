/**
 * Repositorio de turnos
 *
 * Cuadrantes de enfermeria, turnos y solicitudes de cambio.
 *
 * Acceso a datos unicamente: no contiene logica de presentacion ni HTTP.
 */
import { pool } from "../db/pool.js";
import { logs } from "../services/logs.service.js";

export async function cargarHorarioDelMesActual(mes, especialidad) {
  const [result] = await pool.query(
    "SELECT  id, año, mes, dia,dia_semana, turno, nombre_trabajador,BIN_TO_UUID(id_empleado) AS id_empleado FROM horariosEnfermeria WHERE especialidad = ? AND mes=?",
    [especialidad, mes]
  );

  return result;
}

export async function recuperarTurnosTrabajador(id) {

  const today = new Date(); // Fecha actual, ej: 27 de marzo de 2025
  const currentYear = today.getFullYear(); // 2025
  const currentMonth = today.getMonth() + 1; // 4 (abril, porque getMonth() devuelve 0-11)
  const currentDay = today.getDate(); // 27

  // Mapeo de meses numéricos a nombres en español
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const currentMonthName = meses[currentMonth - 1]; // Nombre del mes actual, ej: "Marzo"

  // Consulta SQL ajustada
  const [result] = await pool.query(
    `SELECT id, especialidad, año, mes, dia, dia_semana, turno, nombre_trabajador, BIN_TO_UUID(id_empleado) as id_empleado
       FROM horariosEnfermeria 
       WHERE id_empleado = UUID_TO_BIN(?) 
       AND (
           año > ? 
           OR (año = ? AND (
               (mes = ? AND dia >= ?)
               OR (mes IN (
                   SELECT meses.nombre 
                   FROM (SELECT ? AS nombre, ? AS numero
                         UNION SELECT 'Enero', 1 UNION SELECT 'Febrero', 2 UNION SELECT 'Marzo', 3
                         UNION SELECT 'Abril', 4 UNION SELECT 'Mayo', 5 UNION SELECT 'Junio', 6
                         UNION SELECT 'Julio', 7 UNION SELECT 'Agosto', 8 UNION SELECT 'Septiembre', 9
                         UNION SELECT 'Octubre', 10 UNION SELECT 'Noviembre', 11 UNION SELECT 'Diciembre', 12) meses
                   WHERE meses.numero > ?
               ))
           ))
       )`,
    [
      id,
      currentYear,
      currentYear,
      currentMonthName,
      currentDay,
      currentMonthName,
      currentMonth,
      currentMonth,
    ]
  );

  return result;
}

export async function solicitarCambioDeTurno(solicitudCambio) {
  try {
    const {
      receptorIdTurno,
      receptorIdEmpleado,
      receptorDia,
      receptorTurno,
      miTurnoId,
      miIdEmpleado,
      miTurnoTexto,
      comentarios,
      receptorNombre, 
      miNombreUsuario, 
    } = solicitudCambio;
    if (receptorIdEmpleado == miIdEmpleado) {
      const respuesta = {
        success: false,
        message:
          "Error, la solicitud de cambio se ha realizado entre trunos de la misma perosna ",
      };
      return respuesta;
    }

    const [turnoDisponible] = await pool.query(
      "SELECT EXISTS (SELECT 1 FROM registrosHorarioEnfermeria WHERE id_turno_a_cambiar = ? AND contestado = 0) AS turno_pendiente;",
      [miTurnoId]
    );
    if (turnoDisponible[0].turno_pendiente === 1) {
      const respuesta = {
        success: false,
        message:
          "El turno selecionado esta pendiente de cambio por favor seleccione otro turno o anule la solicitud con el turno seleccionado",
      };
      return respuesta;
    }

    // Construir descripciones
    const descripcionTurnoSolicitado = `${receptorDia}, ${receptorTurno}`;
    const descripcionTurnoACambiar = miTurnoTexto;

    
    const query = `
        INSERT INTO registrosHorarioEnfermeria (
            id_turno_solicitado,
            id_turno_a_cambiar,
            id_empleado_receptor,
            descripcion_turno_solicitado,
            nombre_receptor,
            id_empleado_solicitante,
            descripcion_turno_a_cambiar,
            nombre_solicitante,
            comentario,
            tipo_solicitud,
            fecha_evento,
            contestado
        ) VALUES (?, ?, UUID_TO_BIN(?), ?, ?, UUID_TO_BIN(?), ?, ?, ?, 'solicitudCambio', NOW(), FALSE)
    `;

    const [result] = await pool.execute(query, [
      receptorIdTurno,
      miTurnoId,
      receptorIdEmpleado,
      descripcionTurnoSolicitado,
      receptorNombre, 
      miIdEmpleado,
      descripcionTurnoACambiar,
      miNombreUsuario, 
      comentarios,
    ]);

    return {
      success: true,
      message: "Solicitud registrada correctamente",
      id_registro: result.insertId,
    };
  } catch (error) {
    logs.error(error)
    return {
      success: false,
      message: "Error al registrar la solicitud",
      error: error.message,
    };
  }
}

export async function cargarEventosCambioHorariosEnfermeria(id, rol) {
  const [solicitudesEnviadas] = await pool.query(
    `
    SELECT 
        id_registro,
        id_turno_solicitado,
        id_turno_a_cambiar,
        BIN_TO_UUID(id_empleado_receptor) AS id_empleado_receptor,
        descripcion_turno_solicitado,
        BIN_TO_UUID(id_empleado_solicitante) AS id_empleado_solicitante,
        descripcion_turno_a_cambiar,
        comentario,
        tipo_solicitud,
        nombre_receptor,
        nombre_solicitante
    FROM registrosHorarioEnfermeria 
    WHERE id_empleado_solicitante = UUID_TO_BIN(?) 
    AND tipo_solicitud = 'solicitudCambio' 
    AND contestado = 0
`,
    [id]
  );
  const [solicitudesRecibidas] = await pool.query(
    `
    SELECT 
        id_registro,
        id_turno_solicitado,
        id_turno_a_cambiar,
        BIN_TO_UUID(id_empleado_receptor) AS id_empleado_receptor,
        descripcion_turno_solicitado,
        BIN_TO_UUID(id_empleado_solicitante) AS id_empleado_solicitante,
        descripcion_turno_a_cambiar,
        comentario,
        tipo_solicitud,
        nombre_receptor,
        nombre_solicitante
    FROM registrosHorarioEnfermeria 
    WHERE id_empleado_receptor = UUID_TO_BIN(?) 
    AND tipo_solicitud = 'solicitudCambio' 
    AND contestado = 0
`,
    [id]
  );

  // Consulta para registros de eventos (confirmaciones o rechazos)
  let registrosEventos = [];
  if (rol === "enfermeroEncargado") {
    [registrosEventos] = await pool.query(
      `
        SELECT 
            id_registro,
            nombre_receptor,
            nombre_solicitante,
            id_turno_solicitado,
            id_turno_a_cambiar,
            BIN_TO_UUID(id_empleado_receptor) AS id_empleado_receptor,
            descripcion_turno_solicitado,
            BIN_TO_UUID(id_empleado_solicitante) AS id_empleado_solicitante,
            descripcion_turno_a_cambiar,
            comentario,
            DATE_FORMAT(fecha_evento, '%Y-%m-%d %H:%i:%s') AS fecha_evento,
            tipo_solicitud
        FROM registrosHorarioEnfermeria `,

      [id, id]
    );
  } else {
    [registrosEventos] = await pool.query(
      `
        SELECT 
            id_registro,
            nombre_receptor,
            nombre_solicitante,
            id_turno_solicitado,
            id_turno_a_cambiar,
            BIN_TO_UUID(id_empleado_receptor) AS id_empleado_receptor,
            descripcion_turno_solicitado,
            BIN_TO_UUID(id_empleado_solicitante) AS id_empleado_solicitante,
            descripcion_turno_a_cambiar,
            comentario,
            DATE_FORMAT(fecha_evento, '%Y-%m-%d %H:%i:%s') AS fecha_evento,
            tipo_solicitud
        FROM registrosHorarioEnfermeria 
        WHERE (id_empleado_solicitante = UUID_TO_BIN(?) OR id_empleado_receptor = UUID_TO_BIN(?))
        AND tipo_solicitud IN ('confirmacionCambio', 'rechazoCambio')
    `,
      [id, id]
    );
  }

  const respuesta = {
    solicitudesEnviadas: solicitudesEnviadas,
    solicitudesRecibidas: solicitudesRecibidas,
    registrosEventos: registrosEventos,
  };

  return respuesta;
}

export async function accionCambioDeTurno(solicitudData) {
  const {
    id_registro,
    id_turno_solicitado,
    id_turno_a_cambiar,
    id_empleado_receptor,
    descripcion_turno_solicitado,
    nombre_receptor,
    id_empleado_solicitante,
    descripcion_turno_a_cambiar,
    nombre_solicitante,
    comentario,
    fecha_evento,
    contestado,
    tipo_solicitud,
  } = solicitudData;

  if (tipo_solicitud == "confirmacionCambio") {
    const queryActualizarEstado =
      "UPDATE registrosHorarioEnfermeria SET contestado = 1 WHERE id_registro =?";
    await pool.query(queryActualizarEstado, [id_registro]);
    const queryCambioTurnoSolicitado =
      "UPDATE horariosEnfermeria SET id_empleado = UUID_TO_BIN(?), nombre_trabajador= ? WHERE id =?";
    await pool.query(queryCambioTurnoSolicitado, [
      id_empleado_solicitante,
      nombre_solicitante,
      id_turno_solicitado,
    ]);
    const queryCambioTurnoPorpuestoParaElCambio =
      "UPDATE horariosEnfermeria SET id_empleado = UUID_TO_BIN(?), nombre_trabajador= ? WHERE id =?";
    await pool.query(queryCambioTurnoPorpuestoParaElCambio, [
      id_empleado_receptor,
      nombre_receptor,
      id_turno_a_cambiar,
    ]);

    const queryAñadirEntrada = `
  INSERT INTO registrosHorarioEnfermeria (
      id_turno_solicitado,
      id_turno_a_cambiar,
      id_empleado_receptor,
      descripcion_turno_solicitado,
      nombre_receptor,
      id_empleado_solicitante,
      descripcion_turno_a_cambiar,
      nombre_solicitante,
      comentario,
      tipo_solicitud,
      fecha_evento,
      contestado
  ) VALUES (?, ?, UUID_TO_BIN(?), ?, ?, UUID_TO_BIN(?), ?, ?, ?, 'confirmacionCambio', NOW(), 1)
`;

    await pool.execute(queryAñadirEntrada, [
      id_turno_solicitado, 
      id_turno_a_cambiar, 
      id_empleado_receptor, 
      descripcion_turno_solicitado, 
      nombre_solicitante,
      id_empleado_solicitante, 
      descripcion_turno_a_cambiar, 
      nombre_receptor ,
      comentario === "Sin comentarios" ? null : comentario, 
    ]);
    const respuesta = {
      success: true,
    };
    return respuesta;
  } else if (tipo_solicitud == "rechazoCambio") {
    const queryActualizarEstado =
      "UPDATE registrosHorarioEnfermeria SET contestado = 1 WHERE id_registro =?";
    await pool.query(queryActualizarEstado, [id_registro]);

    const queryAñadirEntrada = `
    INSERT INTO registrosHorarioEnfermeria (
        id_turno_solicitado,
        id_turno_a_cambiar,
        id_empleado_receptor,
        descripcion_turno_solicitado,
        nombre_receptor,
        id_empleado_solicitante,
        descripcion_turno_a_cambiar,
        nombre_solicitante,
        comentario,
        tipo_solicitud,
        fecha_evento,
        contestado
    ) VALUES (?, ?, UUID_TO_BIN(?), ?, ?, UUID_TO_BIN(?), ?, ?, ?, 'rechazoCambio', NOW(), 1)
`;

    await pool.execute(queryAñadirEntrada, [
      id_turno_solicitado, 
      id_turno_a_cambiar, 
      id_empleado_receptor, 
      descripcion_turno_solicitado,
      nombre_receptor, 
      id_empleado_solicitante, 
      descripcion_turno_a_cambiar, 
      nombre_solicitante, 
      comentario === "Sin comentarios" ? null : comentario, 
    ]);
    const respuesta = {
      success: true,
    };
    return respuesta;
  } else if (tipo_solicitud == "anularCambio") {
    const queryActualizarEstado =
      "UPDATE registrosHorarioEnfermeria SET contestado = 1 WHERE id_registro =?";
    await pool.query(queryActualizarEstado, [id_registro]);

    const queryAñadirEntrada = `
    INSERT INTO registrosHorarioEnfermeria (
        id_turno_solicitado,
        id_turno_a_cambiar,
        id_empleado_receptor,
        descripcion_turno_solicitado,
        nombre_receptor,
        id_empleado_solicitante,
        descripcion_turno_a_cambiar,
        nombre_solicitante,
        comentario,
        tipo_solicitud,
        fecha_evento,
        contestado
    ) VALUES (?, ?, UUID_TO_BIN(?), ?, ?, UUID_TO_BIN(?), ?, ?, ?, 'anularCambio', NOW(), 1)
`;

    await pool.execute(queryAñadirEntrada, [
      id_turno_solicitado,
      id_turno_a_cambiar, 
      id_empleado_receptor, 
      descripcion_turno_solicitado, 
      nombre_receptor,
      id_empleado_solicitante, 
      descripcion_turno_a_cambiar,
      nombre_solicitante, 
      comentario === "Sin comentarios" ? null : comentario, // 9: TEXT o NULL
    ]);
    const respuesta = {
      success: true,
    };
    return respuesta;
  }
  return;
}

export async function comprobarHorarioExiste(mes, año) {
  
  const [result] = await pool.query(
    "SELECT COUNT(*) as count FROM horariosEnfermeria WHERE mes = ? AND año = ?",
    [mes, año]
  );
  if (result[0].count > 0) {
    // Cambié > 1 a > 0, asumiendo que quieres verificar si existe al menos un registro
    return { success: true };
  } else {
    return { success: false };
  }
}

export async function confirmarHorario(horarioConfirmado, especialidad) {
  if (!horarioConfirmado || !Array.isArray(horarioConfirmado)) {
    return { success: false, message: "No se proporcionó un horario válido" };
  }
  try {
    for (const turno of horarioConfirmado) {
      await pool.query(
        `INSERT INTO horariosEnfermeria (especialidad,año, mes, dia, turno, nombre_trabajador, id_empleado, dia_semana) 
         VALUES (?,?, ?, ?, ?, ?, UUID_TO_BIN(?), ?)`,
        [
          especialidad,
          turno.año,
          turno.mes,
          turno.dia,
          turno.turno,
          turno.nombre_trabajador,
          turno.id_empleado,
          turno.dia_semana,
        ]
      );
    }
    return { success: true, message: "Horario confirmado exitosamente" };
  } catch (error) {
    logs.error(error)
    return { success: false, message: "Error al confirmar el Horario" };
  }
}

export async function actualizarCalendario(especialidad, mes, año) {
  const [result] = await pool.query(
    "SELECT  id, año, mes, dia,dia_semana, turno, nombre_trabajador,BIN_TO_UUID(id_empleado) AS id_empleado FROM horariosEnfermeria WHERE especialidad = ? AND mes=? AND año=?",
    [especialidad, mes, año]
  );
  if (result.length > 0) {
    const respuesta = {
      success: true,
      turnos: result,
    };
    return respuesta;
  } else {
    const respuesta = {
      success: false,
      message: "horario No disponible ",
    };
    return respuesta;
  }
}
