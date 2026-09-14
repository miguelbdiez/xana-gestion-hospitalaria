/**
 * Repositorio de auth
 *
 * Autenticacion de empleados, alta de usuarios y recuperacion de contrasena.
 *
 * Acceso a datos unicamente: no contiene logica de presentacion ni HTTP.
 */
import { pool } from "../db/pool.js";
import { logs } from "../services/logs.service.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sender, REMITENTE } from "../services/email.service.js";
import { SALT, IP_SERVIDOR, CONFIG_EMAIL } from "../config/index.js";

export async function inicioSesion({ usuario, contraseña }) {

  try {
    const [result] = await pool.query(
      "SELECT BIN_TO_UUID(id) AS id, nombre, apellido1, apellido2, telefono, rol, hashContraseña, dni, departamento, correo_electronico FROM empleados WHERE dni = ?",
      [usuario]
    );

    if (result.length === 0) {
      const respuesta = {
        success: false,
        message: " El ususario o contraseña son incorrectos",
      };
      const momentoInicioSesion = new Date().toLocaleString();
      const entrada = `REGISTRO FAILED USER NOT EXISTS (${usuario})| ha intentado iniciar sesión a las ${momentoInicioSesion} \n`;

      logs.login(entrada);
      return respuesta;
    } else {
      const esValido = await bcrypt.compare(
        contraseña,
        result[0].hashContraseña
      );
      if (esValido == false) {
        const momentoInicioSesion = new Date().toLocaleString();
        const entrada = `REGISTRO FAILED INCORRECT PASSWORD | Usuario: ${result[0].nombre} ${result[0].apellido_paterno} ${result[0].apellido_materno} ha intentado iniciar sesión a las ${momentoInicioSesion} \n`;

        logs.login(entrada);

        const respuesta = {
          success: false,
          message: " El ususario o contraseña son incorrectos",
        };
        return respuesta;
      }
      const momentoInicioSesion = new Date().toLocaleString();

      if(result[0].rol =="administrador"){
        await sender.sendMail({
          from: REMITENTE,
          to: result[0].correo_electronico,
          subject: "Inicio De Sesión",
          html: `<p>Se ha iniciado Sesion en su cuenta de Xana Industries a las ${momentoInicioSesion}</p>
                  <p>Si no ha sido usted, restee la contraseña de inmediato o pongase en contacto con el servicio técnico de XanaIndustries</p>
                  <p>Un saludo,</p>`,
        });
      }

      const entrada = `REGISTRO SUCCESS | Usuario: ${result[0].nombre} ${result[0].apellido1} ${result[0].apellido2} ha iniciado sesión a las ${momentoInicioSesion} \n`;
      await pool.query("UPDATE empleados SET estado = 1  WHERE dni = ?", [
        usuario,
      ]);
      logs.login(entrada);

      const respuesta = {
        success: true,
        id: result[0].id,
        rol: result[0].rol,
        especialidad: result[0].departamento,
        nombre:
          result[0].nombre +
          " " +
          result[0].apellido1 +
          " " +
          result[0].apellido2,
        correo_electronico: result[0].correo_electronico,
      };
      return respuesta;
    }
    
  } catch (error) {
    logs.error(error)            
  }
    
}

