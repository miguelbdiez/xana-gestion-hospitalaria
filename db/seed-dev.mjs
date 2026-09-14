/**
 * Crea empleados de prueba para poder entrar en la aplicación en desarrollo.
 *
 * Uso:
 *   node db/seed-dev.mjs
 *
 * Sólo inserta usuarios que no existan ya, así que se puede ejecutar varias
 * veces sin duplicar nada. No usar contra una base de datos real.
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { pool } from "../src/db/pool.js";

const CONTRASENA = process.env.SEED_PASSWORD ?? "Prueba1234";

const EMPLEADOS = [
  { dni: "00000001A", nombre: "Ana", rol: "medico", departamento: "Cardiologia" },
  { dni: "00000002B", nombre: "Bruno", rol: "enfermero", departamento: "Cardiologia" },
  { dni: "00000003C", nombre: "Carla", rol: "enfermeroEncargado", departamento: "Cardiologia" },
  { dni: "00000004D", nombre: "Diego", rol: "secretario", departamento: "Admision" },
  { dni: "00000005E", nombre: "Elena", rol: "administrador", departamento: "Sistemas" },
];

// El hospital y las especialidades son datos de catálogo: los empleados tienen
// una clave ajena contra `Especialidad`, así que deben existir antes.
const HOSPITAL = "Hospital Xana";
const ESPECIALIDADES = [
  { especialidad: "Cardiologia", ubicacion: "Planta 3, ala norte", camas: 20 },
  { especialidad: "Admision", ubicacion: "Planta baja", camas: 0 },
  { especialidad: "Sistemas", ubicacion: "Sotano", camas: 0 },
];

await pool.query("INSERT IGNORE INTO Hospital (nombre) VALUES (?)", [HOSPITAL]);
for (const e of ESPECIALIDADES) {
  await pool.query(
    `INSERT IGNORE INTO Especialidad (especialidad, ubicacion, numero_camas, nombreHospital)
     VALUES (?, ?, ?, ?)`,
    [e.especialidad, e.ubicacion, e.camas, HOSPITAL]
  );
}
console.log(`Catálogo listo: ${ESPECIALIDADES.length} especialidades en ${HOSPITAL}\n`);

const hash = await bcrypt.hash(CONTRASENA, 10);
let creados = 0;

for (const emp of EMPLEADOS) {
  const [existe] = await pool.query("SELECT 1 FROM empleados WHERE dni = ?", [emp.dni]);
  if (existe.length) {
    console.log(`  ya existe  ${emp.dni}  ${emp.rol}`);
    continue;
  }

  await pool.query(
    `INSERT INTO empleados
       (id, dni, nombre, apellido1, apellido2, telefono, rol, hashContraseña,
        departamento, especialidad, correo_electronico, numero_de_cuenta, estado)
     VALUES (UUID_TO_BIN(UUID()), ?, ?, 'Apellido', 'Apellido', '600000000', ?, ?,
             ?, ?, ?, 'ES0000000000000000000000', 0)`,
    [
      emp.dni,
      emp.nombre,
      emp.rol,
      hash,
      emp.departamento,
      emp.departamento,
      `${emp.nombre.toLowerCase()}@ejemplo.local`,
    ]
  );
  creados++;
  console.log(`  creado     ${emp.dni}  ${emp.rol.padEnd(20)} ${emp.departamento}`);
}

console.log(`\n${creados} empleados creados. Contraseña para todos: ${CONTRASENA}`);
await pool.end();
