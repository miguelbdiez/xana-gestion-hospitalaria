/**
 * Controlador de farmacia
 *
 * Medicacion, inventario, pedidos y consulta al catalogo CIMA de la AEMPS.
 *
 * Los manejadores asumen que ya han pasado por `requireAuth`, de modo que
 * `req.usuario` esta disponible, y por `cargarContextoUsuario` cuando la
 * pantalla necesita la barra lateral de chat y notificaciones.
 */

import { SimulacionRecibirPedidosFarmacia, actualizarMedicacion, agregarMedicacion, buscarMedicamentosCoincidenciaNombre, nuevaEntradaAdministracionMedicacion, nuevoPedidoFarmacia, recuperarInventarioFarmacia, recuperarPedidosFarmacia } from "../repositories/farmacia.repository.js";
import { logs } from "../services/logs.service.js";
export const cimaCimaHome = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };

        switch(rol){

          case 'medico':
            res.render("medico/cima/cimaHome", { info });
            break
          case 'enfermero':
            res.render("enfermeria/cima/cimaHome", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/cima/cimaHome", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }
        return

      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const cimaMedicamentosCima = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };

        switch(rol){

          case 'medico':
            res.render("medico/cima/medicamentosCima", { info });
            break
          case 'enfermero':
            res.render("enfermeria/cima/medicamentosCima", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/cima/medicamentosCima", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }
        return

      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const cimaMedicamentoCima = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };

        switch(rol){

          case 'medico':
            res.render("medico/cima/medicamentoCima", { info });
            break
          case 'enfermero':
            res.render("enfermeria/cima/medicamentoCima", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/cima/medicamentoCima", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }
        return

      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const cimaDocumentoSegmentadoCima = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };

        switch(rol){

          case 'medico':
            res.render("medico/cima/documentoSegmentadoCima", { info });
            break
          case 'enfermero':
            res.render("enfermeria/cima/documentoSegmentadoCima", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/cima/documentoSegmentadoCima", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }
        return

      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const cimaDescripcionClinicaCima = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };

        switch(rol){

          case 'medico':
            res.render("medico/cima/descripcionClinicaCima", { info });
            break
          case 'enfermero':
            res.render("enfermeria/cima/descripcionClinicaCima", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/cima/descripcionClinicaCima", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }
        return

      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const cimaRegistroCambiosCima = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };

        switch(rol){

          case 'medico':
            res.render("medico/cima/registroCambiosCima", { info });
            break
          case 'enfermero':
            res.render("enfermeria/cima/registroCambiosCima", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/cima/registroCambiosCima", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }
        return

      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const cimaPresentacionesCima = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };

        switch(rol){

          case 'medico':
            res.render("medico/cima/presentacionesCima", { info });
            break
          case 'enfermero':
            res.render("enfermeria/cima/presentacionesCima", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/cima/presentacionesCima", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }
        return

      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const cimaMaestrasCima = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };

        switch(rol){

          case 'medico':
            res.render("medico/cima/maestrasCima", { info });
            break
          case 'enfermero':
            res.render("enfermeria/cima/maestrasCima", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/cima/maestrasCima", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }
        return

      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const cimaNotasSeguridadCima = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };

        switch(rol){

          case 'medico':
            res.render("medico/cima/notasSeguridadCima", { info });
            break
          case 'enfermero':
            res.render("enfermeria/cima/notasSeguridadCima", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/cima/notasSeguridadCima", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }
        return

      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const cimaMaterialesInformativosSeguridadCima = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };

        switch(rol){

          case 'medico':
            res.render("medico/cima/materialesInformativosSeguridadCima", { info });
            break
          case 'enfermero':
            res.render("enfermeria/cima/materialesInformativosSeguridadCima", { info });
            break
          case 'enfermeroEncargado':
            res.render("enfermeriaEncargado/cima/materialesInformativosSeguridadCima", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }
        return

      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const enfermeriaFarmacia = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol


        const farmacos = await recuperarInventarioFarmacia(data.especialidad);
        const pedidos = await recuperarPedidosFarmacia(data.especialidad);

        const info = {
      ...res.locals.contexto,
          especialidad: data.especialidad,
          farmacos,
          pedidos,
        };

        switch(rol){
          case "enfermeroEncargado":
            return res.render("enfermeriaEncargado/farmacia", { info });
          default:
            return res.status(403).send('No autorizado');

        }
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const nuevaEntradaAdministracionMedicacionHandler = async (req, res) => {
  try {
    const info = req.body;
    const nuevaEntradaAdministracionMedicacion =
      await nuevaEntradaAdministracionMedicacion(info);

    if (nuevaEntradaAdministracionMedicacion) {
      res.status(200).json({
        success: true,
        message: "Administracion añadida correctamente",
        data: nuevaEntradaAdministracionMedicacion,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al añadir la administracion ",
      });
    }
  } catch (error) {
    logs.error(error)

    res.status(500).json({
      success: false,
      message: "Error en el servidor al añadir administracion",
      error: error.message,
    });
  }
};

export const nuevoPedidoFarmaciaHandler = async (req, res) => {
  try {
    const info = req.body;
    const nuevoPedidoFarmacia = await nuevoPedidoFarmacia(
      info
    );

    if (nuevoPedidoFarmacia) {
      res.status(200).json({
        success: true,
        message: "Retirada regsitrada correctamente",
        data: nuevoPedidoFarmacia,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al hacer pedido",
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

export const agregarMedicacionHandler = async (req, res) => {
  try {
    const medicacion = req.body;
    const medicacionAñadida = await agregarMedicacion(
      medicacion
    );

    if (medicacionAñadida) {
      res.status(200).json({
        success: true,
        message: "medicamento agrado correctamente",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al agregar medicamento",
      });
    }
  } catch (error) {
    logs.error(error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor al agregar medicamento",
      error: error.message,
    });
  }
};

export const actualizarMedicacionHandler = async (req, res) => {
  try {
    const medicacion = req.body;
    const medicacionActualizada = await actualizarMedicacion(
      medicacion
    );

    if (medicacionActualizada) {
      res.status(200).json({
        success: true,
        message: "medicamento agrado correctamente",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al agregar medicamento",
      });
    }
  } catch (error) {
    logs.error(error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor al agregar medicamento",
      error: error.message,
    });
  }
};

export const buscarMedicamentosCoincidenciaNombreHandler = async (req, res) => {
  try {
    const cadena = req.query.q;
    const coincidenciasMedicamentoPorNombre =
      await buscarMedicamentosCoincidenciaNombre(cadena);

    if (coincidenciasMedicamentoPorNombre) {
      res.status(200).json({
        success: true,
        message: "Retirada regsitrada correctamente",
        data: coincidenciasMedicamentoPorNombre,
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

export const SimulacionRecibirPedidosFarmaciaHandler = async (req, res) => {
  try {
    const especialidad = req.query.especialidad;
    const success = await SimulacionRecibirPedidosFarmacia(
      especialidad
    );
    //const success = false;
    res.render("simulacionRecibirPedidosFarmaciaSuccess", {
      especialidad,
      success,
    });
  } catch (error) {
    const especialidad = req.query;
    const success = false;
          logs.error(error)

    res.render("simulacionRecibirPedidosFarmaciaNoSuccess", {
      especialidad,
      success,
    });
  }
};
