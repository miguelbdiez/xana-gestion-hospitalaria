/**
 * Controlador de general
 *
 * Pantalla de entrada y utilidades sueltas.
 *
 * Los manejadores asumen que ya han pasado por `requireAuth`, de modo que
 * `req.usuario` esta disponible, y por `cargarContextoUsuario` cuando la
 * pantalla necesita la barra lateral de chat y notificaciones.
 */


export const inicio = async (req, res) => {
  res.render("login");
};
