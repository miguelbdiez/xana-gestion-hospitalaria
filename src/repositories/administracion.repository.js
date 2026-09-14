/**
 * Repositorio de administracion
 *
 * Gestion de empleados, estadisticas, copias de seguridad y manuales.
 *
 * Acceso a datos unicamente: no contiene logica de presentacion ni HTTP.
 */
import { pool } from "../db/pool.js";
import { logs } from "../services/logs.service.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import fileS from "fs";
import { spawn } from "child_process";
import { CONFIG_DATABASE } from "../config/index.js";
import { subirAGoogleDrive } from "../services/backup.service.js";

// Raiz del proyecto: este fichero vive en src/repositories/
const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export async function recuperarEmpleadosHospital(){
  try{
    const [empleados] = await pool.query("SELECT BIN_TO_UUID(id) AS id, CONCAT(nombre, ' ', apellido1, ' ', apellido2) AS empleado_nombre_completo, departamento, rol FROM empleados")
    if(empleados.length<0){
      return null;
    }

    return empleados

  }catch (error) {
    logs.error(error)
    return null
  }

}

export async function recuperarInformacionEmpleado(id){
  try{
    const [infoEmpleado] = await pool.query("SELECT BIN_TO_UUID(id) AS id, nombre, apellido1, apellido2, rol, telefono, correo_electronico, direccion, departamento,numero_seguridad_social,numero_de_cuenta, fecha_nacimiento, dni  FROM empleados WHERE id = UUID_TO_BIN(?)",[id])
    if(infoEmpleado.length<0){
      return null;
    }

    return infoEmpleado

  }catch (error) {
    logs.error(error)
    return null
  }

}

export async function actualizarEspecialidadEmpleado(id, nuevaEspecialidad){
  try{
    const [select] =  await pool.query("SELECT rol from empleados WHERE id = UUID_TO_BIN(?)", [id])
    if(select[0].rol ==="medico"){
      await pool.query("UPDATE Medicos SET departamento = ? WHERE id = UUID_TO_BIN(?)", [nuevaEspecialidad, id])
    }
    return true
  }catch (err) {
    logs.error(err)
    return false
  }
}

export async function actualizarInformacionEmpleado(nuevaInfoEmpleado){
  try{
    if(!nuevaInfoEmpleado){
      return false
    }
    
    await pool.query("UPDATE empleados SET telefono = ?,  correo_electronico = ?, direccion = ?,numero_seguridad_social = ?, numero_de_cuenta = ? WHERE id = UUID_TO_BIN(?)",
       [nuevaInfoEmpleado.telefono,nuevaInfoEmpleado.correo_electronico, nuevaInfoEmpleado.direccion, nuevaInfoEmpleado.numero_seguridad_social,nuevaInfoEmpleado.numero_de_cuenta, nuevaInfoEmpleado.id])
    return true
  }catch (err) {
    logs.error(err)
    return false
  }
}

export async function recuperarInfoEstadisticas() {
  try {
    // Consulta para ocupación total
    const [totalCamas] = await pool.query(
      `SELECT 
        SUM(ocupada = 1) AS ocupadas,
        SUM(ocupada = 0) AS libres
       FROM Camas`
    );

    // Consulta para ocupación por especialidad
    const [camasPorEspecialidad] = await pool.query(
      `SELECT 
        especialidad,
        SUM(ocupada = 1) AS ocupadas,
        SUM(ocupada = 0) AS libres,
        SUM(bloqueado = 1) AS bloqueadas
       FROM Camas
       GROUP BY especialidad`
    );

    // Consulta para lista de especialidades
    const [especialidadesResult] = await pool.query(
      `SELECT DISTINCT especialidad 
       FROM Camas 
       WHERE especialidad IS NOT NULL`
    );

    // Consulta para ingresos por mes
    const [ingresosPorMes] = await pool.query(
      `SELECT 
        DATE_FORMAT(fecha_ini, '%Y-%m') AS mes,
        COUNT(*) AS cantidad
       FROM Ingresados
       WHERE fecha_ini IS NOT NULL
       GROUP BY DATE_FORMAT(fecha_ini, '%Y-%m')
       ORDER BY mes`
    );

    // Consulta para altas por mes
    const [altasPorMes] = await pool.query(
      `SELECT 
        DATE_FORMAT(fecha_alta, '%Y-%m') AS mes,
        COUNT(DISTINCT ingreso_id) AS cantidad
       FROM AltasMedicas
       WHERE fecha_alta IS NOT NULL
       GROUP BY DATE_FORMAT(fecha_alta, '%Y-%m')
       ORDER BY mes`
    );

    // Consulta para ingresos por especialidad
    const [ingresosPorEspecialidad] = await pool.query(
      `SELECT 
        especialidad,
        COUNT(*) AS cantidad
       FROM Ingresados
       GROUP BY especialidad`
    );

    // Consulta para altas por especialidad
    const [altasPorEspecialidad] = await pool.query(
      `SELECT 
        i.especialidad,
        COUNT(DISTINCT a.ingreso_id) AS cantidad
       FROM AltasMedicas a
       JOIN Ingresados i ON a.ingreso_id = i.ingreso_id
       GROUP BY i.especialidad`
    );
    const [diagnosticosFrecuentes] = await pool.query(
      `SELECT 
        descripcion,
        COUNT(*) AS cantidad
       FROM diagnosticoPaciente
       WHERE descripcion IS NOT NULL
       GROUP BY descripcion
       ORDER BY cantidad DESC
       LIMIT 5`
    );

    // Consulta para ingresos por mes por médico
    const [ingresosPorMedicoMes] = await pool.query(
      `SELECT 
        i.medico_nombre_completo AS medico,
        DATE_FORMAT(i.fecha_ini, '%Y-%m') AS mes,
        COUNT(*) AS cantidad
       FROM Ingresados i
       WHERE i.fecha_ini IS NOT NULL
       GROUP BY i.medico_nombre_completo, DATE_FORMAT(i.fecha_ini, '%Y-%m')
       ORDER BY mes, medico`
    );

    // Devolver objeto con resultados
    return {
      ocupacionTotal: {
        ocupadas: parseInt(totalCamas[0].ocupadas) || 0,
        libres: parseInt(totalCamas[0].libres) || 0
      },
      ocupacionPorEspecialidad: camasPorEspecialidad.map(row => ({
        especialidad: row.especialidad || 'Sin Especialidad',
        ocupadas: parseInt(row.ocupadas) || 0,
        libres: parseInt(row.libres) || 0,
        bloqueadas: parseInt(row.bloqueadas) || 0
      })),
      especialidades: especialidadesResult.map(row => row.especialidad),
      ingresosPorMes: ingresosPorMes.map(row => ({
        mes: row.mes,
        cantidad: parseInt(row.cantidad) || 0
      })),
      altasPorMes: altasPorMes.map(row => ({
        mes: row.mes,
        cantidad: parseInt(row.cantidad) || 0
      })),
      ingresosPorEspecialidad: ingresosPorEspecialidad.map(row => ({
        especialidad: row.especialidad || 'Sin Especialidad',
        cantidad: parseInt(row.cantidad) || 0
      })),
      altasPorEspecialidad: altasPorEspecialidad.map(row => ({
        especialidad: row.especialidad || 'Sin Especialidad',
        cantidad: parseInt(row.cantidad) || 0
      })),
      diagnosticosFrecuentes: diagnosticosFrecuentes.map(row => ({
        descripcion: row.descripcion,
        cantidad: parseInt(row.cantidad) || 0
      })),
      ingresosPorMedicoMes: ingresosPorMedicoMes.map(row => ({
        medico: row.medico,
        mes: row.mes,
        cantidad: parseInt(row.cantidad) || 0
      }))
    };
  } catch (error) {
    logs.error(error)
    return null;
  }
}

