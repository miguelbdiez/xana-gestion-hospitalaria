/**
 * Controlador de clinica
 *
 * Planta, ficha del paciente y toda su actividad clinica.
 *
 * Los manejadores asumen que ya han pasado por `requireAuth`, de modo que
 * `req.usuario` esta disponible, y por `cargarContextoUsuario` cuando la
 * pantalla necesita la barra lateral de chat y notificaciones.
 */

import jwt from "jsonwebtoken";
import { actualizarInformacionCabecera, balanceActivo, calcularTurno, cambiarEstadoBalancePanel, desactivarIncidencia, nuevaEntradaBalance, nuevaEntradaConstantes, nuevaEntradaEvolutivoEnfermeria, nuevaEntradaMantenimiento, nuevaEntradaTest, nuevaEntradaVia, nuevaRetirarVia, recuperarBalancesPaciente, recuperarConstantesPaciente, recuperarDetallesBalance, recuperarEvolutivoEnfermeria, recuperarIncidenciasIngreso, recuperarInfoVia, recuperarInfoViaMantenimientos, recuperarInfoViaRetirada, recuperarTestsPaciente, recuperarValoresConstantesGraficos, recuperarVariablesTest, recuperarViasPaciente, reportarIncidencia } from "../repositories/enfermeria.repository.js";
import { recuperarAdministracionesMedicacion, recuperarMedicacionActivaHistorialPaciente, recuperarMedicacionPaciente } from "../repositories/farmacia.repository.js";
import { cargarEspecialidades, cargarTodosIngresados, cargarTodosLosMedicos, recuperarImagenHabitacion, recuperarInfoIngreso, recuperarIngresadosInfoPlantaEnfermero, recuperarIngresadosMedico } from "../repositories/ingresos.repository.js";
import { nuevaEntradaEvolutivoMedicina, recuperarDiagnosticoPaciente, recuperarEvolutivoMedicina } from "../repositories/medicina.repository.js";
import { cargarTodosPacientesInicio, recuperarEpisodiosPaciente } from "../repositories/pacientes.repository.js";
import { recuperarInformacionEpisodioPaciente } from "../services/episodio.service.js";
import { logs } from "../services/logs.service.js";
import { SECRET_KEY } from "../config/index.js";
export const planta = async (req, res) => {
  const data = req.usuario;

    try {
      const rol = data.rol

      let info = {
      ...res.locals.contexto,
        especialidad: data.especialidad,
      };


      switch(rol){

        case 'medico':
          const ingresadosInfoMedico = await recuperarIngresadosMedico(data.id,data.especialidad);
           info = {
            ...info,
            ingresadosInfo:ingresadosInfoMedico
          }
          res.render("medico/plantaMedicina", { info });
          break

        case 'enfermero':

          const ingresadosInfoEnfermero = await recuperarIngresadosInfoPlantaEnfermero(data.especialidad,data.id);
           info = {
            ...info,
            ingresadosInfo:ingresadosInfoEnfermero.ingresadosInfo,
            ingresadosInfoZonaTrabajo:ingresadosInfoEnfermero.ingresadosInfoZonaTrabajo
          }
          res.render("enfermeria/plantaEnfermeria", { info });
          break
          case 'enfermeroEncargado':
            const ingresadosInfoEnfermeroEncargado = await recuperarIngresadosInfoPlantaEnfermero(data.especialidad,data.id);
             info = {
              ...info,
              ingresadosInfo:ingresadosInfoEnfermeroEncargado.ingresadosInfo,
              ingresadosInfoZonaTrabajo:ingresadosInfoEnfermeroEncargado.ingresadosInfoZonaTrabajo
            }
            res.render("enfermeriaEncargado/plantaEnfermeria", { info });
            break

        default:
          res.status(403).send('no autorizado');
      }

      return
    } catch (error) {
      res.status(500).send("Error interno del servidor");
    }
};

