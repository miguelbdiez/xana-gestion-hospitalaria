/**
 * Controlador de auth
 *
 * Inicio y cierre de sesion, alta de usuarios y recuperacion de contrasena.
 *
 * Los manejadores asumen que ya han pasado por `requireAuth`, de modo que
 * `req.usuario` esta disponible, y por `cargarContextoUsuario` cuando la
 * pantalla necesita la barra lateral de chat y notificaciones.
 */

import jwt from "jsonwebtoken";
import { inicioSesion, recuperarContrasena, registroUsuario, resetearContrasena as resetearContrasenaRepo, verificarExistenciaEmpleado } from "../repositories/auth.repository.js";
import { cargarEspecialidades } from "../repositories/ingresos.repository.js";
import { logs } from "../services/logs.service.js";
import { CONFIG_EMAIL } from "../config/index.js";
import { firmarToken, OPCIONES_COOKIE, NOMBRE_COOKIE } from "../middleware/auth.js";
export const cerrarSesion = async (req, res) => {
  // La version original solo mostraba la pantalla de login: la cookie de
  // sesion seguia siendo valida, asi que en la practica no se cerraba nada.
  res.clearCookie(NOMBRE_COOKIE, { ...OPCIONES_COOKIE, maxAge: undefined });
  return res.render("login");
};

export const home = async (req, res) => {
  const data = req.usuario;

      try {


        const info = {
      ...res.locals.contexto,
        };

        switch (data.rol) {
          case "administrador":
            return res.render("administrador/homeAdministrador", { info });

          case "medico":
            return res.render("medico/homeMedico", { info });

          case "enfermeroEncargado":
            return res.render("enfermeriaEncargado/homeEnfermeroEncargado.ejs", { info });

          case "enfermero":
            return res.render("enfermeria/homeEnfermero.ejs", { info });

          case "secretario":
            return res.render("secretaria/homeSecretario.ejs", { info });

          default:
            res.status(403).send("Usuario No autorizado");

        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Ocurrio un error al conectar con el servidor");

      }
};


export const resetearContrasena = async (req, res) => {
  const data = req.usuario;
      const token = req.query.t;
      try {
        const data = jwt.verify(token, CONFIG_EMAIL.EMAIL_SECRET_KEY);
        const info = {
      ...res.locals.contexto,
          id: data.id,
        };
        res.render("resetearContraseña", { info });
      } catch (error) {
        res.render("recuperarContraseñaTimeOut");
      }
};

export const recuperarContrasenaMensaje = async (req, res) => {
  const documento_identificacion = req.query.documento_identificacion;
  const correo_electronico = await recuperarContrasena(
    documento_identificacion
  );
  return res.render("recuperarContraseñaMensaje", { correo_electronico });
};

export const postResetearContrasena = async (req, res) => {
  const { password, id } = req.body;

  if (!password || !id) {
    return res.status(400).json({ success: false, message: "Faltan datos" });
  }

  const respuesta = await resetearContrasenaRepo(password, id);
  return res.status(respuesta.success ? 200 : 400).json(respuesta);
};

export const registrarUsuario = async (req, res) => {
  const data = req.usuario;

      try {

        const rol = data.rol;
        if(rol!='administrador'){
          res.status(403).send("Usuario no Autorizado")
        }

        const especialidades = await cargarEspecialidades()

        const info = {
      ...res.locals.contexto,
          especialidades
        };

        res.render("administrador/registrarEmpleado", {info});
      } catch (error) {
        console.error(error)
        res.status(500).send("Error al conectar con el servidor")
      }
};

export const registroPublicoHospital = async (req, res) => {
  return res.render("secretaria/registrarPaciente_paraPaciente");
};

export const inicioSesionHandler = async (req, res) => {
  const { usuario } = req.body;
  // El campo llega con enye desde el formulario original; se acepta tambien
  // la variante sin acentuar para clientes que no la envien.
  const clave = req.body["contraseña"] ?? req.body.contrasena ?? req.body.password;

  if (!usuario || !clave) {
    return res
      .status(400)
      .json({ success: false, message: "Faltan el usuario o la contraseña" });
  }

  const respuesta = await inicioSesion({ usuario, "contraseña": clave });

  if (!respuesta?.success) {
    return res.status(401).json(respuesta ?? {
      success: false,
      message: "El usuario o la contraseña son incorrectos",
    });
  }

  // Los errores ya no se tragan aqui: si algo falla, asyncHandler lo lleva al
  // manejador central en lugar de dejar la peticion colgada sin respuesta.
  return res
    .status(200)
    .cookie(NOMBRE_COOKIE, firmarToken(respuesta), OPCIONES_COOKIE)
    .json(respuesta);
};

export const registroUsuarioHandler2 = async (req, res) => {
  const infoUsuario = req.body

  

  try {
   const success =  await registroUsuario(infoUsuario);
    if(success){
      res.status(201).json({ message: "Usuario registrado con éxito." });

    }else{
      res.status(500).json({ message: "Hubo un error al registrar al usuario." });
    }

  } catch (error) {
    logs.error(error)
    res
      .status(500)
      .json({ message: "Hubo un error al registrar al usuario." });
  }
};

export const verificarExistenciaEmpleadoHandler = async (req, res) => {
  const documento_identificacion = req.query.documento_identificacion;
  const respuesta = await verificarExistenciaEmpleado(
    documento_identificacion
  );
  res.send(respuesta);
};