export async function recuperarCopiasDeSeguridad(){
  try{
    const [copiasDeSeguridad] = await pool.query("SELECT  id, nombre, ubicacion,DATE_FORMAT(fecha_creacion, '%Y-%m-%d %H:%i:%s') AS fecha_creacion  FROM copiasDeSeguridad")
    if(copiasDeSeguridad.length<0){
      return null;
    }

    return copiasDeSeguridad

  }catch (error) {
    logs.error(error)
    return null
  }

}

export async function hacerCopiaDeSeguridad() {
  try {
    // Directorio donde se guardarán los respaldos
    const backupDir = path.join(process.cwd(), 'copiasDeSeguridad');

    // Formato de fecha para el nombre del archivo
    const now = new Date();
    const fechaFormateada = now.toISOString().slice(0, 19).replace('T', ' ').replace(/:/g, '-');
    const nombreArchivo = `copiaDeSeguridad_${fechaFormateada}.sql`;
    const backupFile = path.join(backupDir, nombreArchivo);

    // Fecha para la base de datos (formato MySQL)
    const fechaCreacionMysql = now.toISOString().slice(0, 19).replace('T', ' ');

    // Crear directorio de respaldos si no existe
    await fs.mkdir(backupDir, { recursive: true });

    // Configurar el comando mysqldump usando spawn
    const mysqldump = spawn('mysqldump', [
      `-h${CONFIG_DATABASE.host}`,
      `-u${CONFIG_DATABASE.user}`,
      `-p${CONFIG_DATABASE.password}`,
      CONFIG_DATABASE.database
    ]);

    // Crear un flujo de escritura para el archivo de respaldo
    const writeStream = fileS.createWriteStream(backupFile);

    // Redirigir la salida de mysqldump al archivo
    mysqldump.stdout.pipe(writeStream);

    // Manejar errores de mysqldump
    let stderr = '';
    mysqldump.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Esperar a que el proceso termine
    await new Promise((resolve, reject) => {
      mysqldump.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`mysqldump salió con código ${code}: ${stderr}`));
        }
        resolve();
      });
      mysqldump.on('error', reject);
      writeStream.on('error', reject);
    });

    // Verificar quebonne el archivo de respaldo existe y no está vacío
    const stats = await fs.stat(backupFile);
    if (stats.size === 0) {
      throw new Error('El archivo de respaldo está vacío');
    }

    // Insertar registro en la tabla copiasDeSeguridad
    const query = `
      INSERT INTO copiasDeSeguridad (nombre, fecha_creacion, ubicacion)
      VALUES (?, ?, ?)
    `;
    await pool.execute(query, [nombreArchivo, fechaCreacionMysql, backupFile]);
    await subirAGoogleDrive(backupFile, nombreArchivo);

   
    return true;
  } catch (error) {
    logs.error(error)
    return false;
  }
}

export async function recuperarManualDeUsuario(rol){

  let pdf;

  if(rol==="administrador"){
     pdf = path.join(__dirname,"public/manuales/Manual de Usuario - Administrador.pdf"); 
  }else if(rol==="medico"){
    pdf = path.join(__dirname,"public/manuales/Manual de Usuario - Médico.pdf"); 

  }else if(rol==="enfermero"){
    pdf = path.join(__dirname,"public/manuales/Manual de Usuario - Enfermero.pdf"); 

  }else if(rol==="enfermeroEncargado"){
    pdf = path.join(__dirname,"public/manuales/Manual de Usuario - Enfermero Encargado.pdf")

  }else{
    pdf = path.join(__dirname,"public/manuales/Manual de Usuario - Secretario.pdf")
  }

  

  return pdf;

  
}
