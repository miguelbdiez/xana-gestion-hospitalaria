/**
 * Selección del avatar que representa al paciente en el panel resumen,
 * a partir de su sexo y su edad.
 */
const AVATARES = {
  Hombre: { anciano: "anciano.png", adulto: "hombre.png", nino: "niño.png" },
  Mujer: { anciano: "anciana.png", adulto: "mujer.png", nino: "niña.png" },
};

const EDAD_ANCIANO = 80;
const EDAD_ADULTO = 15;
const EDAD_BEBE = 3;

export function calcularTipoPersona(sexo, edad) {
  if (edad < EDAD_BEBE) return "bebe.png";

  // "Otro" comparte iconografía con "Hombre", como en la versión original.
  const conjunto = sexo === "Mujer" ? AVATARES.Mujer : AVATARES.Hombre;

  if (edad >= EDAD_ANCIANO) return conjunto.anciano;
  if (edad < EDAD_ADULTO) return conjunto.nino;
  return conjunto.adulto;
}
