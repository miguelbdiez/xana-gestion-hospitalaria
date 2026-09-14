/**
 * Monta todos los routers de la aplicación.
 *
 * Cada dominio vive en su propio fichero y declara ahí qué middleware necesita
 * cada ruta, en lugar de repetir la comprobación de sesión en cada manejador.
 */
import { Router } from "express";

import { router as administracion } from "./administracion.routes.js";
import { router as auth } from "./auth.routes.js";
import { router as clinica } from "./clinica.routes.js";
import { router as comunicaciones } from "./comunicaciones.routes.js";
import { router as documentos } from "./documentos.routes.js";
import { router as farmacia } from "./farmacia.routes.js";
import { router as general } from "./general.routes.js";
import { router as ingresos } from "./ingresos.routes.js";
import { router as medicina } from "./medicina.routes.js";
import { router as turnos } from "./turnos.routes.js";

export const rutas = Router();

rutas.use(general);
rutas.use(auth);
rutas.use(clinica);
rutas.use(ingresos);
rutas.use(medicina);
rutas.use(farmacia);
rutas.use(comunicaciones);
rutas.use(turnos);
rutas.use(documentos);
rutas.use(administracion);
