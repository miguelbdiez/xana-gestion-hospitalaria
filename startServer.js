import "dotenv/config";
import { verificarConfiguracion, PORT, IP_SERVIDOR } from "./src/config/index.js";
import { crearServidor } from "./src/app.js";
import { startServerConfigurarEventos } from "./src/repositories/comunicaciones.repository.js";
import { logs } from "./src/services/logs.service.js";

verificarConfiguracion();

const { servidor } = crearServidor();

servidor.listen(PORT, () => {
  console.log(`Xana escuchando en https://${IP_SERVIDOR}:${PORT}`);
});

// Reprograma las notificaciones que quedaron pendientes antes del último cierre.
startServerConfigurarEventos().catch((error) => {
  logs.error(error);
  console.error("No se pudieron reprogramar los eventos pendientes:", error.message);
});