export async function recuperarContrasena(documento_identificacion) {

  try {

    const [result] = await pool.query(
      "SELECT BIN_TO_UUID(id) AS id, correo_electronico, CONCAT(nombre, ' ', apellido1, ' ', apellido2) AS nombre FROM empleados WHERE dni= ?",
      [documento_identificacion]
    );

    if (result.length === 0) {
      const respuesta = {
        success: false,
        message: " El ususario o contraseña son incorrectos",
      };
      return respuesta;
    }

    //generamos un token seguro que expirara en 10 mins
    const tokenRecuperacion = jwt.sign(
      {
        id: result[0].id,
        correo_electronico: result[0].correo_electronico,
        nombre: result[0].nombre,
      },
      CONFIG_EMAIL.EMAIL_SECRET_KEY,
      { expiresIn: "10m" }
    );

    const enlaceRecuperar = `https://${IP_SERVIDOR}/resetearContrasena?t=${tokenRecuperacion}`;

    await sender.sendMail({
      from: REMITENTE,
      to: result[0].correo_electronico,
      subject: "Recuperar Contraseña",
      html: `<p>Haz clic en el botón para restablecer tu contraseña:</p>
              <a href="${enlaceRecuperar}" style="display:inline-block; padding:10px 20px; font-size:16px; color:white; background-color:#007bff; text-decoration:none; border-radius:5px;">
                  Restablecer Contraseña
              </a>
              <p>O accede al siguiente enlace:</p>
              <p>${enlaceRecuperar}</p>`,
    });
    return {
      correo_electronico: result[0].correo_electronico,
      token: tokenRecuperacion,
    };
    
  } catch (error) {
    logs.error(error)      
  }
  
}

export async function verificarExistenciaEmpleado(documento_identificacion) {

  try {
    const [result] = await pool.query(
      "SELECT BIN_TO_UUID(id) AS id FROM empleados WHERE dni = ?",
      [documento_identificacion]
    );

    let respuesta = "";
    if (result.length === 0) {
      respuesta = {
        success: false,
        message: " El ususario o contraseña son incorrectos",
      };
    } else {
      respuesta = {
        success: true,
        message: " El ususario o contraseña son correctos",
      };
    }

    return respuesta;
    
  } catch (error) {
    logs.error(error)      
  }
 
}

export async function registroUsuario(infoUsuario){

  try{
  
    const [result] = await pool.query(
    "SELECT dni FROM empleados WHERE dni = ?",
    [infoUsuario.dni]
    );

    if (result.length === 0) {
      // El usuario ya esta registrado

      const id = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(infoUsuario.password, SALT);
      await pool.query(
        `INSERT INTO empleados 
                (id, hashContraseña, dni, nombre, apellido1, apellido2, correo_electronico, telefono, numero_seguridad_social, rol, direccion, departamento, numero_de_cuenta, fecha_nacimiento) 
                VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, passwordHash, infoUsuario.dni,infoUsuario.nombre, infoUsuario.apellido1, infoUsuario.apellido2,
          infoUsuario.correo_electronico, infoUsuario.telefono, infoUsuario.numero_seguridad_social, infoUsuario.rol, 
          infoUsuario.direccion, infoUsuario.especialidad, infoUsuario.numero_de_cuenta, infoUsuario.fecha_nacimiento,
        ]
      );

      if (infoUsuario.rol == "medico") {
        await pool.query(
          `INSERT INTO Medicos 
                (id, nombre, apellido1, apellido2, departamento) 
                VALUES (UUID_TO_BIN(?), ?, ?, ?, ?)`,
          [id, infoUsuario.nombre, infoUsuario.apellido1, infoUsuario.apellido2, infoUsuario.departamento]
        );
      }
      
      return true;
    } else {
      return { success: false, message: "El USUARIO ya está registrado." };
    }

  }catch (err) {
    logs.error(err)
    return false
  }
  

}

/**
 * Fija una nueva contrasena para el empleado indicado.
 *
 * La version original no esperaba al UPDATE, de modo que devolvia exito antes
 * de que la escritura se hubiese completado y perdia cualquier error.
 */
export async function resetearContrasena(nuevaContrasena, id) {
  try {
    const hash = await bcrypt.hash(nuevaContrasena, SALT);

    const [resultado] = await pool.query(
      "UPDATE empleados SET hashContraseña = ? WHERE id = UUID_TO_BIN(?)",
      [hash, id]
    );

    if (resultado.affectedRows === 0) {
      return { success: false, message: "No existe el usuario indicado" };
    }

    return { success: true };
  } catch (error) {
    logs.error(error);
    return { success: false, message: "No se pudo actualizar la contraseña" };
  }
}