export const paciente = async (req, res) => {
  const data = req.usuario;

    try {

      const rol = data.rol;

      const ingreso_id = req.query.ingreso_id
      let  cama_id, bloqueado;

      let info = {
      ...res.locals.contexto,
        id: data.id,
        nombreTrabajador: data.nombre,
        ingreso_id: ingreso_id,
        especialidad: data.especialidad,

      };

      switch(rol){

        case 'medico':

          const infoCabecera = await recuperarInfoIngreso(ingreso_id);
          const infoIncidencias =await recuperarIncidenciasIngreso(ingreso_id);
          const especialidades = await cargarEspecialidades();

          info = {
            ...info,
            infoCabecera,
            infoIncidencias,
            especialidades,
          }
           return res.render("medico/paciente/paciente", { info });




        case 'enfermero':

            cama_id= req.query.cama_id;
            bloqueado = req.query.bloqueado;

          if (ingreso_id != -1) {
            const infoCabecera = await recuperarInfoIngreso(ingreso_id);
            const infoIncidencias =await recuperarIncidenciasIngreso(ingreso_id);

            info = {
              ... info,
              infoCabecera,
              infoIncidencias,
            };
            return res.render("enfermeria/paciente/paciente", { info });

          } else {
            const imagenCama = await recuperarImagenHabitacion(cama_id,bloqueado);

             info = {
              ... info,

              bloqueado,
              cama_id,
              panelHabitacion: imagenCama,
            };

            return res.render("enfermeria/paciente/habitacionPlanta", { info });
          }
        case 'enfermeroEncargado':

          cama_id= req.query.cama_id;
          bloqueado = req.query.bloqueado;

          if (ingreso_id != -1) {
            const infoCabecera = await recuperarInfoIngreso(ingreso_id);
            const infoIncidencias =await recuperarIncidenciasIngreso(ingreso_id);
            info = {
              ... info,
              infoCabecera,
              infoIncidencias,
            };
            return res.render("enfermeria/paciente/paciente", { info });

          } else {
            const imagenCama = await recuperarImagenHabitacion(cama_id,bloqueado);

             info = {
              ... info,

              bloqueado,
              cama_id,
              panelHabitacion: imagenCama,
            };

            return res.render("enfermeria/paciente/habitacionPlanta", { info });
          }

        default:
          res.status(403).send('no autorizado');
      }


    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Error interno del servidor");
    }
};

export const pacienteDiagnosticoPaciente = async (req, res) => {
  const data = req.usuario;

    try {
      const rol = data.rol

      const { ingreso_id } = req.query;

      const infoCabecera = await recuperarInfoIngreso(ingreso_id);
      const infoIncidencias = await recuperarIncidenciasIngreso(ingreso_id);

      const diagnosticoPaciente =await recuperarDiagnosticoPaciente(ingreso_id);

      const info = {
      ...res.locals.contexto,
        id: data.id,
        ingreso_id: ingreso_id,
        especialidad: data.especialidad,

        infoCabecera,
        infoIncidencias,
        diagnosticoPaciente,
        };

        switch(rol){

          case 'medico':

            return res.render("medico/paciente/diagnosticoPaciente", { info });

          case 'enfermero':

            return res.render("enfermeria/paciente/diagnosticoPaciente", { info });
          case 'enfermeroEncargado':
            return res.render("enfermeriaEncargado/paciente/diagnosticoPaciente", { info });

          default:
            res.status(403).send('no autorizado');
        }

    } catch (error) {
      console.error("Error en:", error);
      res.status(500).send("Error interno del servidor");
    }
};

