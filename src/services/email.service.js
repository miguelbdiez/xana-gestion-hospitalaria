import nodemailer from "nodemailer";
import { CONFIG_EMAIL } from "../config/index.js";

/**
 * Transporte de correo saliente.
 *
 * Si no hay credenciales configuradas se devuelve un transporte inerte, de
 * modo que la aplicación arranca y funciona sin envío de correo en lugar de
 * fallar al iniciarse.
 */
function crearTransporte() {
  if (!CONFIG_EMAIL.EMAIL_USER || !CONFIG_EMAIL.EMAIL_PASSWORD) {
    console.warn(
      "[email] Sin credenciales configuradas: el envío de correo queda desactivado."
    );
    return {
      sendMail: async (mensaje) => {
        console.info(`[email] Envío omitido -> ${mensaje.to} | ${mensaje.subject}`);
        return { omitido: true };
      },
    };
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: CONFIG_EMAIL.EMAIL_USER,
      pass: CONFIG_EMAIL.EMAIL_PASSWORD,
    },
  });
}

export const sender = crearTransporte();

/** Remitente que se muestra en los correos que envía la aplicación. */
export const REMITENTE = `"XanaIndustries" <${CONFIG_EMAIL.EMAIL_USER ?? "no-reply@localhost"}>`;
