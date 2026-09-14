/**
 * Repositorio de documentos
 *
 * Documentacion oficial del hospital: generacion, bandeja y tramites.
 *
 * Acceso a datos unicamente: no contiene logica de presentacion ni HTTP.
 */
import { pool } from "../db/pool.js";
import { logs } from "../services/logs.service.js";
import path from "path";
import fs from "fs/promises";
import { PDFDocument } from "pdf-lib";

export async function generarPdf(tipo_documento, campos) {
  const __dirname = path.dirname(".");
  if (tipo_documento === "cita_previa") {
    try {
      const pdfPath = path.join(
        __dirname,
        "public/documentosSecretaria/pdfs_imprimir/cita_previa.pdf"
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

      // Incrustar una fuente para dibujar el texto

      // Añadir los campos como texto estático (no editable)
      const nombre = form.getTextField("nombre_completo");
      nombre.setText(campos.nombre_completo);
      nombre.enableReadOnly();
      const documento_identificacion = form.getTextField(
        "documento_identificacion"
      );
      documento_identificacion.setText(campos.documento_identificacion);
      documento_identificacion.enableReadOnly();

      const dia_cita = form.getTextField("dia_cita");
      dia_cita.setText(campos.dia_cita);
      dia_cita.enableReadOnly();

      const hora_cita = form.getTextField("hora_cita");
      hora_cita.setText(campos.hora_cita);
      hora_cita.enableReadOnly();

      const medico = form.getTextField("medico");
      medico.setText(campos.medico);
      medico.enableReadOnly();

      const especialidad = form.getTextField("especialidad");
      especialidad.setText(campos.especialidad);
      especialidad.enableReadOnly();

      const persona_que_cita = form.getTextField("persona_que_cita");
      persona_que_cita.setText(campos.persona_que_cita);
      persona_que_cita.enableReadOnly();

      if (campos.firma && campos.firma.startsWith("data:image/png;base64,")) {
        const firmaBase64 = campos.firma.split(",")[1]; // eliminar "data:image/png;base64,"
        const firmaBytes = Buffer.from(firmaBase64, "base64");

        const firmaImage = await pdfDoc.embedPng(firmaBytes);

        const firmaDims = firmaImage.scale(0.5); // Escalamos la imagen (ajustable)

        // Posición y tamaño de la firma en el PDF
        page.drawImage(firmaImage, {
          x: 90, // Cambia según la ubicación deseada
          y: 150, // Cambia según la ubicación deseada
          width: firmaDims.width,
          height: firmaDims.height,
        });
      }
      const modifiedPdfBytes = await pdfDoc.save();
      const now = new Date();
      const timestamp =
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, "0") + // Mes (0-11, por eso +1)
        String(now.getDate()).padStart(2, "0") + // Día
        String(now.getHours()).padStart(2, "0") + // Horas
        String(now.getMinutes()).padStart(2, "0") + // Minutos
        String(now.getSeconds()).padStart(2, "0"); // Segundos

      const pdfUrl =
        "/public/documentosSecretaria/cita_previa_" +
        campos.documento_identificacion +
        "_" +
        timestamp +
        ".pdf";

      const [result] = await pool.query(
        "INSERT INTO documentos_hospital (nombre_archivo, archivo, fecha_emision, documento_identificacion, tipo_documento, nombre_paciente) VALUES (?, ?, ?, ?, ?, ?)",
        [
          `cita_previa_${campos.documento_identificacion}_${timestamp}.pdf`,
          Buffer.from(modifiedPdfBytes),
          new Date(),
          campos.documento_identificacion, // documento_identificacion
          "cita_previa",
          campos.nombre_completo,
        ] // fecha_emision (formato YYYY-MM-DD)]
      );
      const idInsertado = result.insertId;

      const outputPath = path.join(__dirname, pdfUrl);
      await fs.writeFile(outputPath, modifiedPdfBytes);

      return idInsertado;
    } catch (error) {
      logs.error(error)
      return "error al crear documento";
    }
  } else if (tipo_documento === "consentimiento_paciente") {
    try {
      const pdfPath = path.join(
        __dirname,
        "public/documentosSecretaria/pdfs_imprimir/consentimiento_paciente.pdf"
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
        .createTextField("fecha_visita")
        .addToPage(page, { x: 213, y: 604, width: 87, height: 12 });

      form
        .createTextField("nombre_prueba")
        .addToPage(page, { x: 242, y: 340, width: 268, height: 12 });
      form
        .createTextField("medico")
        .addToPage(page, { x: 215, y: 313, width: 268, height: 12 });

      const nombre = form.getTextField("nombre_completo");
      nombre.setText(campos.nombre_completo);
      nombre.enableReadOnly();
      const documento_identificacion = form.getTextField(
        "documento_identificacion"
      );
      documento_identificacion.setText(campos.documento_identificacion);
      documento_identificacion.enableReadOnly();

      const fecha_visita = form.getTextField("fecha_visita");
      fecha_visita.setText(campos.fecha_visita);
      fecha_visita.enableReadOnly();

      const medico = form.getTextField("medico");
      medico.setText(campos.medico_tratante);
      medico.enableReadOnly();

      const nombre_prueba = form.getTextField("nombre_prueba");
      nombre_prueba.setText(campos.nombre_procedimiento);
      nombre_prueba.enableReadOnly();

      if (campos.firma && campos.firma.startsWith("data:image/png;base64,")) {
        const firmaBase64 = campos.firma.split(",")[1]; // eliminar "data:image/png;base64,"
        const firmaBytes = Buffer.from(firmaBase64, "base64");

        const firmaImage = await pdfDoc.embedPng(firmaBytes);

        const firmaDims = firmaImage.scale(0.5); // Escalamos la imagen (ajustable)

        // Posición y tamaño de la firma en el PDF
        page.drawImage(firmaImage, {
          x: 180, // Cambia según la ubicación deseada
          y: 100, // Cambia según la ubicación deseada
          width: firmaDims.width,
          height: firmaDims.height,
        });
      }
      if (
        campos.firmaMed &&
        campos.firmaMed.startsWith("data:image/png;base64,")
      ) {
        const firmaBase64 = campos.firmaMed.split(",")[1]; // eliminar "data:image/png;base64,"
        const firmaBytes = Buffer.from(firmaBase64, "base64");

        const firmaImage = await pdfDoc.embedPng(firmaBytes);

        const firmaDims = firmaImage.scale(0.5); // Escalamos la imagen (ajustable)

        // Posición y tamaño de la firma en el PDF
        page.drawImage(firmaImage, {
          x: 170, // Cambia según la ubicación deseada
          y: 250, // Cambia según la ubicación deseada
          width: firmaDims.width,
          height: firmaDims.height,
        });
      }
      const modifiedPdfBytes = await pdfDoc.save();
      const now = new Date();
      const timestamp =
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, "0") + // Mes (0-11, por eso +1)
        String(now.getDate()).padStart(2, "0") + // Día
        String(now.getHours()).padStart(2, "0") + // Horas
        String(now.getMinutes()).padStart(2, "0") + // Minutos
        String(now.getSeconds()).padStart(2, "0"); // Segundos

      const pdfUrl =
        "/public/documentosSecretaria/consentimiento_paciente_" +
        campos.documento_identificacion +
        "_" +
        timestamp +
        ".pdf";

      const [result] = await pool.query(
        "INSERT INTO documentos_hospital (nombre_archivo, archivo, fecha_emision, documento_identificacion, tipo_documento, nombre_paciente) VALUES (?, ?, ?, ?, ?, ?)",
        [
          `consentimiento_paciente_${campos.documento_identificacion}_${timestamp}.pdf`,
          Buffer.from(modifiedPdfBytes),
          new Date(),
          campos.documento_identificacion, // documento_identificacion
          "consentimiento_paciente",
          campos.nombre_completo,
        ]
      );
      const idInsertado = result.insertId;

      const outputPath = path.join(__dirname, pdfUrl);
      await fs.writeFile(outputPath, modifiedPdfBytes);

      return idInsertado;
    } catch (error) {
      logs.error(error)
      throw new Error("Error al generar el PDF");
    }
  } else if (tipo_documento === "justificante_paciente") {
    try {
      const pdfPath = path.join(
        __dirname,
        "public/documentosSecretaria/pdfs_imprimir/justificante_paciente.pdf"
      );
      const pdfBytes = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[0];
      const form = pdfDoc.getForm();

      // Añadir campos rellenables

      form
        .createTextField("nombre_completo")
        .addToPage(page, { x: 350, y: 610, width: 184, height: 12 });
      form
        .createTextField("documento_identificacion")
        .addToPage(page, { x: 164, y: 596, width: 110, height: 12 });
      form
        .createTextField("dia")
        .addToPage(page, { x: 100, y: 582, width: 87, height: 12 });

      form
        .createTextField("medico")
        .addToPage(page, { x: 225, y: 417, width: 300, height: 12 });

      const nombre = form.getTextField("nombre_completo");
      nombre.setText(campos.nombre_completo);
      nombre.enableReadOnly();
      const documento_identificacion = form.getTextField(
        "documento_identificacion"
      );
      documento_identificacion.setText(campos.documento_identificacion);
      documento_identificacion.enableReadOnly();

      const medico = form.getTextField("medico");
      medico.setText(campos.medico);
      medico.enableReadOnly();

      const dia = form.getTextField("dia");
      dia.setText(campos.dia);
      dia.enableReadOnly();

      if (
        campos.firmaMed &&
        campos.firmaMed.startsWith("data:image/png;base64,")
      ) {
        const firmaBase64 = campos.firmaMed.split(",")[1]; // eliminar "data:image/png;base64,"
        const firmaBytes = Buffer.from(firmaBase64, "base64");

        const firmaImage = await pdfDoc.embedPng(firmaBytes);

        const firmaDims = firmaImage.scale(0.5); // Escalamos la imagen (ajustable)

        // Posición y tamaño de la firma en el PDF
        page.drawImage(firmaImage, {
          x: 110, // Cambia según la ubicación deseada
          y: 200, // Cambia según la ubicación deseada
          width: firmaDims.width,
          height: firmaDims.height,
        });
      }
      const modifiedPdfBytes = await pdfDoc.save();
      const now = new Date();
      const timestamp =
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, "0") + // Mes (0-11, por eso +1)
        String(now.getDate()).padStart(2, "0") + // Día
        String(now.getHours()).padStart(2, "0") + // Horas
        String(now.getMinutes()).padStart(2, "0") + // Minutos
        String(now.getSeconds()).padStart(2, "0"); // Segundos

      const pdfUrl =
        "/public/documentosSecretaria/justificante_paciente_" +
        campos.documento_identificacion +
        "_" +
        timestamp +
        ".pdf";

      const [result] = await pool.query(
        "INSERT INTO documentos_hospital (nombre_archivo, archivo, fecha_emision, documento_identificacion, tipo_documento, nombre_paciente) VALUES (?, ?, ?, ?, ?,?)",
        [
          `justificante_paciente_${campos.documento_identificacion}_${timestamp}.pdf`,
          Buffer.from(modifiedPdfBytes),
          new Date(),
          campos.documento_identificacion, // documento_identificacion
          "justificante_paciente",
          campos.nombre_completo,
        ] // fecha_emision (formato YYYY-MM-DD)]
      );
      const idInsertado = result.insertId;

      const outputPath = path.join(__dirname, pdfUrl);
      await fs.writeFile(outputPath, modifiedPdfBytes);

      return idInsertado;
    } catch (error) {
      logs.error(error)
      throw new Error("Error al generar el PDF");
    }
  } else if (tipo_documento === "receta_medica") {
    try {
      const pdfPath = path.join(
        __dirname,
        "public/documentosSecretaria/pdfs_imprimir/receta_medica.pdf"
      );
      const pdfBytes = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[0];
      const form = pdfDoc.getForm();

      // Añadir campos rellenables
      form
        .createTextField("nombre_completo")
        .addToPage(page, { x: 350, y: 631, width: 184, height: 12 });
      form
        .createTextField("documento_identificacion")
        .addToPage(page, { x: 164, y: 617, width: 110, height: 12 });
      form
        .createTextField("dia")
        .addToPage(page, { x: 101, y: 603, width: 87, height: 12 });
      form
        .createTextField("medico")
        .addToPage(page, { x: 215, y: 241, width: 150, height: 12 });

      const medicamentosField = form.createTextField(
        "medicamentos_prescritos"
      );
      medicamentosField.addToPage(page, {
        x: 70, // Posición X
        y: 379, // Posición Y
        width: 470, // Ancho
        height: 168, // Altura
        multiline: true, // Habilita multilínea
        fontSize: 10, // Tamaño de fuente
        borderWidth: 1, // Borde visible
      });
      medicamentosField.setText(campos.medicamentos_prescritos);

      medicamentosField.enableMultiline(); // Asegurar que sea multilínea
      medicamentosField.setFontSize(10); // Asegurar el tamaño de fuente
      medicamentosField.enableReadOnly(); // Hacer el campo de solo lectura

      const nombre = form.getTextField("nombre_completo");
      nombre.setText(campos.nombre_completo);
      nombre.enableReadOnly();
      const documento_identificacion = form.getTextField(
        "documento_identificacion"
      );
      documento_identificacion.setText(campos.documento_identificacion);
      documento_identificacion.enableReadOnly();

      const medico = form.getTextField("medico");
      medico.setText(campos.medico);
      medico.enableReadOnly();

      const dia = form.getTextField("dia");
      dia.setText(campos.dia);
      dia.enableReadOnly();

      if (
        campos.firmaMed &&
        campos.firmaMed.startsWith("data:image/png;base64,")
      ) {
        const firmaBase64 = campos.firmaMed.split(",")[1]; // eliminar "data:image/png;base64,"
        const firmaBytes = Buffer.from(firmaBase64, "base64");

        const firmaImage = await pdfDoc.embedPng(firmaBytes);

        const firmaDims = firmaImage.scale(0.5); // Escalamos la imagen (ajustable)

        // Posición y tamaño de la firma en el PDF
        page.drawImage(firmaImage, {
          x: 110, // Cambia según la ubicación deseada
          y: 120, // Cambia según la ubicación deseada
          width: firmaDims.width,
          height: firmaDims.height,
        });
      }
      const modifiedPdfBytes = await pdfDoc.save();
      const now = new Date();
      const timestamp =
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, "0") + // Mes (0-11, por eso +1)
        String(now.getDate()).padStart(2, "0") + // Día
        String(now.getHours()).padStart(2, "0") + // Horas
        String(now.getMinutes()).padStart(2, "0") + // Minutos
        String(now.getSeconds()).padStart(2, "0"); // Segundos

      const pdfUrl =
        "/public/documentosSecretaria/receta_medica_" +
        campos.documento_identificacion +
        "_" +
        timestamp +
        ".pdf";

      const [result] = await pool.query(
        "INSERT INTO documentos_hospital (nombre_archivo, archivo, fecha_emision, documento_identificacion, tipo_documento, nombre_paciente) VALUES (?, ?, ?, ?, ?,?)",
        [
          `receta_medica_${campos.documento_identificacion}_${timestamp}.pdf`,
          Buffer.from(modifiedPdfBytes),
          new Date(),
          campos.documento_identificacion, // documento_identificacion
          "receta_medica",
          campos.nombre_completo,
        ]
      );
      const idInsertado = result.insertId;

      const outputPath = path.join(__dirname, pdfUrl);
      await fs.writeFile(outputPath, modifiedPdfBytes);

      return idInsertado;
    } catch (error) {
      logs.error(error)
      throw new Error("Error al generar el PDF");
    }
  } else if (tipo_documento === "registro_paciente") {
    try {
      const pdfPath = path.join(
        __dirname,
        "public/documentosSecretaria/pdfs_imprimir/registro_paciente.pdf"
      );
      const pdfBytes = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[0];

      const page1 = pdfDoc.getPages()[1];
      const form = pdfDoc.getForm();

      // Añadir campos rellenables
      form
        .createTextField("documento_identificacion")
        .addToPage(page, { x: 225, y: 625, width: 310, height: 22 });
      form
        .createTextField("nombreRegistro")
        .addToPage(page, { x: 225, y: 593, width: 310, height: 22 });
      form
        .createTextField("apellido1Registro")
        .addToPage(page, { x: 225, y: 561, width: 310, height: 22 });
      form
        .createTextField("apellido2Registro")
        .addToPage(page, { x: 225, y: 528, width: 310, height: 22 });
      form
        .createTextField("fecha_nacimientoRegistro")
        .addToPage(page, { x: 335, y: 500, width: 77, height: 19 }); // 2 dígitos

      // Casillas para 'Sexo'
      form
        .createCheckBox("sexoHombre")
        .addToPage(page, { x: 244, y: 476, width: 10, height: 10 });
      form
        .createCheckBox("sexoMujer")
        .addToPage(page, { x: 244, y: 462, width: 10, height: 10 });
      form
        .createCheckBox("sexoOtro")
        .addToPage(page, { x: 244, y: 448, width: 10, height: 10 });

      form
        .createTextField("direccionRegistro")
        .addToPage(page, { x: 225, y: 415, width: 310, height: 22 });
      form
        .createTextField("telefonoRegistro")
        .addToPage(page, { x: 225, y: 377, width: 310, height: 22 });

      form
        .createTextField("nacionalidadRegistro")
        .addToPage(page, { x: 225, y: 343, width: 310, height: 22 });

      form
        .createTextField("correo_electronicoRegistro")
        .addToPage(page, { x: 225, y: 307, width: 310, height: 22 });

      form
        .createTextField("persona_emergenciaRegistro")
        .addToPage(page, { x: 225, y: 262, width: 310, height: 22 });

      form
        .createTextField("parentescoRegistro")
        .addToPage(page, { x: 225, y: 220, width: 310, height: 22 });

      form
        .createTextField("contacto_emergenciaRegistro")
        .addToPage(page, { x: 225, y: 160, width: 310, height: 22 });

      form
        .createTextField("diaActual")
        .addToPage(page1, { x: 291, y: 80, width: 124, height: 19 });

      const documento_identificacion = form.getTextField(
        "documento_identificacion"
      );
      documento_identificacion.setText(campos.documento_identificacion);
      documento_identificacion.enableReadOnly();

      const nombreRegistro = form.getTextField("nombreRegistro");
      nombreRegistro.setText(campos.nombreRegistro);
      nombreRegistro.enableReadOnly();

      const apellido1Registro = form.getTextField("apellido1Registro");
      apellido1Registro.setText(campos.apellido1Registro);
      apellido1Registro.enableReadOnly();

      const apellido2Registro = form.getTextField("apellido2Registro");
      apellido2Registro.setText(campos.apellido2Registro);
      apellido2Registro.enableReadOnly();

      const fecha_nacimientoRegistro = form.getTextField(
        "fecha_nacimientoRegistro"
      );
      fecha_nacimientoRegistro.setText(campos.fecha_nacimientoRegistro);
      fecha_nacimientoRegistro.enableReadOnly();

      const sexoHombre = form.getCheckBox("sexoHombre");
      const sexoMujer = form.getCheckBox("sexoMujer");
      const sexoOtro = form.getCheckBox("sexoOtro");

      if (campos.sexoRegistro === "hombre") {
        sexoHombre.check();
        sexoHombre.enableReadOnly();
        sexoMujer.enableReadOnly();
        sexoOtro.enableReadOnly();
      } else if (campos.sexoRegistro === "mujer") {
        sexoMujer.check();
        sexoHombre.enableReadOnly();
        sexoMujer.enableReadOnly();
        sexoOtro.enableReadOnly();
      } else {
        sexoOtro.check();
        sexoHombre.enableReadOnly();
        sexoMujer.enableReadOnly();
        sexoOtro.enableReadOnly();
      }
      const direccionRegistro = form.getTextField("direccionRegistro");
      direccionRegistro.setText(campos.direccionRegistro);
      direccionRegistro.enableReadOnly();

      const telefonoRegistro = form.getTextField("telefonoRegistro");
      telefonoRegistro.setText(campos.telefonoRegistro);
      telefonoRegistro.enableReadOnly();

      const nacionalidadRegistro = form.getTextField("nacionalidadRegistro");
      nacionalidadRegistro.setText(campos.nacionalidadRegistro);
      nacionalidadRegistro.enableReadOnly();

      const correo_electronicoRegistro = form.getTextField(
        "correo_electronicoRegistro"
      );
      correo_electronicoRegistro.setText(campos.correo_electronicoRegistro);
      correo_electronicoRegistro.enableReadOnly();

      const contacto_emergenciaRegistro = form.getTextField(
        "contacto_emergenciaRegistro"
      );
      contacto_emergenciaRegistro.setText(campos.contacto_emergenciaRegistro);
      contacto_emergenciaRegistro.enableReadOnly();

      const persona_emergenciaRegistro = form.getTextField(
        "persona_emergenciaRegistro"
      );
      persona_emergenciaRegistro.setText(campos.persona_emergenciaRegistro);
      persona_emergenciaRegistro.enableReadOnly();

      const parentescoRegistro = form.getTextField("parentescoRegistro");
      parentescoRegistro.setText(campos.parentescoRegistro);
      parentescoRegistro.enableReadOnly();

      const now = new Date();

      const instante =
        now.getFullYear() +
        "/" +
        now.getMonth() +
        "/" +
        now.getDay() +
        " (" +
        now.getHours() +
        ":" +
        now.getMinutes() +
        ":" +
        now.getSeconds() +
        ")";

      // Establecer el texto formateado

      const diaActual = form.getTextField("diaActual");
      diaActual.setText(instante);
      diaActual.enableReadOnly();

      if (campos.firma && campos.firma.startsWith("data:image/png;base64,")) {
        const firmaBase64 = campos.firma.split(",")[1]; // eliminar "data:image/png;base64,"
        const firmaBytes = Buffer.from(firmaBase64, "base64");

        const firmaImage = await pdfDoc.embedPng(firmaBytes);

        const firmaDims = firmaImage.scale(0.5); // Escalamos la imagen (ajustable)

        // Posición y tamaño de la firma en el PDF
        page1.drawImage(firmaImage, {
          x: 110, // Cambia según la ubicación deseada
          y: 90, // Cambia según la ubicación deseada
          width: firmaDims.width,
          height: firmaDims.height,
        });
      }
      const modifiedPdfBytes = await pdfDoc.save();
      const timestamp =
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, "0") + // Mes (0-11, por eso +1)
        String(now.getDate()).padStart(2, "0") + // Día
        String(now.getHours()).padStart(2, "0") + // Horas
        String(now.getMinutes()).padStart(2, "0") + // Minutos
        String(now.getSeconds()).padStart(2, "0"); // Segundos

      const pdfUrl =
        "/public/documentosSecretaria/registro_paciente_" +
        campos.documento_identificacion +
        "_" +
        timestamp +
        ".pdf";

      const nombre_completo =
        campos.nombreRegistro +
        " " +
        campos.apellido1Registro +
        " " +
        campos.apellido2Registro;
      const [result] = await pool.query(
        "INSERT INTO documentos_hospital (nombre_archivo, archivo, fecha_emision, documento_identificacion, tipo_documento, nombre_paciente) VALUES (?, ?, ?, ?, ?,?)",
        [
          `registro_paciente_${campos.documento_identificacion}_${timestamp}.pdf`,
          Buffer.from(modifiedPdfBytes),
          new Date(),
          campos.documento_identificacion, // documento_identificacion
          "registro_paciente",
          nombre_completo,
        ]
      );
      const idInsertado = result.insertId;

      const outputPath = path.join(__dirname, pdfUrl);
      await fs.writeFile(outputPath, modifiedPdfBytes);

      return idInsertado;
    } catch (error) {
      logs.error(error)
      throw new Error("Error al generar el PDF");
    }
  }
}