export const pacienteMedicacionPaciente = async (req, res) => {
  const data = req.usuario;

    try {
      const rol = data.rol

      const { ingreso_id } = req.query;

      const infoCabecera = await recuperarInfoIngreso(ingreso_id);
      const infoIncidencias = await recuperarIncidenciasIngreso(ingreso_id);

      const medicacion = await recuperarMedicacionPaciente(ingreso_id);
      const medicacionActivaHistorial = await recuperarMedicacionActivaHistorialPaciente( ingreso_id);
      const historialDeAdministracion = await recuperarAdministracionesMedicacion(ingreso_id);

        const info = {
      ...res.locals.contexto,
          id: data.id,
          ingreso_id: ingreso_id,
          especialidad: data.especialidad,
          infoCabecera,
          infoIncidencias,
          medicacion,
          medicacionActivaHistorial,
          historialDeAdministracion,
        };

        switch(rol){

          case 'medico':

            return res.render("medico/paciente/medicacionPaciente", { info });


          case 'enfermero':

            return res.render("enfermeria/paciente/medicacionPaciente", { info });

          case 'enfermeroEncargado':
            return res.render("enfermeriaEncargado/paciente/medicacionPaciente", { info });

          default:
            res.status(403).send('no autorizado');
        }


    } catch (error) {
      console.error("Error en:", error);
      res.status(500).send("Error interno del servidor");
    }
};

export const pacienteEvolutivoMedico = async (req, res) => {
  const data = req.usuario;

    try {
      const rol = data.rol

      const { ingreso_id } = req.query;

      const infoCabecera = await recuperarInfoIngreso(ingreso_id);
      const infoIncidencias = await recuperarIncidenciasIngreso(ingreso_id);

      const turno = await calcularTurno();
      const entradasEvolutivoMedicina = await recuperarEvolutivoMedicina(ingreso_id);

      const info = {
      ...res.locals.contexto,
        nombreTrabajador: data.nombre,
        id_trabajador: data.id,
        especialidad: data.especialidad,
        turno,
        infoCabecera,
        infoIncidencias,
        entradasEvolutivoMedicina,
        ingreso_id,

      };

        switch(rol){

          case 'medico':

            return res.render("medico/paciente/evolutivoMedico", { info });

          case 'enfermero':

            return res.render("enfermeria/paciente/evolutivoMedico", { info });

          case 'enfermeroEncargado':
            return  res.render("enfermeriaEncargado/paciente/evolutivoMedico", { info });

          default:
            res.status(403).send('no autorizado');
        }


    } catch (error) {
      console.error("Error en:", error);
      res.status(500).send("Error interno del servidor");
    }
};

export const pacienteEvolutivoEnfermeria = async (req, res) => {
  const data = req.usuario;

    try {
      const rol = data.rol

      const { ingreso_id } = req.query;

      const infoCabecera = await recuperarInfoIngreso(ingreso_id);
      const infoIncidencias = await recuperarIncidenciasIngreso(ingreso_id);

      const turno = await calcularTurno();
      const entradasEvolutivoEnfermeria = await recuperarEvolutivoEnfermeria(ingreso_id);

      const info = {
      ...res.locals.contexto,
        nombreTrabajador: data.nombre,
        id_trabajador: data.id,
        especialidad: data.especialidad,
        turno,
        infoCabecera,
        infoIncidencias,
        entradasEvolutivoEnfermeria,
        ingreso_id,

      };

        switch(rol){

          case 'medico':

            return res.render("medico/paciente/evolutivoEnfermeria", { info });

          case 'enfermero':

            return res.render("enfermeria/paciente/evolutivoEnfermeria", { info });

          case 'enfermeroEncargado':
            return  res.render("enfermeriaEncargado/paciente/evolutivoEnfermeria", { info });

          default:
            res.status(403).send('no autorizado');
        }


    } catch (error) {
      console.error("Error en:", error);
      res.status(500).send("Error interno del servidor");
    }
};

export const pacienteConstantesPaciente = async (req, res) => {
  const data = req.usuario;

    try {
      const rol = data.rol

      const { ingreso_id } = req.query;

      const infoCabecera = await recuperarInfoIngreso(ingreso_id);
      const infoIncidencias = await recuperarIncidenciasIngreso(ingreso_id);

      const infoConstantesPaciente = await recuperarConstantesPaciente(ingreso_id);
      const turno = await calcularTurno();
      const info = {
      ...res.locals.contexto,
        nombreTrabajador: data.nombre,
        id_trabajador: data.id,
        especialidad: data.especialidad,
        ingreso_id,
        turno,
        infoCabecera,
        infoIncidencias,
        infoConstantesPaciente,
      };

        switch(rol){

          case 'medico':

            return res.render("medico/paciente/constantesPaciente", { info });

          case 'enfermero':

            return res.render("enfermeria/paciente/constantesPaciente", { info });

          case 'enfermeroEncargado':
            return  res.render("enfermeriaEncargado/paciente/constantesPaciente", { info });

          default:
            res.status(403).send('no autorizado');
        }


    } catch (error) {
      console.error("Error en:", error);
      res.status(500).send("Error interno del servidor");
    }
};

