/**
 * Repositorio de farmacia
 *
 * Medicacion del paciente, administraciones, inventario y pedidos a farmacia.
 *
 * Acceso a datos unicamente: no contiene logica de presentacion ni HTTP.
 */
import { pool } from "../db/pool.js";
import { logs } from "../services/logs.service.js";
import { programarNotificacionesAutomaticas } from "./comunicaciones.repository.js";

export async function buscarMedicamentosCoincidenciaNombre(cadena) {
  try {
    // Escapar el término de búsqueda, convertir a minúsculas y añadir comodines
    const searchTerm = `%${cadena.toLowerCase()}%`;

    // Consulta SQL usando LOWER para búsqueda insensible a mayúsculas
    const [rows] = await pool.query(
      "SELECT * FROM InventarioFarmacia WHERE LOWER(nombre) LIKE ?",
      [searchTerm]
    );

    return rows;
  } catch (error) {
    logs.error(error)
    throw error;
  }
}

export async function agregarMedicacion(medicacion) {
  try {
    // Validar que se recibieron datos
    if (!medicacion) {
      throw new Error("Faltan datos de la medicación");
    }

    // Validar campos requeridos
    if (
      !medicacion.nombre_medicamento ||
      !medicacion.via_administracion ||
      !medicacion.id_medicamento ||
      !medicacion.dosis ||
      !medicacion.frecuencia_horas ||
      !medicacion.fecha_inicio ||
      !medicacion.paciente_id ||
      !medicacion.medico_id ||
      !medicacion.ingreso_id
    ) {
      throw new Error("Faltan datos requeridos para la medicación");
    }

    // Validar formato de fecha_inicio
    let fecha_inicio_mysql = null;
    if (medicacion.fecha_inicio) {
      const fecha = new Date(medicacion.fecha_inicio);
      if (!isNaN(fecha.getTime())) {
        fecha_inicio_mysql = fecha.toISOString().slice(0, 10); // Formato YYYY-MM-DD
      } else {
        throw new Error("Fecha de inicio inválida");
      }
    } else {
      throw new Error("Fecha de inicio es requerida");
    }

    // Validar formato de fecha_fin (opcional)
    let fecha_fin_mysql = null;
    if (medicacion.fecha_fin) {
      const fecha = new Date(medicacion.fecha_fin);
      if (!isNaN(fecha.getTime())) {
        fecha_fin_mysql = fecha.toISOString().slice(0, 10); // Formato YYYY-MM-DD
      } else {
        throw new Error("Fecha de fin inválida");
      }
    }

    // Preparar datos para la inserción
    const insertMedicacion = {
      nombre_medicamento: medicacion.nombre_medicamento,
      via_administracion: medicacion.via_administracion,
      id_medicamento: medicacion.id_medicamento,
      dosis: medicacion.dosis,
      frecuencia_horas: parseFloat(medicacion.frecuencia_horas),
      fecha_emision: new Date().toISOString().slice(0, 10), // Usar fecha actual
      fecha_inicio: fecha_inicio_mysql,
      fecha_fin: fecha_fin_mysql,
      lote_medicamento: medicacion.lote_medicamento,
      numero_dosis: medicacion.numero_dosis
        ? parseInt(medicacion.numero_dosis)
        : null,
      paciente_id: medicacion.paciente_id,
      medico_id: medicacion.medico_id.replace(/-/g, ""), // Remover guiones del UUID
      ingreso_id: medicacion.ingreso_id,
    };

    // Insertar en MedicacionPaciente
    const [result] = await pool.query(
      `INSERT INTO MedicacionPaciente (
        nombre_medicamento, via_administracion, id_medicamento, dosis, 
        frecuencia_horas, fecha_emision, fecha_inicio, fecha_fin, numero_dosis, 
        paciente_id, medico_id, ingreso_id,lote_medicamento
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UNHEX(?), ?, ?
      )`,
      [
        insertMedicacion.nombre_medicamento,
        insertMedicacion.via_administracion,
        insertMedicacion.id_medicamento,
        insertMedicacion.dosis,
        insertMedicacion.frecuencia_horas,
        insertMedicacion.fecha_emision,
        insertMedicacion.fecha_inicio,
        insertMedicacion.fecha_fin,
        insertMedicacion.numero_dosis,
        insertMedicacion.paciente_id,
        insertMedicacion.medico_id,
        insertMedicacion.ingreso_id,
        insertMedicacion.lote_medicamento,
      ]
    );

    // Preparar objeto de retorno
    const nuevaMedicacion = {
      id_medicacion: result.insertId,
      nombre_medicamento: insertMedicacion.nombre_medicamento,
      via_administracion: insertMedicacion.via_administracion,
      id_medicamento: insertMedicacion.id_medicamento,
      dosis: insertMedicacion.dosis,
      frecuencia_horas: insertMedicacion.frecuencia_horas,
      fecha_emision: insertMedicacion.fecha_emision,
      fecha_inicio: insertMedicacion.fecha_inicio,
      fecha_fin: insertMedicacion.fecha_fin,
      numero_dosis: insertMedicacion.numero_dosis,
      paciente_id: insertMedicacion.paciente_id,
      medico_id: medicacion.medico_id, // Devolver UUID con guiones
      ingreso_id: insertMedicacion.ingreso_id,
      lote_medicamento: insertMedicacion.lote_medicamento,
    };

    return nuevaMedicacion;
  } catch (error) {
    logs.error(error)
    throw error;
  }
}

