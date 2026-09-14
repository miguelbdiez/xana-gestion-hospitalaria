import { logs } from "./logs.service.js";
import { recuperarAltaPaciente } from "../repositories/ingresos.repository.js";
import {
  recuperarBalancesPaciente,
  recuperarConstantesPaciente,
  recuperarEvolutivoEnfermeria,
  recuperarIncidenciasIngreso,
  recuperarTestsPaciente,
  recuperarViasPaciente,
} from "../repositories/enfermeria.repository.js";
import {
  recuperarDiagnosticoPaciente,
  recuperarEvolutivoMedicina,
} from "../repositories/medicina.repository.js";
import { recuperarMedicacionActivaHistorialPaciente } from "../repositories/farmacia.repository.js";

/**
 * Reúne toda la información clínica de un episodio de ingreso.
 *
 * Vive en la capa de servicios y no en un repositorio porque no consulta la
 * base de datos directamente: agrega el resultado de seis repositorios
 * distintos. Las consultas se lanzan en paralelo, ya que son independientes
 * entre sí.
 */
export async function recuperarInformacionEpisodioPaciente(ingreso_id) {
  try {
    const [
      diagnostico,
      incidencias,
      viasPaciente,
      constantesPaciente,
      balancesPaciente,
      evolutivoEnfermeria,
      evolutivoMedico,
      testPaciente,
      medicacionPaciente,
      altaPaciente,
    ] = await Promise.all([
      recuperarDiagnosticoPaciente(ingreso_id),
      recuperarIncidenciasIngreso(ingreso_id),
      recuperarViasPaciente(ingreso_id),
      recuperarConstantesPaciente(ingreso_id),
      recuperarBalancesPaciente(ingreso_id),
      recuperarEvolutivoEnfermeria(ingreso_id),
      recuperarEvolutivoMedicina(ingreso_id),
      recuperarTestsPaciente(ingreso_id),
      recuperarMedicacionActivaHistorialPaciente(ingreso_id),
      recuperarAltaPaciente(ingreso_id),
    ]);

    return {
      diagnostico,
      incidencias,
      viasPaciente,
      constantesPaciente,
      balancesPaciente,
      evolutivoEnfermeria,
      evolutivoMedico,
      testPaciente,
      medicacionPaciente,
      altaPaciente,
    };
  } catch (error) {
    logs.error(error);
    return null;
  }
}