export const pacienteBalancePaciente = async (req, res) => {
  const data = req.usuario;

    try {
      const rol = data.rol

      const { ingreso_id } = req.query;

      const infoCabecera = await recuperarInfoIngreso(ingreso_id);
      const infoIncidencias = await recuperarIncidenciasIngreso(ingreso_id);

      const balanceActivo = await balanceActivo(ingreso_id);
      const turno = await calcularTurno();
      const balancePaciente = await recuperarBalancesPaciente(ingreso_id);
      const info = {
      ...res.locals.contexto,
        nombreTrabajador: data.nombre,
        id_trabajador: data.id,
        especialidad: data.especialidad,
        ingreso_id,
        turno,
        infoCabecera,
        infoIncidencias,
        balanceActivo,
        balancePaciente
      };

        switch(rol){

          case 'medico':

            return res.render("medico/paciente/balancePaciente", { info });

          case 'enfermero':

            return res.render("enfermeria/paciente/balancePaciente", { info });

          case 'enfermeroEncargado':
            return  res.render("enfermeriaEncargado/paciente/balancePaciente", { info });

          default:
            res.status(403).send('no autorizado');
        }


    } catch (error) {
      console.error("Error en:", error);
      res.status(500).send("Error interno del servidor");
    }
};

export const pacienteViasPaciente = async (req, res) => {
  const data = req.usuario;

    try {
      const rol = data.rol

      const { ingreso_id } = req.query;

      const infoCabecera = await recuperarInfoIngreso(ingreso_id);
      const infoIncidencias = await recuperarIncidenciasIngreso(ingreso_id);

      const viasPaciente = await recuperarViasPaciente(ingreso_id);
      const turno = await calcularTurno();
      const info = {
      ...res.locals.contexto,
        nombreTrabajador: data.nombre,
        id_trabajador: data.id,
        especialidad: data.especialidad,
        ingreso_id,
        turno,
        infoCabecera,
        infoIncidencias,
        viasPaciente,
      };

        switch(rol){

          case 'medico':

            return res.render("medico/paciente/viasPaciente", { info });

          case 'enfermero':

            return res.render("enfermeria/paciente/viasPaciente", { info });

          case 'enfermeroEncargado':
            return  res.render("enfermeriaEncargado/paciente/viasPaciente", { info });

          default:
            res.status(403).send('no autorizado');
        }


    } catch (error) {
      console.error("Error en:", error);
      res.status(500).send("Error interno del servidor");
    }
};

export const pacienteViaPaciente = async (req, res) => {
  const data = req.usuario;

    try {
      const rol = data.rol

      const ingreso_id  = req.query.ingreso_id;
      const id_via = req.query.id_via;

      const infoCabecera = await recuperarInfoIngreso(ingreso_id);
      const infoIncidencias = await recuperarIncidenciasIngreso(ingreso_id);

      const turno = await calcularTurno();
      const infoVia = await recuperarInfoVia(ingreso_id, id_via);
      const infoViaMantenimientos = await recuperarInfoViaMantenimientos(id_via);
      let infoViaRetirada = null;

      if (infoVia.fecha_fin != null) {
        infoViaRetirada = await recuperarInfoViaRetirada(id_via);
      }
      const info = {
      ...res.locals.contexto,
        nombreTrabajador: data.nombre,
        id_trabajador: data.id,
        especialidad: data.especialidad,
        ingreso_id,
        turno,
        infoCabecera,
        infoIncidencias,
        infoVia,
        infoViaMantenimientos,
        infoViaRetirada
      };

        switch(rol){

          case 'medico':

            return res.render("medico/paciente/viaPaciente", { info });

          case 'enfermero':

            return res.render("enfermeria/paciente/viaPaciente", { info });

          case 'enfermeroEncargado':
            return  res.render("enfermeriaEncargado/paciente/viaPaciente", { info });

          default:
            res.status(403).send('no autorizado');
        }


    } catch (error) {
      console.error("Error en:", error);
      res.status(500).send("Error interno del servidor");
    }
};