export async function actualizarMedicacion(medicacion) {
  try {
    // Validar entrada
    if (!medicacion.id_medicacion) {
      return false;
    }

    await pool.query(
      `UPDATE MedicacionPaciente 
       SET 
         via_administracion = ?, 
         dosis = ?, 
         frecuencia_horas = ?, 
         fecha_fin = ?, 
         numero_dosis = ?, 
         estado = ? 
       WHERE id_medicacion = ?`,
      [
        medicacion.via_administracion,
        medicacion.dosis,
        medicacion.frecuencia_horas,
        medicacion.fecha_fin || null,
        medicacion.numero_dosis || null,
        medicacion.estado,
        medicacion.id_medicacion,
      ]
    );

    // Confirmar transacción

    return true;
  } catch (error) {
    logs.error(error)
    return false;
  }
}

export async function recuperarMedicacionPaciente(ingreso_id) {
  try {
    // Validar ingreso_id
    if (!ingreso_id || isNaN(Number(ingreso_id))) {
      throw new Error("El ID de ingreso es inválido");
    }

    // Consultar la tabla diagnosticoPaciente
    const [rows] = await pool.query(
      `SELECT 
        id_medicacion,
        nombre_medicamento,
        frecuencia_horas,
        via_administracion,
        id_medicamento,
        dosis,
        estado,
        DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS fecha_emision,   
        DATE_FORMAT(fecha_inicio, '%Y-%m-%d %H:%i:%s') AS fecha_inicio,   
        DATE_FORMAT(fecha_fin, '%Y-%m-%d %H:%i:%s') AS fecha_fin,   
        numero_dosis,
        paciente_id,
        BIN_TO_UUID(medico_id) AS medico_id,
        ingreso_id,
        lote_medicamento
        
      FROM MedicacionPaciente
      WHERE ingreso_id = ? AND (estado ='Activa' OR estado= 'Pausada')`,
      [Number(ingreso_id)]
    );

    // Si no hay resultados, devolver null
    if (rows.length === 0) {       
      return null;
    }

    return rows;
  } catch (error) {
    logs.error(error)
    throw new Error(`Error al recuperar medicacion: ${error.message}`);
  }
}