export async function recuperarPdf(id) {
  try {
    const [rows] = await pool.query(
      "SELECT archivo FROM documentos_hospital WHERE id_documento = ?",
      [id]
    );

    // Verificar si se encontró un registro
    if (rows.length === 0) {
      return null; 
    }

    return rows[0].archivo; // Devolver el buffer del archivo
  } catch (error) {
    logs.error(error)
    throw error; 
  }
}

export async function accionPdf(accion, pdfId) {
  let query = "";

  if (accion === "confirmar") {
    query =
      "UPDATE documentos_hospital SET confirmado = 1 WHERE id_documento = ?";
  } else {
    query = "DELETE FROM documentos_hospital WHERE id_documento = ?";
  }

  try {
    await pool.query(query, [pdfId]);
    return true;
  } catch (err) {
    logs.error(err)
    return false;
  }
}

export async function recuperarTodosLosDocumentosHospitalSecretario() {
  try {
    const [filasDocumentos] = await pool.query(
      "SELECT id_documento, nombre_archivo, documento_identificacion,DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS  fecha_emision, tipo_documento, nombre_paciente FROM documentos_hospital WHERE confirmado = 1 AND (tipo_documento !='receta_medica' OR tipo_documento !='justificante_paciente') "
    );

    return filasDocumentos;
  } catch (err) {
    logs.error(err)
  }
}