export const pacienteTestPaciente = async (req, res) => {
  const data = req.usuario;

    try {
      const rol = data.rol

      const ingreso_id  = req.query.ingreso_id;

      const infoCabecera = await recuperarInfoIngreso(ingreso_id);
      const infoIncidencias = await recuperarIncidenciasIngreso(ingreso_id);

      const turno = await calcularTurno();
      const infoTestPaciente = await recuperarTestsPaciente(ingreso_id);
      const info = {
      ...res.locals.contexto,
        nombreTrabajador: data.nombre,
        id_trabajador: data.id,
        especialidad: data.especialidad,
        ingreso_id,
        turno,
        infoCabecera,
        infoIncidencias,
        infoTestPaciente,

      };

        switch(rol){

          case 'medico':

            return res.render("medico/paciente/testPaciente", { info });

          case 'enfermero':

            return res.render("enfermeria/paciente/testPaciente", { info });

          case 'enfermeroEncargado':
            return  res.render("enfermeriaEncargado/paciente/testPaciente", { info });

          default:
            res.status(403).send('no autorizado');
        }


    } catch (error) {
      console.error("Error en:", error);
      res.status(500).send("Error interno del servidor");
    }
};

export const secretariaPacientesIngresados = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };
        switch(rol){

          case 'secretario':
            res.render("secretaria/pacientesYIngresados/pacientesIngresadosHome", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }

      } catch (error) {
        console.error("Error en /documentos:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const secretariaPacientesIngresadosPacientesHome = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };
        switch(rol){

          case 'secretario':
            res.render("secretaria/pacientesYIngresados/pacientesHome", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }

      } catch (error) {
        console.error("Error en /documentos:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const secretariaPacientesIngresadosIngresadosHome = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };
        switch(rol){

          case 'secretario':
            res.render("secretaria/pacientesYIngresados/ingresadosHome", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }

      } catch (error) {
        console.error("Error en /documentos:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const secretariaConsultarIngresados = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        if(rol!='secretario'){
          res.status(403).send("Usuario no Autorizado")
        }

        const especialidades = await cargarEspecialidades();
        const medicos = await cargarTodosLosMedicos();
        const ingresados = await cargarTodosIngresados();

        const info = {
      ...res.locals.contexto,
          especialidades: especialidades,
          medicos: medicos,
          ingresados: ingresados,
        };
        return res.render("secretaria/consultarIngresados", { info });

      } catch (error) {
        console.error(error)
        res.status(500).send("Error al conectar con el servidor")
      }
};

export const secretariaConsultarPacientes = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        if(rol!='secretario'){
          return res.status(403).send("Usuario no Autorizado")
        }
        const pacientes = await cargarTodosPacientesInicio();

        const info = {
      ...res.locals.contexto,
          pacientes,
        };
        return res.render("secretaria/consultarPacientes", { info });
      } catch (error) {
        console.error(error)
        return res.status(500).send("Error al conectar con el servidor")
      }
};

export const secretariaRegistrarPaciente = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        if(rol!='secretario'){
          return res.status(403).send("Usuario no Autorizado")
        }

        const info = {
      ...res.locals.contexto,
        };
        return res.render("secretaria/registrarPaciente", { info });
      } catch (error) {
        console.error(error)
        return res.status(500).send("Error al conectar con el servidor")
      }
};

export const secretariaIngresoPaciente = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        if(rol!='secretario'){
          return res.status(403).send("Usuario no Autorizado")
        }

        const especialidades = await cargarEspecialidades();

        const info = {
      ...res.locals.contexto,
          especialidades: especialidades,
        };
        return res.render("secretaria/ingresoPaciente", { info });
      }catch (error) {
        console.error(error)
        return res.status(500).send("Error al conectar con el servidor")
      }
};

