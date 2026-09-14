/** Utilidades de fecha compartidas por los repositorios. */

/** Convierte una cadena "dd-mm-yyyy HH:MM" en un objeto Date. */
export function parseFecha(fechaStr) {
  const [dia, mes, anioHora] = fechaStr.split("-");
  const [anio, horaMin] = anioHora.split(" ");
  const [hora, minutos] = horaMin.split(":");

  // Los meses en JavaScript van de 0 a 11.
  return new Date(anio, mes - 1, dia, hora, minutos);
}

/** Edad en años cumplidos a día de hoy. */
export function calcularEdad(fecha_nacimiento) {
  const nacimiento = new Date(fecha_nacimiento);
  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();

  const cumpleAunNoLlegado =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());

  if (cumpleAunNoLlegado) edad--;

  return edad;
}
