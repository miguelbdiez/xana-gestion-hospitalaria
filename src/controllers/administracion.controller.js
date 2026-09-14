/**
 * Controlador de administracion
 *
 * Empleados, estadisticas y copias de seguridad.
 *
 * Los manejadores asumen que ya han pasado por `requireAuth`, de modo que
 * `req.usuario` esta disponible, y por `cargarContextoUsuario` cuando la
 * pantalla necesita la barra lateral de chat y notificaciones.
 */

import { actualizarEspecialidadEmpleado, actualizarInformacionEmpleado, hacerCopiaDeSeguridad, recuperarCopiasDeSeguridad, recuperarEmpleadosHospital, recuperarInfoEstadisticas, recuperarInformacionEmpleado } from "../repositories/administracion.repository.js";
import { cargarEspecialidades } from "../repositories/ingresos.repository.js";
import { logs } from "../services/logs.service.js";
export const plantillaHospital = async (req, res) => {
  const data = req.usuario;

      try {

        const rol = data.rol;
        if(rol!='administrador'){
          res.status(403).send("Usuario no Autorizado")
        }

        const empleadosHospital = await recuperarEmpleadosHospital()
        const especialidades = await cargarEspecialidades()

        const info = {
      ...res.locals.contexto,
          empleadosHospital,
          especialidades
        };

        res.render("administrador/plantillaHospital", {info});
      } catch (error) {
        console.error(error)
        res.status(500).send("Error al conectar con el servidor")
      }
};

export const recuperarInformacionEmpleadoHandler = async (req, res) => {
  // Delegado en recuperarInformacionEmpleado, migrado desde el antiguo XanaController.
  return recuperarInformacionEmpleadoHandler2(req, res);
};

export const postActualizarEspecialidadEmpleado = async (req, res) => {
  // Delegado en actualizarEspecialidadEmpleado, migrado desde el antiguo XanaController.
  return actualizarEspecialidadEmpleadoHandler(req, res);
};

export const postActualizarInformacionEmpleado = async (req, res) => {
  // Delegado en actualizarInformacionEmpleado, migrado desde el antiguo XanaController.
  return actualizarInformacionEmpleadoHandler(req, res);
};

export const estadisticasHospital = async (req, res) => {
  const data = req.usuario;

      try {

        const rol = data.rol;
        if(rol!='administrador'){
          res.status(403).send("Usuario no Autorizado")
        }

        const infoEstadisticas = await recuperarInfoEstadisticas()


        const info = {
      ...res.locals.contexto,
          infoEstadisticas

        };



        res.render("administrador/estadisticasHospital", {info});
      } catch (error) {
        console.error(error)
        res.status(500).send("Error al conectar con el servidor")
      }
};

export const copiasDeSeguridad = async (req, res) => {
  const data = req.usuario;

      try {

        const rol = data.rol;
        if(rol!='administrador'){
          res.status(403).send("Usuario no Autorizado")
        }

        const copiasDeSeguridad = await recuperarCopiasDeSeguridad()



        const info = {
      ...res.locals.contexto,
          copiasDeSeguridad,
        };

        res.render("administrador/copiasDeSeguridad", {info});
      } catch (error) {
        console.error(error)
        res.status(500).send("Error al conectar con el servidor")
      }
};

export const postHacerCopiaDeSeguridad = async (req, res) => {
  // Delegado en hacerCopiaDeSeguridad, migrado desde el antiguo XanaController.
  return hacerCopiaDeSeguridadHandler(req, res);
};

export const recuperarInformacionEmpleadoHandler2 = async (req, res) => {
  try {
    const id = req.query.id;
    const infoEmpleado = await recuperarInformacionEmpleado(id);
    if(infoEmpleado){
      res.send(infoEmpleado)
    }

  } catch (error) {
    logs.error(error)

    res.status(500).send()
  
  }
};

export const actualizarEspecialidadEmpleadoHandler = async (req, res) => {
  try {
    const {id, nuevaEspecialidad } = req.body;
    const success = await actualizarEspecialidadEmpleado(id, nuevaEspecialidad)

    if(success){
      res.status(200).send()
    }else{
      res.status(500).send()

    }

  } catch (error) {
    logs.error(error)

    res.status(500).send()
  
  }



};

export const actualizarInformacionEmpleadoHandler = async (req, res) => {
  try {
    const nuevaInfoEmpelado = req.body;
    const success = await actualizarInformacionEmpleado(nuevaInfoEmpelado)

    if(success){
      res.status(200).send()
    }else{
      res.status(500).send()

    }

  } catch (error) {
    logs.error(error)

    res.status(500).send()
  
  }



};

export const hacerCopiaDeSeguridadHandler = async (req, res) => {
  try {

    const success = await hacerCopiaDeSeguridad()

    if(success){
      res.status(200).send()
    }else{
      res.status(500).send()

    }

  } catch (error) {
    logs.error(error)

    res.status(500).send()
  
  }



};