export const medicinaConsultarEpisodiosPaciente = async (req, res) => {
  const data = req.usuario;


        try {
          const rol = data.rol


          const historia_id = req.query.historia_id;

          const episodiosPaciente = await recuperarEpisodiosPaciente(
            historia_id
          );


          const info = {
      ...res.locals.contexto,
            nombreTrabajador: data.nombre,
            especialidad: data.especialidad,
            id_trabajador: data.id,
            historia_id,
            episodiosPaciente,
          };
          switch(rol){

            case 'medico':
              return res.render("medico/expedientes/consultarEpisodiosPaciente", { info });;
            default:
              res.status(403).send('No autorizado');
          }

        } catch (error) {
          console.error("Error:", error);
          res.status(500).send("Error interno del servidor");
        }
};

export const medicinaEpisodioPaciente = async (req, res) => {
  const data = req.usuario;


        try {
          const rol = data.rol;

          const ingreso_id = req.query.episodio;
          const historia_id = req.query.historia_id


          const infoEpisodio= await recuperarInformacionEpisodioPaciente(ingreso_id)

          const info = {
      ...res.locals.contexto,
            nombreTrabajador: data.nombre,
            id_trabajador: data.id,
            infoEpisodio,
            especialidad: data.especialidad,
            historia_id
          };
          switch(rol){

            case 'medico':
              res.render("medico/expedientes/consultarEpisodioPaciente", { info });
              break
              default:
              res.status(403).send('No autorizado');
          }
          return

        } catch (error) {
          console.error("Error:", error);
          res.status(500).send("Error interno del servidor");
        }
};

export const reportarIncidenciaHandler = async (req, res) => {
   const {
    ingreso_id,
    cuerpo,
    activa,
    cama_id,
    documento_identificacion_paciente,
  } = req.body;
  const nuevaIncidencia = await reportarIncidencia(
    ingreso_id,
    cuerpo,
    activa,
    cama_id,
    documento_identificacion_paciente
  );
  if (nuevaIncidencia != "") {
    res.status(200).send(nuevaIncidencia);
  } else {
    res.status(500).send();
  }
};

export const desactivarIncidenciaHandler = async (req, res) => {
  const { idIncidencia, activa, cama_id, ingreso_id } = req.body;

  const incidenciaDesactivada = await desactivarIncidencia(
    idIncidencia,
    activa,
    cama_id,
    ingreso_id
  );
  res.status(200).send(incidenciaDesactivada);
};

export const actualizarInformacionCabeceraHandler = async (req, res) => {
  const informacionCabecera = req.body;

  const respuesta = await actualizarInformacionCabecera(
    informacionCabecera
  );
  if (respuesta.success) {
    res.status(200).send(respuesta);
  } else {
    res.status(500).send();
  }
};

export const cambiarEstadoBalancePanelHandler = async (req, res) => {
  const { balance, cama_id, ingreso_id } = req.body;

  const panelPaciente = await cambiarEstadoBalancePanel(
    balance,
    cama_id,
    ingreso_id
  );

  res.status(200).json(panelPaciente);
};

export const nuevaEntradaEvolutivoEnfermeriaHandler = async (req, res) => {
  const info = req.body;
  const entradaEvolutivo =
    await nuevaEntradaEvolutivoEnfermeria(info);

  if (entradaEvolutivo) {
    res.status(200).send(entradaEvolutivo);
  } else {
    res.status(500).send();
  }
};

export const nuevaEntradaEvolutivoMedicinaHandler = async (req, res) => {
  const info = req.body;
  const entradaEvolutivo = await nuevaEntradaEvolutivoMedicina(
    info
  );

  if (entradaEvolutivo) {
    res.status(200).send(entradaEvolutivo);
  } else {
    res.status(500).send();
  }
};

