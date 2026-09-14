document.addEventListener('DOMContentLoaded', () => {
    const nuevaIncidenciaBtn = document.getElementById('btnNuevaIncidencia');
    const nuevaIncidenciaForm = document.getElementById('nuevaIncidenciaForm');
    const cancelarIncidenciaBtn = document.getElementById('btnCancelarIncidencia');
    const aceptarIncidenciaBtn = document.getElementById('btnAceptarIncidencia');
    const incidenciaCuerpo = document.getElementById('incidenciaCuerpo');
    const incidenciasList = document.getElementById('incidenciasList');

    // Mostrar/ocultar formulario de nueva incidencia
    nuevaIncidenciaBtn.addEventListener('click', () => {
      nuevaIncidenciaForm.style.display = 'block';
      nuevaIncidenciaBtn.style.display = 'none';
    });

    cancelarIncidenciaBtn.addEventListener('click', () => {
      nuevaIncidenciaForm.style.display = 'none';
      nuevaIncidenciaBtn.style.display = 'block';
      incidenciaCuerpo.value = '';
    });

    // Añadir nueva incidencia
    aceptarIncidenciaBtn.addEventListener('click', async () => {
      const cuerpo = incidenciaCuerpo.value.trim();
      const cama_id = '<%= info.infoCabecera.cama_id || 'unknown' %>';
      const documento_identificacion_paciente ='<%= info.infoCabecera.documento_identificacion_paciente || 'unknown' %>';
     
      const ingresoId = '<%= info.infoCabecera.ingreso_id || 'unknown' %>';
      if (!cuerpo) {
        alert('Por favor, ingrese una descripción para la incidencia.');
        return;
      }

      try {
        const response = await fetch('/enfermeria/reportarIncidencia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ingreso_id: ingresoId, cuerpo, activa: 1 ,cama_id:cama_id, documento_identificacion_paciente: documento_identificacion_paciente})
        });
       if (response.ok) {
          const nuevaIncidencia = await response.json();
          console.log(nuevaIncidencia)
          const listItem = document.createElement('li');
          listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
          listItem.innerHTML = `
            <div>
              <strong>Descripcion: ${nuevaIncidencia.informacion_incidencia}</strong>
              <br>
              <small>Episodio: ${nuevaIncidencia.ingreso_id} | Estado: Activa | Fecha: ${nuevaIncidencia.fecha_emision}</small>
            </div>
            <button class="btn btn-danger btn-sm desactivar-incidencia" 
                    data-id-incidencia="${nuevaIncidencia.id_incidencia}" 
                    data-id-ingreso="${nuevaIncidencia.ingreso_id}">Desactivar</button>
          `;
          incidenciasList.appendChild(listItem);
          incidenciaCuerpo.value = '';
          nuevaIncidenciaForm.style.display = 'none';
          nuevaIncidenciaBtn.style.display = 'block';

          // Si la lista estaba vacía, remover el mensaje de "No hay incidencias"
          const noIncidenciasItem = incidenciasList.querySelector('li');
          if (noIncidenciasItem && noIncidenciasItem.textContent === 'No hay incidencias asociadas.') {
            noIncidenciasItem.remove();
          }

          const panel = document.querySelector('.panel-paciente img');
          panel.src = nuevaIncidencia.panelPaciente;
        }
         else {
          alert('Error al añadir la incidencia.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor.');
      }
    });

    // Desactivar incidencia
    incidenciasList.addEventListener('click', async (e) => {
      if (e.target.classList.contains('desactivar-incidencia')) {
        const idIncidencia = e.target.dataset.idIncidencia;
        const idIngreso = e.target.dataset.idIngreso;
        const cama_id = '<%= info.infoCabecera.cama_id || 'unknown' %>';

        console.log(`Desactivando incidencia - ID Ingreso: ${idIngreso}, ID Incidencia: ${idIncidencia}`);

        try {
          const response = await fetch(`/enfermeria/desactivarIncidencia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idIncidencia,activa: 0,cama_id, ingreso_id:idIngreso })
          });

          if (response.ok) {
            const nuevaIncidenciaDesactivada = await response.json();
            console.log(nuevaIncidenciaDesactivada);

            // Actualizar la lista de incidencias
            const listItem = e.target.closest('.list-group-item');
            listItem.querySelector('small').textContent = `Episodio: ${nuevaIncidenciaDesactivada.ingreso_id} | Estado: Inactiva | Fecha de desactivación: ${nuevaIncidenciaDesactivada.fecha_desactivacion}`;
            e.target.remove();

            // Actualizar el panel del paciente si panelPaciente no es null
            if (nuevaIncidenciaDesactivada.panelPaciente) {
              const panel = document.querySelector('.panel-paciente img');
              if (panel) {
                panel.src = nuevaIncidenciaDesactivada.panelPaciente;
              } else {
                console.warn('No se encontró el elemento .panel-paciente img en el DOM');
              }
            }
          }else {
            alert('Error al desactivar la incidencia.');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Error al conectar con el servidor.');
        }
      }
    });

  })
      // Función para expandir/colapsar texto
      function toggleText(id, fullText) {
        const element = document.getElementById(id);
        const button = element.nextElementSibling;
        if (element.classList.contains('text-limited')) {
          element.classList.remove('text-limited');
          element.classList.add('text-full');
          element.innerText = fullText;
          button.innerText = 'Ver menos';
        } else {
          element.classList.remove('text-full');
          element.classList.add('text-limited');
          element.innerText = fullText;
          button.innerText = 'Ver más';
        }
      }
  
      // Función para inicializar el estado de los campos de alergias y dieta
      function initializeModalInputs() {
        const tipoAlergia = document.querySelector('input[name="tipoAlergia"]:checked');
        const alergiaInput = document.getElementById('modalAlergia');
        if (tipoAlergia) {
          alergiaInput.disabled = tipoAlergia.value === 'ninguna';
          if (tipoAlergia.value === 'ninguna') alergiaInput.value = '';
        }
  
        const tipoDieta = document.querySelector('input[name="tipoDieta"]:checked');
        const dietaInput = document.getElementById('modalDieta');
        if (tipoDieta) {
          dietaInput.disabled = tipoDieta.value === 'ninguna';
          if (tipoDieta.value === 'ninguna') dietaInput.value = '';
        }
      }
  
      // Habilitar/deshabilitar campos de alergias y dieta al cambiar selección
      document.querySelectorAll('input[name="tipoAlergia"]').forEach(radio => {
        radio.addEventListener('change', function() {
          const alergiaInput = document.getElementById('modalAlergia');
          alergiaInput.disabled = this.value === 'ninguna';
          if (this.value === 'ninguna') alergiaInput.value = '';
        });
      });
  
      document.querySelectorAll('input[name="tipoDieta"]').forEach(radio => {
        radio.addEventListener('change', function() {
          const dietaInput = document.getElementById('modalDieta');
          dietaInput.disabled = this.value === 'ninguna';
          if (this.value === 'ninguna') dietaInput.value = '';
        });
      });
  
      // Inicializar el estado al abrir el modal
      document.getElementById('editModal').addEventListener('shown.bs.modal', function () {
        initializeModalInputs();
      });
  
      // Aplicar cambios
      async function applyChanges(ingresoId) {
        console.log('Ingreso ID:', ingresoId); // Depuración
  
        const diagnostico = document.getElementById('modalDiagnostico').value;
        let tipoAlergiaInput = document.querySelector('input[name="tipoAlergia"]:checked');
        let tipoAlergia = tipoAlergiaInput ? tipoAlergiaInput.value : 'ninguna';
        let alergia = document.getElementById('modalAlergia').value;
        let tipoDietaInput = document.querySelector('input[name="tipoDieta"]:checked');
        let tipoDieta = tipoDietaInput ? tipoDietaInput.value : 'ninguna';
        let dieta = document.getElementById('modalDieta').value;
        const aislamientoInput = document.querySelector('input[name="aislamiento"]:checked');
        const aislamiento = aislamientoInput ? aislamientoInput.value === 'si' : false;
        const grupoSanguineo = document.getElementById('modalGrupoSanguineo').value;
        const cama_id = '<%= info.infoCabecera.cama_id || 'unknown' %>';
        const medico_id = '<%= info.infoCabecera.medico_id || 'unknown' %>';
        const documento_identificacion_paciente = '<%= info.infoCabecera.documento_identificacion_paciente || 'unknown' %>';
        console.log("cama_id", cama_id)
  
        // Ajustar valores según las condiciones
        if (tipoDieta === "ninguna") {
          tipoDieta = "non";
          dieta = "";
        }
  
        if (tipoAlergia === "ninguna") {
          tipoAlergia = "non";
          alergia = "";
        }
  
        // Mostrar datos en consola
       
  
        try {
          const response = await fetch('/enfermeria/actualizarInformacionCabecera', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ingreso_id: ingresoId,
          diagnostico: diagnostico,
          tipo_alergia: tipoAlergia,
          alergia: alergia,
          tipo_dieta: tipoDieta,
          dieta: dieta,
          aislamiento: aislamiento,
          grupo_sanguineo: grupoSanguineo,
          cama_id: cama_id,
          medico_id: medico_id,
          documento_identificacion_paciente: documento_identificacion_paciente})
          });
         if (response.ok) {
            const datosActualizados = await response.json();
            console.log(datosActualizados)
            if(datosActualizados.panelPaciente){
              const panel = document.querySelector('.panel-paciente img');
              panel.src = datosActualizados.panelPaciente;
  
            }
  
  
  
            const diagnosticoElement = document.getElementById(`diagnostico-${ingresoId}`);
            if (diagnosticoElement) {
              diagnosticoElement.innerText = diagnostico;
              diagnosticoElement.setAttribute('title', diagnostico);
              if (diagnostico.length > 30) {
                const toggleButton = diagnosticoElement.nextElementSibling;
                if (!toggleButton) {
                  const newButton = document.createElement('button');
                  newButton.className = 'toggle-button';
                  newButton.innerText = 'Ver más';
                  newButton.onclick = () => toggleText(`diagnostico-${ingresoId}`, diagnostico);
                  diagnosticoElement.parentNode.appendChild(newButton);
                }
              } else {
                const toggleButton = diagnosticoElement.nextElementSibling;
                if (toggleButton) toggleButton.remove();
              }
            } else {
              console.warn(`Elemento con ID diagnostico-${ingresoId} no encontrado`);
            }
  
            const alergiasElement = document.getElementById(`alergias-${ingresoId}`);
            if (alergiasElement) {
              const alergiasText = `(${tipoAlergia === 'grave' ? 'Grave' : tipoAlergia === 'moderada' ? 'Moderada' : tipoAlergia === 'leve' ? 'Leve' : 'Ninguna'}) ${alergia || 'Ninguna'}`;
              alergiasElement.innerText = alergiasText;
              alergiasElement.setAttribute('title', alergiasText);
              if (alergiasText.length > 30) {
                const toggleButton = alergiasElement.nextElementSibling;
                if (!toggleButton) {
                  const newButton = document.createElement('button');
                  newButton.className = 'toggle-button';
                  newButton.innerText = 'Ver más';
                  newButton.onclick = () => toggleText(`alergias-${ingresoId}`, alergiasText);
                  alergiasElement.parentNode.appendChild(newButton);
                }
              } else {
                const toggleButton = alergiasElement.nextElementSibling;
                if (toggleButton) toggleButton.remove();
              }
            } else {
              console.warn(`Elemento con ID alergias-${ingresoId} no encontrado`);
            }
  
            const dietaElement = document.getElementById(`dieta-${ingresoId}`);
            if (dietaElement) {
              const dietaText = `(${tipoDieta === 'normal' ? 'Normal' : tipoDieta === 'blanda' ? 'Blanda' : tipoDieta === 'liquidos' ? 'Líquida' : 'Ninguna'}) ${dieta || 'Ninguna'}`;
              dietaElement.innerText = dietaText;
              dietaElement.setAttribute('title', dietaText);
              if (dietaText.length > 30) {
                const toggleButton = dietaElement.nextElementSibling;
                if (!toggleButton) {
                  const newButton = document.createElement('button');
                  newButton.className = 'toggle-button';
                  newButton.innerText = 'Ver más';
                  newButton.onclick = () => toggleText(`dieta-${ingresoId}`, dietaText);
                  dietaElement.parentNode.appendChild(newButton);
                }
              } else {
                const toggleButton = dietaElement.nextElementSibling;
                if (toggleButton) toggleButton.remove();
              }
            } else {
              console.warn(`Elemento con ID dieta-${ingresoId} no encontrado`);
            }
  
            const aislamientoElement = document.getElementById(`aislamiento-${ingresoId}`);
            if (aislamientoElement) {
              aislamientoElement.innerText = aislamiento ? 'Sí' : 'No';
              aislamientoElement.setAttribute('title', aislamiento ? 'Sí' : 'No');
            } else {
              console.warn(`Elemento con ID aislamiento-${ingresoId} no encontrado`);
            }
  
            const grupoSanguineoElement = document.getElementById(`grupoSanguineo-${ingresoId}`);
            if (grupoSanguineoElement) {
              grupoSanguineoElement.innerText = grupoSanguineo;
              grupoSanguineoElement.setAttribute('title', grupoSanguineo);
            } else {
              console.warn(`Elemento con ID grupoSanguineo-${ingresoId} no encontrado`);
            }
  
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            modal.hide();
            
          }
           else {
            alert('Error al aplicar cambios.');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Error al conectar con el servidor.');
        }
  
        // Actualizar la cabecera con validación
        
      }
    
  
     // Función para expandir/colapsar texto
     