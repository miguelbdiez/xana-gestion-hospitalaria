/**
 * Controlador de turnos
 *
 * Cuadrantes de enfermeria y solicitudes de cambio de turno.
 *
 * Los manejadores asumen que ya han pasado por `requireAuth`, de modo que
 * `req.usuario` esta disponible, y por `cargarContextoUsuario` cuando la
 * pantalla necesita la barra lateral de chat y notificaciones.
 */

import { cargarListaNombresPlantilla } from "../repositories/ingresos.repository.js";
import { accionCambioDeTurno, actualizarCalendario, cargarEventosCambioHorariosEnfermeria, cargarHorarioDelMesActual, comprobarHorarioExiste, confirmarHorario, recuperarTurnosTrabajador, solicitarCambioDeTurno } from "../repositories/turnos.repository.js";
import { logs } from "../services/logs.service.js";
export const enfermeriaHorarios = async (req, res) => {
  const data = req.usuario;


        try {
          const rol = data.rol
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


          const nombresPlantilla = await cargarListaNombresPlantilla(data.especialidad,data.rol);
          const fechaActual = new Date();
          const horarios = await cargarHorarioDelMesActual(meses[fechaActual.getMonth()],data.especialidad);
          const eventos =await cargarEventosCambioHorariosEnfermeria(data.id,data.rol);

          const info = {
      ...res.locals.contexto,
            especialidad: data.especialidad,
            mes: meses[fechaActual.getMonth()], // getMonth() devuelve 0-11, lo mapeamos a texto
            año: fechaActual.getFullYear(), // Año completo (ej. 2025)
            diasEnMes: new Date(2025, meses.indexOf("Marzo") + 1, 0).getDate(), // Debe ser 31
            offset: (() => {
              const primerDia = new Date(2025, meses.indexOf("Marzo"), 1).getDay(); // 0=Dom, 1=Lun, etc.
              return primerDia === 0 ? 6 : primerDia - 1; // Debe ser 5 (1 de Marzo 2025 es Sábado)
            })(),
            nombresPlantilla,
            horarios,
            meses,
            eventos,
          };

          switch(rol){
            case "enfermero":
              return res.render("enfermeria/horariosHome", { info });
            case "enfermeroEncargado":
              return res.render("enfermeriaEncargado/horarios/horariosHome", { info });
            default:
              return res.status(403).send('No autorizado');

          }


        } catch (error) {
          console.error("Error:", error);
          res.status(500).send("Error interno del servidor");
        }
};

export const enfermeriaEncargadoHorariosGenerarHorario = async (req, res) => {
  const data = req.usuario;


      try {
        const rol = data.rol
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

        const nombresPlantilla = await cargarListaNombresPlantilla(data.especialidad,data.rol);
        const fechaActual = new Date();
        const horarios = await cargarHorarioDelMesActual(meses[fechaActual.getMonth()],data.especialidad);
        const eventos =await cargarEventosCambioHorariosEnfermeria(data.id,data.rol);

        const info = {
      ...res.locals.contexto,
          especialidad: data.especialidad,
          mes: meses[fechaActual.getMonth()], // getMonth() devuelve 0-11, lo mapeamos a texto
          año: fechaActual.getFullYear(), // Año completo (ej. 2025)
          diasEnMes: new Date(2025, meses.indexOf("Marzo") + 1, 0).getDate(), // Debe ser 31
          offset: (() => {
            const primerDia = new Date(2025, meses.indexOf("Marzo"), 1).getDay(); // 0=Dom, 1=Lun, etc.
            return primerDia === 0 ? 6 : primerDia - 1; // Debe ser 5 (1 de Marzo 2025 es Sábado)
          })(),
          nombresPlantilla,
          horarios,
          meses,
          eventos,
        };

        switch(rol){
          case "enfermeroEncargado":
            return res.render("enfermeriaEncargado/horarios/generarHorario", { info });
          default:
            return res.status(403).send('No autorizado');

        }


      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const recuperarTurnosTrabajadorHandler = async (req, res) => {
  const id = req.query.id;
 
  const respuesta = await recuperarTurnosTrabajador(id);
  res.send(respuesta);
};

export const solicitarCambioDeTurnoHandler = async (req, res) => {
  const solicitudCambio = req.body;
  const respuesta = await solicitarCambioDeTurno(
    solicitudCambio
  );
  // Enviar respuesta como JSON
  res.json(respuesta);
};

export const accionCambioDeTurnoHandler = async (req, res) => {
  const solicitudData = req.body;
  const respuesta = await accionCambioDeTurno(solicitudData);
  // Enviar respuesta como JSON
  res.json(respuesta);
};

export const confirmarHorarioHandler = async (req, res) => {
  
  const horarioConfirmado = req.body.horarioConfirmado;
  const especialidad = req.body.especialidad;
  const respuesta = await confirmarHorario(
    horarioConfirmado,
    especialidad
  );
  // Enviar respuesta como JSON
  res.json(respuesta);
};

export const actualizarCalendarioHandler = async (req, res) => {
  const { especialidad, mes, año } = req.query; // Recoger parámetros de la query string
  try {
    const respuesta = await actualizarCalendario(
      especialidad,
      mes,
      año
    );
    res.send(respuesta);
  } catch (error) {
    logs.error(error)
    res
      .status(500)
      .json({ success: false, message: "Error al actualizar el calendario" });
  }
};

export const comprobarHorarioExisteHandler = async (req, res) => {
  const { mes, año } = req.body;
  const respuesta = await comprobarHorarioExiste(mes, año);
  res.send(respuesta);
};