export const nuevaEntradaConstantesHandler = async (req, res) => {
  const info = req.body;
  const success = await nuevaEntradaConstantes(info);

  if (success) {
    res.status(200).send();
  } else {
    res.status(500).send();
  }
};

export const nuevaEntradaTestHandler = async (req, res) => {
  const info = req.body;
  const nuevaEntradaTest = await nuevaEntradaTest(info);

  if (nuevaEntradaTest) {
    res.status(200).send(nuevaEntradaTest);
  } else {
    res.status(500).send();
  }
};

export const nuevaEntradaBalanceHandler = async (req, res) => {
  const info = req.body;
  const nuevaEntradaBalance = await nuevaEntradaBalance(info);

  if (nuevaEntradaBalance) {
    res.status(200).send(nuevaEntradaBalance);
  } else {
    res.status(500).send();
  }
};

export const nuevaEntradaViaHandler = async (req, res) => {
  try {
    const info = req.body;
    const nuevaEntradaVia = await nuevaEntradaVia(info);

    if (nuevaEntradaVia) {
      res.status(200).json({
        success: true,
        message: "Vía añadida correctamente",
        data: nuevaEntradaVia,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al añadir la vía",
      });
    }
  } catch (error) {
    logs.error(error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor al añadir la vía",
      error: error.message,
    });
  }
};

export const nuevaEntradaMantenimientoHandler = async (req, res) => {
  try {
    const info = req.body;
    const nuevaEntradaMantenimiento =
      await nuevaEntradaMantenimiento(info);


    if (nuevaEntradaMantenimiento) {
      res.status(200).json({
        success: true,
        message: "Mantenimiento añadido correctamente",
        data: nuevaEntradaMantenimiento,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al añadir el mantenimiento",
      });
    }
  } catch (error) {
    logs.error(error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor al añadir la vía",
      error: error.message,
    });
  }
};

export const nuevaRetirarViaHandler = async (req, res) => {
  try {
    const info = req.body;
    const nuevaRetirarVia = await nuevaRetirarVia(info);


    if (nuevaRetirarVia) {
      res.status(200).json({
        success: true,
        message: "Retirada regsitrada correctamente",
        data: nuevaRetirarVia,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al registradala retirada de la via",
      });
    }
  } catch (error) {
    logs.error(error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor al añadir la vía",
      error: error.message,
    });
  }
};

export const recuperarValoresConstantesGraficosHandler = async (req, res) => {
  const token = req.cookies.access_token;

  if (!token) return res.render("zonaRestringida");

  try {
    const data = jwt.verify(token, SECRET_KEY);

    const constantes = req.query.constantes;
    const ingreso_id = req.query.ingreso_id;

    const recuperarValoresConstantes =
      await recuperarValoresConstantesGraficos(
        constantes,
        ingreso_id
      );
    res.status(200).send(recuperarValoresConstantes);
  } catch (err) {
    logs.error(err)

    res.status(500).send();
  }
};

export const recuperarVariablesTestHandler = async (req, res) => {
  const token = req.cookies.access_token;

  if (!token) return res.render("zonaRestringida");

  try {
    const data = jwt.verify(token, SECRET_KEY);

    const id_del_test = req.query.id_del_test;
    const ingreso_id = req.query.ingreso_id;
    const tipo_prueba = req.query.tipo_prueba;

    const recuperarValoresTest = await recuperarVariablesTest(
      id_del_test,
      ingreso_id,
      tipo_prueba
    );
    res.status(200).send(recuperarValoresTest);
  } catch (err) {
    logs.error(err)
    res.status(500).send();
  }
};

export const recuperarDetallesBalanceHandler = async (req, res) => {
  const token = req.cookies.access_token;

  if (!token) return res.render("zonaRestringida");

  try {
    const data = jwt.verify(token, SECRET_KEY);

    const id_balance = req.query.id_balance;
    const ingreso_id = req.query.ingreso_id;

    const recuperarDetallesBalance =
      await recuperarDetallesBalance(id_balance, ingreso_id);
    res.status(200).send(recuperarDetallesBalance);
  } catch (err) {
    res.status(500).send();
  }
};