export async function recuperarTodosLosDocumentosHospitalMedico() {
  try {
    const [filasDocumentos] = await pool.query(
      "SELECT id_documento, nombre_archivo, documento_identificacion,DATE_FORMAT(fecha_emision, '%Y-%m-%d %H:%i:%s') AS  fecha_emision, tipo_documento, nombre_paciente FROM documentos_hospital WHERE confirmado = 1 AND (tipo_documento ='receta_medica' OR tipo_documento ='justificante_paciente') "
    );

    return filasDocumentos;
  } catch (err) {
    logs.error(err)
  }
}

export async function recuperarTodosLosDocumentosBandeja() {
  try {
    const [filasDocumentos] = await pool.query(
      "SELECT id, documento_identificacion,DATE_FORMAT(fecha, '%Y-%m-%d %H:%i:%s') AS  fecha_emision, tipo_documento, nombre_paciente FROM documentos_hospital_bandeja WHERE estado = 'pendiente'"
    );

    return filasDocumentos;
  } catch (err) {
    logs.error(err)
  }
}

export async function recuperarCamposTramite(peticionId) {
  try {
    const [filasDocumentos] = await pool.query(
      "SELECT  DATE_FORMAT(fecha, '%Y-%m-%d %H:%i:%s') AS fecha_emision, pdfId, campos FROM documentos_hospital_bandeja WHERE id = ?",
      [peticionId]
    );

    // Verificar si se encontró un registro
    if (filasDocumentos.length === 0) {
      throw new Error(`No se encontró un documento con id ${peticionId}`);
    }

    // Tomar el primer (y único) resultado
    const documento = filasDocumentos[0];
    const campos = documento.campos;

    // Dividir la cadena campos por el separador '?'
    const camposArray = campos.split("?");

    // Asignar cada elemento a su variable correspondiente
    const resultado = {
      id: peticionId,
      fecha_emision: documento.fecha_emision,
      pdfId: documento.pdfId,
      documento: camposArray[0] || "", // documentoInput
      nombre: camposArray[1] || "", // nombreInput
      apellido1: camposArray[2] || "", // apellido1Input
      apellido2: camposArray[3] || "", // apellido2Input
      fechaNacimiento: camposArray[4] || "", // fechaNacimientoInput
      telefono: camposArray[5] || "", // telefonoInput
      sexo: camposArray[6] || "", // sexoInput
      direccion: camposArray[7] || "", // direccionInput
      correo: camposArray[8] || "", // correoInput
      personaEmergencia: camposArray[9] || "", // personaEmergenciaInput
      contactoEmergencia: camposArray[10] || "", // contactoEmergenciaInput
      nacionalidad: camposArray[11] || "", // nacionalidadInput
      parentesco: camposArray[12] || "", // parentescoRegistro
      firma: camposArray[13] || "", // signaturePad (imagen en base64)
    };

    return resultado;
  } catch (err) {
    logs.error(err)
    throw err;
  }
}

export async function enviarBandejaDocumentos(campos) {
  try {
    // Extraer los datos del objeto campos
    const {
      camposEnvio,
      documento_identificacion,
      nombre_paciente,
      pdfId,
      tipo_doc,
    } = campos;

    // Generar la fecha actual si no se proporciona
    const fechaActual = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD

    // Consulta SQL para insertar los datos
    const query = `
      INSERT INTO documentos_hospital_bandeja (
        tipo_documento,
        documento_identificacion,
        nombre_paciente,
        campos,
        fecha,
        pdfId
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Valores para la consulta (previene inyección SQL)
    const values = [
      tipo_doc,
      documento_identificacion,
      nombre_paciente,
      camposEnvio,
      fechaActual,
      pdfId.toString(), // Convertir pdfId a cadena si es necesario
    ];

    // Ejecutar la consulta
    const [result] = await pool.query(query, values);
    return result;
  } catch (error) {
    logs.error(error)
    throw error;
  }
}

export async function descartarPeticionDocumento(peticionId) {
  try {
    await pool.query(
      "UPDATE documentos_hospital_bandeja SET estado= 'procesado' WHERE id =?",
      [peticionId]
    );
    return true;
  } catch (err) {
    logs.error(err)
    return false;
  }
}