export async function recuperarMedicacionActivaHistorialPaciente(ingreso_id) {
  try {
    // Validar ingreso_id
    if (!ingreso_id || isNaN(Number(ingreso_id))) {
      throw new Error("El ID de ingreso es inválido");
    }

    // Consultar la tabla diagnosticoPaciente
    const [rows] = await pool.query(
      `SELECT 
        id_medicacion,
        nombre_medicamento,
        frecuencia_horas,
        via_administracion,
        id_medicamento,
        dosis,
        estado,
        DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS fecha_emision,   
        DATE_FORMAT(fecha_inicio, '%Y-%m-%d %H:%i:%s') AS fecha_inicio,   
        DATE_FORMAT(fecha_fin, '%Y-%m-%d %H:%i:%s') AS fecha_fin,   
        numero_dosis,
        paciente_id,
        BIN_TO_UUID(medico_id) AS medico_id,
        ingreso_id
        
      FROM MedicacionPaciente
      WHERE ingreso_id = ? AND estado ='Finalizada'`,
      [Number(ingreso_id)]
    );

    // Si no hay resultados, devolver null
    if (rows.length === 0) {
     
      return null;
    }

    return rows;
  } catch (error) {
    logs.error(error)
    throw new Error(`Error al recuperar diagnósticos: ${error.message}`);
  }
}

export async function nuevaEntradaAdministracionMedicacion(info) {

  try {
    const { administraciones } = info;

    // Validar que haya al menos una administración
    if (
      !administraciones ||
      !Array.isArray(administraciones) ||
      administraciones.length === 0
    ) {
      throw new Error("Se requiere al menos una administración");
    }

    for (const admin of administraciones) {
      // Validar campos requeridos
      if (
        !admin.id_medicacion ||
        !admin.id_medicamento ||
        !admin.unidades_utilizadas ||
        !admin.paciente_id ||
        !admin.ingreso_id ||
        !admin.enfermero_id ||
        !admin.nombre_enfermero ||
        !admin.fecha_administracion
      ) {
        throw new Error("Faltan campos requeridos en una administración");
      }

      // Procesar y validar fecha_administracion
      let fecha_administracion_mysql = null;
      if (admin.fecha_administracion) {
        const fecha = new Date(admin.fecha_administracion);
        if (!isNaN(fecha.getTime())) {
          fecha_administracion_mysql = fecha
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");
        } else {
          throw new Error(
            `Fecha de administración inválida para id_medicacion ${admin.id_medicacion}`
          );
        }
      }

      // Preparar datos
      const params = {
        id_medicacion: parseInt(admin.id_medicacion) || null,
        id_medicamento: parseInt(admin.id_medicamento) || null,
        unidades_utilizadas: parseInt(admin.unidades_utilizadas) || null,
        paciente_id: admin.paciente_id || null,
        ingreso_id: parseInt(admin.ingreso_id) || null,
        enfermero_id: admin.enfermero_id || null,
        nombre_enfermero: admin.nombre_enfermero || null,
        notas: admin.notas || null,
        fecha_administracion: fecha_administracion_mysql,
        nombre_medicamento: admin.nombre_medicamento,
      };

      // Validar tipos y valores
      if (
        isNaN(params.id_medicacion) ||
        isNaN(params.id_medicamento) ||
        isNaN(params.unidades_utilizadas) ||
        isNaN(params.ingreso_id)
      ) {
        throw new Error(
          `Valores numéricos inválidos para id_medicacion ${admin.id_medicacion}`
        );
      }
      if (params.unidades_utilizadas < 0) {
        throw new Error(
          `unidades_utilizadas debe ser mayor que 0 para id_medicacion ${admin.id_medicacion}`
        );
      }

      const insertAdministracionesDeMedicacionPaciente = {
        id_medicacion: params.id_medicacion,
        id_medicamento: params.id_medicamento,
        unidades_utilizadas: params.unidades_utilizadas,
        paciente_id: params.paciente_id,
        ingreso_id: params.ingreso_id,
        enfermero_id: params.enfermero_id,
        nombre_enfermero: params.nombre_enfermero,
        notas: params.notas,
        fecha_administracion: params.fecha_administracion,
        nombre_medicamento: params.nombre_medicamento,
      };

      // Consulta SQL
      await pool.query(
        `
        INSERT INTO AdministracionesDeMedicacionPaciente (
          id_medicacion, id_medicamento, unidades_utilizadas, paciente_id, ingreso_id,
          enfermero_id, nombre_enfermero, notas, fecha_administracion, nombre_medicamento
        )
        VALUES (?, ?, ?, ?, ?, UUID_TO_BIN(?), ?, ?, ?, ?)
      `,
        [
          insertAdministracionesDeMedicacionPaciente.id_medicacion,
          insertAdministracionesDeMedicacionPaciente.id_medicamento,
          insertAdministracionesDeMedicacionPaciente.unidades_utilizadas,
          insertAdministracionesDeMedicacionPaciente.paciente_id,
          insertAdministracionesDeMedicacionPaciente.ingreso_id,
          insertAdministracionesDeMedicacionPaciente.enfermero_id,
          insertAdministracionesDeMedicacionPaciente.nombre_enfermero,
          insertAdministracionesDeMedicacionPaciente.notas,
          insertAdministracionesDeMedicacionPaciente.fecha_administracion,
          insertAdministracionesDeMedicacionPaciente.nombre_medicamento,
        ]
      );
      // Ejecutar la consulta

      // Actualizar stock
      await pool.query(
        "UPDATE InventarioFarmacia SET cantidad = cantidad - ? WHERE id = ?",
        [params.unidades_utilizadas, params.id_medicamento]
      );
    }

    return true;
  } catch (error) {
      logs.error(error)

    return false;
  }
}

