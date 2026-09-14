import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import https from "https";
import { Server } from "socket.io";

import { cargarOpcionesServidor, PORT } from "./config/index.js";
import { rutas } from "./routes/index.js";
import { renderConContexto } from "./middleware/contextoUsuario.js";
import { manejadorDeErrores, noEncontrado } from "./middleware/errores.js";
import { socketController } from "./sockets/index.js";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Construye la aplicación Express.
 *
 * El orden importa: primero los analizadores de cuerpo y cookies, después los
 * recursos estáticos, luego las rutas y, al final, el 404 y el manejador de
 * errores, que deben ir siempre los últimos.
 */
export function crearApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("view engine", "ejs");
  app.set("views", path.join(RAIZ, "views"));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use("/assets", express.static(path.join(RAIZ, "assets")));
  app.use("/imagenes", express.static(path.join(RAIZ, "imagenes")));
  app.use("/public", express.static(path.join(RAIZ, "public")));
  app.use("/views", express.static(path.join(RAIZ, "views/css")));

  app.use(renderConContexto);
  app.use(rutas);

  app.use(noEncontrado);
  app.use(manejadorDeErrores);

  return app;
}

/** Levanta el servidor HTTPS con Socket.IO montado encima. */
export function crearServidor() {
  const app = crearApp();
  const servidor = https.createServer(cargarOpcionesServidor(), app);
  const io = new Server(servidor, { cors: { origin: "*" } });

  socketController(io);

  return { app, servidor, io };
}

export { PORT };
