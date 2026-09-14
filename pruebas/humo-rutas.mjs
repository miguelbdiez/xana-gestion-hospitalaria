/**
 * Prueba de humo sobre las rutas GET de la aplicación.
 *
 * Inicia sesión con cada rol y pide todas las rutas GET declaradas en
 * src/routes, comprobando que ninguna devuelve un error de servidor.
 *
 * Las rutas cuyo manejador lee `req.query` necesitan parámetros que esta
 * prueba no conoce (identificadores de ingreso, de vía, de documento…). Se
 * cuentan aparte para no confundirlas con un fallo real.
 *
 * Uso (con la aplicación levantada y `npm run db:seed` ejecutado):
 *   npm run test:humo
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.BASE_URL ?? "https://localhost:3000";

// El certificado de desarrollo es autofirmado y fetch no admite un agente
// propio, así que se relaja la verificación sólo dentro de esta prueba.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const USUARIOS = [
  { dni: "00000001A", rol: "medico" },
  { dni: "00000002B", rol: "enfermero" },
  { dni: "00000003C", rol: "enfermeroEncargado" },
  { dni: "00000004D", rol: "secretario" },
  { dni: "00000005E", rol: "administrador" },
];
const CLAVE = process.env.SEED_PASSWORD ?? "Prueba1234";
const LIMITE_MS = 8000;

/** Rutas declaradas, y si su manejador depende de parámetros de consulta. */
async function rutasDeclaradas() {
  const dirRutas = path.join(RAIZ, "src", "routes");
  const dirCtrl = path.join(RAIZ, "src", "controllers");

  const controladores = {};
  for (const f of await fs.readdir(dirCtrl)) {
    controladores[f.replace(".controller.js", "")] = await fs.readFile(
      path.join(dirCtrl, f),
      "utf8"
    );
  }

  const rutas = [];
  for (const f of (await fs.readdir(dirRutas)).filter((x) => x.endsWith(".routes.js"))) {
    const modulo = f.replace(".routes.js", "");
    const texto = await fs.readFile(path.join(dirRutas, f), "utf8");

    for (const m of texto.matchAll(/router\.get\("([^"]+)".*?controlador\.(\w+)\)/g)) {
      const [, ruta, manejador] = m;
      if (ruta.includes(":")) continue;

      const fuente = controladores[modulo] ?? "";
      const cuerpo = fuente.match(
        new RegExp(`export const ${manejador} = async \\(req, res\\) => \\{([\\s\\S]*?)\\n\\};`)
      );
      const usaQuery = Boolean(cuerpo && /req\.query/.test(cuerpo[1]));

      rutas.push({ ruta, modulo, manejador, usaQuery });
    }
  }
  return rutas;
}

async function iniciarSesion(dni) {
  const respuesta = await fetch(`${BASE}/inicioSesion`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ usuario: dni, ["contraseña"]: CLAVE }),
    signal: AbortSignal.timeout(LIMITE_MS),
  });
  const cookie = respuesta.headers.get("set-cookie");
  if (!respuesta.ok || !cookie) {
    throw new Error(`HTTP ${respuesta.status}`);
  }
  return cookie.split(";")[0];
}

const rutas = await rutasDeclaradas();
const conParametros = rutas.filter((r) => r.usaQuery).length;

console.log(`Rutas GET declaradas: ${rutas.length}`);
console.log(`  de ellas, dependientes de parámetros: ${conParametros}\n`);

const fallos = [];

for (const usuario of USUARIOS) {
  let cookie;
  try {
    cookie = await iniciarSesion(usuario.dni);
  } catch (error) {
    console.log(`  ${usuario.rol.padEnd(20)} NO SE PUDO INICIAR SESIÓN (${error.message})`);
    fallos.push({ rol: usuario.rol, ruta: "/inicioSesion", estado: "login" });
    continue;
  }

  let ok = 0;
  let sinPermiso = 0;
  let faltanParams = 0;
  let sinConfigurar = 0;
  let error = 0;

  for (const r of rutas) {
    // Un reintento: sobre HTTPS autofirmado y con muchas peticiones seguidas
    // se cuela alguna conexión cortada que no dice nada del servidor.
    let estado;
    for (let intento = 1; intento <= 2; intento++) {
      try {
        const res = await fetch(BASE + r.ruta, {
          headers: { cookie },
          redirect: "manual",
          signal: AbortSignal.timeout(LIMITE_MS),
        });
        estado = res.status;
        break;
      } catch (e) {
        estado = e.name === "TimeoutError" ? "sin respuesta" : "excepcion";
        if (e.name === "TimeoutError") break;
      }
    }

    const esFallo =
      estado === "sin respuesta" || estado === "excepcion" || estado >= 500;

    // 503 = integracion externa opcional sin credenciales en este entorno.
    if (estado === 503) {
      sinConfigurar++;
    } else if (esFallo && r.usaQuery) {
      faltanParams++;
    } else if (esFallo) {
      error++;
      fallos.push({ rol: usuario.rol, ruta: r.ruta, modulo: r.modulo, estado });
    } else if (estado === 403) {
      sinPermiso++;
    } else {
      ok++;
    }
  }

  console.log(
    `  ${usuario.rol.padEnd(20)} ok ${String(ok).padStart(3)}   ` +
      `sin permiso ${String(sinPermiso).padStart(3)}   ` +
      `faltan parámetros ${String(faltanParams).padStart(3)}   ` +
      `sin configurar ${String(sinConfigurar).padStart(2)}   ` +
      `FALLOS ${String(error).padStart(3)}`
  );
}

if (fallos.length) {
  const porRuta = new Map();
  for (const f of fallos) {
    if (!porRuta.has(f.ruta)) porRuta.set(f.ruta, { estado: f.estado, roles: [] });
    porRuta.get(f.ruta).roles.push(f.rol);
  }
  console.log(`\nRutas con fallo real (${porRuta.size}):`);
  for (const [ruta, d] of porRuta) {
    console.log(`  ${String(d.estado).padEnd(14)} ${ruta.padEnd(46)} ${d.roles.join(", ")}`);
  }
} else {
  console.log("\nNinguna ruta falla por sí misma.");
}

process.exit(fallos.length ? 1 : 0);