export async function recuperarAdministracionesMedicacion(id_ingreso) {
  try {
    // Validar entrada
    const ingresoId = parseInt(id_ingreso);
    if (isNaN(ingresoId)) {
      throw new Error("Invalid ingreso_id: must be a number");
    }

    // Consulta SQL
    const query = `
      SELECT 
        id_administracion,
        id_medicacion,
        id_medicamento,
        unidades_utilizadas,
        paciente_id,
        ingreso_id,
        BIN_TO_UUID(enfermero_id) AS enfermero_id,
        nombre_enfermero,
        notas,
        DATE_FORMAT(fecha_administracion, '%Y-%m-%d %H:%i:%s') AS fecha_administracion,
        nombre_medicamento
      FROM AdministracionesDeMedicacionPaciente
      WHERE ingreso_id = ?
    `;

    // Ejecutar la consulta
    const [rows] = await pool.query(query, [ingresoId]);

    // Retornar las filas (array vacío si no hay resultados)
    return rows;
  } catch (error) {
    logs.error(error)

    return null;
  }
}

export async function nuevoPedidoFarmacia(info) {
  const { formData } = info;
  const { nombre, tipo, notas, fecha_pedido, especialidad } = formData;

  try {
    const query = `
          INSERT INTO PedidosFarmacia (nombre, tipo, notas, fecha_pedido, estado, especialidad)
          VALUES (?, ?, ?, ?, 'Pendiente', ?)
      `;
    const values = [nombre, tipo, notas, fecha_pedido, especialidad];

    const [result] = await pool.query(query, values);
    return { id: result.insertId };
  } catch (error) {
    logs.error(error)
    return null;
  }
}

export async function recuperarInventarioFarmacia(especialidad) {
  try {
    const [selectInventario] = await pool.query(
      "SELECT  id ,lote, nombre,tipo, DATE_FORMAT(fecha_caducidad, '%Y-%m-%d %H:%i:%s') AS fecha_caducidad,cantidad,DATE_FORMAT(fecha_pedido, '%Y-%m-%d %H:%i:%s') AS fecha_pedido,cantidad, ubicacion  FROM InventarioFarmacia WHERE especialidad = ?",
      [especialidad]
    );
    if (selectInventario.length !== 0) {
      return selectInventario;
    } else {
      return null;
    }
  } catch (err) {
    logs.error(err)
    return null;
  }
}

export async function recuperarPedidosFarmacia(especialidad) {
  try {
    const [selectPedidos] = await pool.query(
      "SELECT  id ,nombre,tipo,notas,estado, DATE_FORMAT(fecha_pedido, '%Y-%m-%d %H:%i:%s') AS fecha_pedido FROM PedidosFarmacia WHERE especialidad = ?",
      [especialidad]
    );
    if (selectPedidos.length !== 0) {
      return selectPedidos;
    } else {
      return null;
    }
  } catch (err) {
    logs.error(err)
    return null;
  }
}

