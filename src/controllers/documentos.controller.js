/**
 * Controlador de documentos
 *
 * Documentacion oficial: generacion, bandeja y tramites.
 *
 * Los manejadores asumen que ya han pasado por `requireAuth`, de modo que
 * `req.usuario` esta disponible, y por `cargarContextoUsuario` cuando la
 * pantalla necesita la barra lateral de chat y notificaciones.
 */

import { PDFDocument } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import { accionPdf, descartarPeticionDocumento, enviarBandejaDocumentos, generarPdf, recuperarCamposTramite, recuperarPdf, recuperarTodosLosDocumentosBandeja, recuperarTodosLosDocumentosHospitalMedico, recuperarTodosLosDocumentosHospitalSecretario } from "../repositories/documentos.repository.js";
import { verificarExistePaciente } from "../repositories/pacientes.repository.js";
import { logs } from "../services/logs.service.js";
export const recuperarPDF = async (req, res) => {
  const id = req.query.id; // Obtener el ID desde los parámetros de la URL (ej: /recuperarPDF?id=123)

  if (!id) {
    return res.status(400).send("ID del PDF no proporcionado");
  }

  try {
    const archivo = await recuperarPdf(id);

    if (!archivo) {
      return res.status(404).send("PDF no encontrado");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.send(archivo); // Envia el buffer directamente
  } catch (error) {
    console.error("Error al recuperar PDF:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const crearpdfrellenable = async (req, res) => {
      /* FORMULARIO REGISTRO
        try {
        const pdfPath = path.join(
          __dirname,
          "public/documentosSecretaria/documento_registro_paciente.pdf"
        );
        const pdfBytes = await fs.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const page = pdfDoc.getPages()[0];
        const page1 = pdfDoc.getPages()[1];
        const form = pdfDoc.getForm();

       form
          .createTextField("documentoIdentificacion")
          .addToPage(page, { x: 225, y: 625, width: 310, height: 22 });
        form
          .createTextField("nombre")
          .addToPage(page, { x: 225, y: 593, width: 310, height: 22 });
        form
          .createTextField("primerApellido")
          .addToPage(page, { x: 225, y: 561, width: 310, height: 22 });
        form
          .createTextField("segundoApellido")
          .addToPage(page, { x: 225, y: 529, width: 310, height: 22 });
        form
          .createTextField("diaNacimiento")
          .addToPage(page, { x: 351, y: 505, width: 17, height: 15 }); // 2 dígitos
        form
          .createTextField("mesNacimiento")
          .addToPage(page, { x: 374, y: 505, width: 17, height: 15 }); // 2 dígitos
        form
          .createTextField("anoNacimiento")
          .addToPage(page, { x: 397, y: 505, width: 30, height: 15 }); // 2 dígitos

        // Casillas para 'Sexo'
        form
          .createCheckBox("sexoHombre")
          .addToPage(page, { x: 245, y: 477, width: 7, height: 7 });
        form
          .createCheckBox("sexoMujer")
          .addToPage(page, { x: 245, y: 463, width: 7, height: 7 });
        form
          .createCheckBox("sexoOtro")
          .addToPage(page, { x: 245, y: 449, width: 7, height: 7 });

        form
          .createTextField("direccion")
          .addToPage(page, { x: 225, y: 415, width: 310, height: 22 });
        form
          .createTextField("telefono")
          .addToPage(page, { x: 225, y: 377, width: 310, height: 22 });

        form
          .createTextField("nacionalidad")
          .addToPage(page, { x: 225, y: 343, width: 310, height: 22 });

        form
          .createTextField("correoElectronico")
          .addToPage(page, { x: 225, y: 307, width: 310, height: 22 });

        form
          .createTextField("personaEmergencia")
          .addToPage(page, { x: 225, y: 262, width: 310, height: 22 });

        form
          .createTextField("parentesco")
          .addToPage(page, { x: 225, y: 220, width: 310, height: 22 });

        form
          .createTextField("contactoEmergencia")
          .addToPage(page, { x: 225, y: 160, width: 310, height: 22 });

        form
          .createTextField("diaActual")
          .addToPage(page1, { x: 291, y: 84, width: 17, height: 15 });

        form
          .createTextField("mesActual")
          .addToPage(page1, { x: 315, y: 84, width: 17, height: 15 });

        form
          .createTextField("añoActual")
          .addToPage(page1, { x: 338, y: 84, width: 30, height: 15 });


        const modifiedPdfBytes = await pdfDoc.save();
        const outputPath = path.join(
          __dirname,
          "public/documentosSecretaria/formulario_rellenable.pdf"
        );
        await fs.writeFile(outputPath, modifiedPdfBytes);

        const pdfUrl = "public/documentosSecretaria/formulario_rellenable.pdf"; // Ruta correcta para el <iframe>
        res.render("pdfs", { pdfUrl });
      } catch (error) {
        console.error("Error al crear el PDF rellenable:", error);
        res.status(500).send("Error al generar el PDF");
      }
        */
      /*CITA PREVIA
      try {
        const pdfPath = path.join(
          __dirname,
          "public/documentosSecretaria/cita_previa.pdf"
        );
        const pdfBytes = await fs.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const page = pdfDoc.getPages()[0];
        const form = pdfDoc.getForm();

        // Añadir campos rellenables

        form
          .createTextField("nombre_completo")
          .addToPage(page, { x: 73, y: 618, width: 180, height: 12 });
        form
          .createTextField("documento_identificacion")
          .addToPage(page, { x: 354, y: 618, width: 110, height: 12 });
        form
          .createTextField("dia_cita")
          .addToPage(page, { x: 336, y: 604, width: 87, height: 12 });
        form
          .createTextField("hora_cita")
          .addToPage(page, { x: 451, y: 604, width: 50, height: 12 });

        form
          .createTextField("medico")
          .addToPage(page, { x: 307, y: 578, width: 178, height: 12 });
        form
          .createTextField("especialidad")
          .addToPage(page, { x: 86, y: 563, width: 174, height: 12 });
        form
          .createTextField("persona_que_cita")
          .addToPage(page, { x: 273, y: 398, width: 174, height: 12 });

        const modifiedPdfBytes = await pdfDoc.save();
        const outputPath = path.join(
          __dirname,
          "public/documentosSecretaria/cita_previa_rellenable.pdf"
        );
        await fs.writeFile(outputPath, modifiedPdfBytes);

        const pdfUrl = "public/documentosSecretaria/cita_previa_rellenable.pdf"; // Ruta correcta para el <iframe>
        res.render("pdfs", { pdfUrl });
      } catch (error) {
        console.error("Error al crear el PDF rellenable:", error);
        res.status(500).send("Error al generar el PDF");
      }*/
      /*CONSENTIMIENTO INFORMADO
        try {
        const pdfPath = path.join(
          __dirname,
          "public/documentosSecretaria/Consentimiento_paciente.pdf"
        );
        const pdfBytes = await fs.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const page = pdfDoc.getPages()[0];
        const form = pdfDoc.getForm();

        // Añadir campos rellenables

        form
          .createTextField("nombre_completo")
          .addToPage(page, { x: 73, y: 618, width: 184, height: 12 });
        form
          .createTextField("documento_identificacion")
          .addToPage(page, { x: 354, y: 618, width: 110, height: 12 });
        form
          .createTextField("diaa")
          .addToPage(page, { x: 213, y: 604, width: 87, height: 12 });

        form
          .createTextField("nombre_prueba")
          .addToPage(page, { x: 242, y: 340, width: 268, height: 12 });
        form
          .createTextField("medico")
          .addToPage(page, { x: 215, y: 314, width: 268, height: 12 });

        const modifiedPdfBytes = await pdfDoc.save();
        const outputPath = path.join(
          __dirname,
          "public/documentosSecretaria/Consentimiento_paciente_rellenable.pdf"
        );
        await fs.writeFile(outputPath, modifiedPdfBytes);

        const pdfUrl =
          "public/documentosSecretaria/Consentimiento_paciente_rellenable.pdf"; // Ruta correcta para el <iframe>
        res.render("pdfs", { pdfUrl });
      } catch (error) {
        console.error("Error al crear el PDF rellenable:", error);
        res.status(500).send("Error al generar el PDF");
      }*/
      /*JUSTIFICANTE
      try {
        const pdfPath = path.join(
          __dirname,
          "public/documentosSecretaria/justificante_paciente.pdf"
        );
        const pdfBytes = await fs.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const page = pdfDoc.getPages()[0];
        const form = pdfDoc.getForm();

        // Añadir campos rellenables

        form
          .createTextField("nombre_completo")
          .addToPage(page, { x: 350, y: 611, width: 184, height: 12 });
        form
          .createTextField("documento_identificacion")
          .addToPage(page, { x: 164, y: 597, width: 110, height: 12 });
        form
          .createTextField("dia")
          .addToPage(page, { x: 100, y: 583, width: 87, height: 12 });

        form
          .createTextField("medico")
          .addToPage(page, { x: 225, y: 418, width: 300, height: 12 });

        const modifiedPdfBytes = await pdfDoc.save();
        const outputPath = path.join(
          __dirname,
          "public/documentosSecretaria/justificante_paciente_rellenable.pdf"
        );
        await fs.writeFile(outputPath, modifiedPdfBytes);

        const pdfUrl =
          "public/documentosSecretaria/justificante_paciente_rellenable.pdf"; // Ruta correcta para el <iframe>
        res.render("pdfs", { pdfUrl });
      } catch (error) {
        console.error("Error al crear el PDF rellenable:", error);
        res.status(500).send("Error al generar el PDF");
      }*/
      /*  try {
        const pdfPath = path.join(
          __dirname,
          "public/documentosSecretaria/Receta_medica.pdf"
        );
        const pdfBytes = await fs.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const page = pdfDoc.getPages()[0];
        const form = pdfDoc.getForm();

        // Añadir campos rellenables

        form
          .createTextField("nombre_completo")
          .addToPage(page, { x: 350, y: 633, width: 184, height: 12 });
        form
          .createTextField("documento_identificacion")
          .addToPage(page, { x: 164, y: 618, width: 110, height: 12 });
        form
          .createTextField("dia")
          .addToPage(page, { x: 101, y: 604, width: 87, height: 12 });
        form
          .createTextField("medico")
          .addToPage(page, { x: 215, y: 243, width: 150, height: 12 });

        const modifiedPdfBytes = await pdfDoc.save();
        const outputPath = path.join(
          __dirname,
          "public/documentosSecretaria/receta_medica_rellenable.pdf"
        );
        await fs.writeFile(outputPath, modifiedPdfBytes);
  */
      try {
        const pdfUrl =
          "../documentosSecretaria/pdfs_rellenables/cita_previa_rellenable.pdf"; // Ruta correcta para el <iframe>
        res.render("pdfs", { pdfUrl });
      } catch (error) {
        console.error("Error al crear el PDF rellenable:", error);
        res.status(500).send("Error al generar el PDF");
      }
};

export const consultarManual = async (req, res) => {


    try {


      const info = {
  ...res.locals.contexto,
      };

      return res.render("visorManualUsuario", { info });


    } catch (err) {
      res.status(500).send("Ocurrio un error al conectar con el servidor");

    }
};

export const documentos = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol

        const info = {
      ...res.locals.contexto,
        };
        switch(rol){

          case 'medico':
            res.render("medico/documentos/documentosHome", { info });
            break
          case 'secretario':
            res.render("secretaria/documentos/documentosHome", { info });
            break
          default:
            res.status(403).send('no autorizado');
        }




      } catch (error) {
        console.error("Error en /documentos:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const documentosListaEmitirDocumento = async (req, res) => {
  const data = req.usuario;

     try {
       const rol = data.rol

       const info = {
      ...res.locals.contexto,
       };
       switch(rol){

        case 'medico':
           res.render("medico/documentos/listaEmitirDocumento", { info });
           break
        case 'secretario':
           res.render("secretaria/documentos/listaEmitirDocumento", { info });
           break
        default:
            res.status(403).send('no autorizado');
       }

     } catch (error) {
       console.error("Error en /documentos/listaEmitirDocumento:", error);
       res.status(500).send("Error interno del servidor");
     }
};

export const documentosVisorDocumentoWeb = async (req, res) => {
  const data = req.usuario;

    try {
      const rol = data.rol
      const tipo_documento = req.query.tipo_documento;




      const info = {
      ...res.locals.contexto,
      };
      switch(rol){

        case 'medico':
          if (tipo_documento === "consentimiento_paciente") {
            res.render("medico/documentos/emitirDocumento/emitir_Documento_consentiminetoPaciente",{ info });
          } else if (tipo_documento === "justificante_paciente") {

            res.render("medico/documentos/emitirDocumento/emitir_Documento_justificantePaciente",{ info }
            );
          } else if (tipo_documento === "consentimiento_paciente") {

            res.render("medico/documentos/emitirDocumento/emitir_Documento_consentiminetoPaciente",    { info }  );
          } else if (tipo_documento === "receta_medica") {
            res.render("medico/documentos/emitirDocumento/emitir_Documento_recetaMedica",{ info });
          }
          break
        case 'secretario':
          if (tipo_documento === "cita_previa") {
            res.render("secretaria/documentos/emitirDocumento/emitir_Documento_citaPrevia",{ info });
          } else if (tipo_documento === "consentimiento_paciente") {
            res.render("secretaria/documentos/emitirDocumento/emitir_Documento_consentiminetoPaciente",{ info });
          }
          break
        default:
          res.status(403).send('no autorizado');
        }



    } catch (error) {
      console.error("Error en /comunicacionHome:", error);
      res.status(500).send("Error interno del servidor");
    }
};

export const documentosListaDocumentos = async (req, res) => {
  const data = req.usuario;

     try {
       const rol = data.rol

       const info = {
      ...res.locals.contexto,
       };
       switch(rol){

         case 'medico':
             res.render("medico/documentos/listaDocumentos", { info });
             break
         case 'secretario':
            res.render("secretaria/documentos/listaDocumentos", { info });
            break
          default:
            res.status(403).send('no autorizado');
       }
       res.status(500).send



     } catch (error) {
       console.error("Error en /documentos/listaDocumentos:", error);
       res.status(500).send("Error interno del servidor");
     }
};

export const documentosImprimirDocumento = async (req, res) => {
  const data = req.usuario;

    try {
      const rol = data.rol
      const tipo_documento = req.query.tipo_documento;




      let pdfUrl;

      if (tipo_documento === "cita_previa") {
        pdfUrl = "/public/documentosSecretaria/pdfs_imprimir/cita_previa.pdf";
      }
      if (tipo_documento === "consentimiento_paciente") {
        pdfUrl =
          "/public/documentosSecretaria/pdfs_imprimir/consentimiento_paciente.pdf";
      }
      if (tipo_documento === "registro_paciente") {
        pdfUrl =
          "/public/documentosSecretaria/pdfs_imprimir/registro_paciente.pdf";
      }
      if (tipo_documento === "justificante_paciente") {
        pdfUrl =
          "/public/documentosSecretaria/pdfs_imprimir/justificante_paciente.pdf";
      }
      if (tipo_documento === "receta_medica") {
        pdfUrl = "/public/documentosSecretaria/pdfs_imprimir/receta_medica.pdf";
      }

      const info = {
      ...res.locals.contexto,
        url: pdfUrl,
      };

      switch(rol){

        case 'medico':
          res.render("medico/documentos/imprimirDocumento", { info });
          break
        case 'secretario':
          res.render("secretaria/documentos/imprimirDocumento", { info });
          break
        default:
          res.status(403).send('no autorizado');
      }



    } catch (error) {
      console.error("Error en /documentos/imprimirDocumento:", error);
      res.status(500).send("Error interno del servidor");
    }
};

export const documentosTodosDocumentos = async (req, res) => {
  const data = req.usuario;

     try {
       const rol = data.rol

       let info = {
      ...res.locals.contexto,
       };
       switch(rol){

        case 'medico':

          const filasDocumentosMedico = await recuperarTodosLosDocumentosHospitalMedico();
          info={
            ...info,
            filasDocumentos: filasDocumentosMedico,

          }
          res.render("medico/documentos/todos_Documentos", { info });
             break
        case 'secretario':
          const filasDocumentosSecretario = await recuperarTodosLosDocumentosHospitalSecretario();
          info={
            ...info,
            filasDocumentos:filasDocumentosSecretario,

          }
          res.render("secretaria/documentos/todos_Documentos", { info });
          break
        default:
            res.status(403).send('no autorizado');
       }
       res.status(500).send



     } catch (error) {
       console.error("Error en /documentos/listaDocumentos:", error);
       res.status(500).send("Error interno del servidor");
     }
};

export const documentosVisorDocumento = async (req, res) => {
  const data = req.usuario;

      try {
        const rol = data.rol
        const idDocumento = req.query.idDocumento;

        const info = {
      ...res.locals.contexto,
          idDocumento: idDocumento,
        };

        switch(rol){
          case 'medico':
            res.render("medico/documentos/visorDocumentoTabla", { info });
               break
          case 'secretario':
            res.render("secretaria/documentos/visorDocumentoTabla", { info });
            break
          default:
              res.status(403).send('no autorizado');
         }
         return

      } catch (error) {
        console.error("Error en /documentos/listaDocumentos:", error);
        res.status(500).send("Error interno del servidor");
      }
};

export const secretariaTramitarRegistro = async (req, res) => {
  const data = req.usuario;
      const peticionId = req.query.id;

      try {
        const rol = data.rol

        if(rol!='secretario'){
          return res.status(403).send("Usuario no Autorizado")
        }

        const campos = await recuperarCamposTramite(peticionId);

        const info = {
      ...res.locals.contexto,
          campos: campos,
        };
        res.render("secretaria/registrarPacienteDirecto", { info });
      }catch (error) {
        console.error(error)
        return res.status(500).send("Error al conectar con el servidor")
      }
};

export const secretariaDocumentosBandejaEntradaDocumentos = async (req, res) => {
  const data = req.usuario;

        try {
          // La lista de chat ya viene ordenada en el contexto del usuario.
          const filasDocumentos =
            await recuperarTodosLosDocumentosBandeja();

          const info = {
      ...res.locals.contexto,
            filasDocumentos: filasDocumentos,
          };

          res.render("secretaria/documentos/bandejaEntradaDocumentos", { info });
        } catch (err) {}
};

export const enviarBandejaDocumentosHandler = async (req, res) => {
  //Comprboar campos sintacticamente y logimcamente correctos
  try {
    await enviarBandejaDocumentos(req.body);
    res.send({ success: true });
  } catch (err) {
    res.send({ success: false });
  }
};

export const generarPdfHandler = async (req, res) => {
  const { tipo_documento, campos } = req.body;

  try {
    // Verificar si el paciente existe
    const existe = await verificarExistePaciente(
      campos.documento_identificacion
    );

    // Caso especial para "registro_paciente"
    if (tipo_documento === "registro_paciente") {
      if (existe.success) {
        return res.send({
          success: false,
          message:
            "El paciente con este documento de identificación ya está registrado en el sistema",
        });
      }
    } else {
      // Para otros tipos de documentos, el paciente debe existir
      if (!existe.success) {
        return res.send({
          success: false,
          message:
            "El paciente con este número de identificación NO existe en el sistema",
        });
      }
    }

    // Generar el PDF
    const pdfId = await generarPdf(tipo_documento, campos);

    // Verificar si se generó el PDF correctamente
    if (!pdfId) {
      return res.status(500).json({
        success: false,
        message: "Error al generar el PDF",
      });
    }

    // Enviar respuesta exitosa
    return res.send({
      success: true,
      pdfId: pdfId,
    });
  } catch (error) {
    logs.error(error)
    return res.send({
      success: false,
      message: "Error interno al generar el PDF",
    });
  }
};

export const accionPdfHandler = async (req, res) => {
  const { accion, pdfId } = req.body;
  if (accion || pdfId) {
    const bool = await accionPdf(accion, pdfId);
    if (bool) {
      res.send({ success: true });
    } else {
      res.res({ success: false });
    }
  } else {
    res.res({ success: false });
  }
};

export const descartarPeticionDeDocumento = async (req, res) => {
  const peticionId = req.body.peticionDocID;
  const result = await descartarPeticionDocumento(peticionId);
  res.send({ success: result });
};