export async function SimulacionRecibirPedidosFarmacia(especialidad) {

  const [pedidosId] = await pool.query(
    "SELECT * FROM PedidosFarmacia WHERE especialidad = ? AND estado = 'Pendiente'",
    [especialidad]
  );

  try {
    for (const pedido of pedidosId) {
      // Crear nombre de lote (LOTE + timestamp + id)
      const lote = `LOT${Date.now()}${pedido.id}`;

      // Crear cantidad de lote (100 unidades por defecto)
      const cantidad = 100;

      // Crear fecha de caducidad (2 meses desde ahora, solo para Medicamento)
      let fechaCaducidad = null;
      let fechaCaducidadStr = null;
      if (pedido.tipo === "Medicamento") {
        fechaCaducidad = new Date();
        fechaCaducidad.setMonth(fechaCaducidad.getMonth() + 2);
        fechaCaducidadStr = fechaCaducidad
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      }

      // Actualizar estado del pedido a Completado
      await pool.query(
        "UPDATE PedidosFarmacia SET estado = 'Completado' WHERE id = ?",
        [pedido.id]
      );

      // Insertar en InventarioFarmacia
      await pool.query(
        `INSERT INTO InventarioFarmacia 
         (lote, nombre, tipo, cantidad, fecha_caducidad, fecha_pedido, ubicacion, especialidad) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lote,
          pedido.nombre,
          pedido.tipo,
          cantidad,
          fechaCaducidadStr,
          pedido.fecha_pedido,
          `Armario A-${pedido.id}`,
          pedido.especialidad,
        ]
      );

      // Generar notificaciones solo para Medicamento
      if (pedido.tipo === "Medicamento") {
        const [selectId_receptor] = await pool.query(
          "SELECT id FROM empleados WHERE rol = 'enfermeroEncargado' AND departamento = ?",
          [especialidad]
        );

        if (selectId_receptor.length > 0) {
          // Calcular fechas de notificación (3 días y 1 día antes)
          const fechaCaducidad3diasAntesNot = new Date(fechaCaducidad);
          fechaCaducidad3diasAntesNot.setDate(fechaCaducidad.getDate() - 3);

          const fechaCaducidad1diaAntesNot = new Date(fechaCaducidad);
          fechaCaducidad1diaAntesNot.setDate(fechaCaducidad.getDate() - 1);

          // Crear contenido de las notificaciones
          const contenido3diasNot = `El lote: ${lote} caduca en 3 días: fecha de caducidad ${fechaCaducidad
            .toISOString()
            .slice(0, 10)}`;
          const contenido1diasNot = `El lote: ${lote} caduca en 1 día: fecha de caducidad ${fechaCaducidad
            .toISOString()
            .slice(0, 10)}`;

          // Insertar notificaciones para cada empleado
          for (const receptor of selectId_receptor) {
            const [insertid_1] = await pool.query(
              `INSERT INTO NotificacionesAutomaticas 
               (contenido, tipo_notificacion, id_receptor, fecha_emision) 
               VALUES (?, ?, ?, ?)`,
              [
                contenido3diasNot,
                "tipo_caducidad_3_dias_lote",
                receptor.id,
                fechaCaducidad3diasAntesNot
                  .toISOString()
                  .slice(0, 19)
                  .replace("T", " "),
              ]
            );
            await programarNotificacionesAutomaticas(
              insertid_1.insertId,
              fechaCaducidad3diasAntesNot
            );
            const [insertid_2] = await pool.query(
              `INSERT INTO NotificacionesAutomaticas 
               (contenido, tipo_notificacion, id_receptor, fecha_emision) 
               VALUES (?, ?, ?, ?)`,
              [
                contenido1diasNot,
                "tipo_caducidad_1_dias_lote",
                receptor.id,
                fechaCaducidad1diaAntesNot
                  .toISOString()
                  .slice(0, 19)
                  .replace("T", " "),
              ]
            );

            await programarNotificacionesAutomaticas(
              insertid_2.insertId,
              fechaCaducidad1diaAntesNot
            );
          }
        }
      }
    }
    return true;
  } catch (err) {
    logs.error(err)
    return false;
  }
}
