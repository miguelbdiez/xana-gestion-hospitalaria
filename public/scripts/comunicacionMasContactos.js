      
document.addEventListener("DOMContentLoaded", async () => {

    document.getElementById('searchInput').addEventListener('change', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const users = document.querySelectorAll('.chat-list li');
    users.forEach(user => {
      const name = user.querySelector('.name').textContent.toLowerCase();
      user.style.display = name.includes(searchTerm) ? '' : 'none';
    });
  });
  
    const usuarioId = localStorage.getItem("usuarioId");
    const nombreDelUsuario = localStorage.getItem("nombreDelUsuario");
  
    const socket = io({ query: { usuarioId } });
  
    //WebRTC
    let MiConnexionPeer;
    let localStream;
    let ofertaRecibida;
    let candidatosICERecibidos = [];
  
    /*Modal LLamada en Curso*/
    const modalLLamadaEnCurso = new bootstrap.Modal(
      document.getElementById("modalLLamadaEnCurso")
    );
    const personaConLaQueSeHabla = document.getElementById(
      "persona_con_la_que_se_habla"
    );
    const btnFinalizarLLamadaEnCurso = document.getElementById(
      "btnFinalizarLLamadaEnCurso"
    );
  
    /* Modal Llamada Entrante */
  
    const modalLlamandaEntrante = new bootstrap.Modal(
      document.getElementById("modalLlamandaEntrante")
    );
    const personaQueLlama = document.getElementById("Persona_que_llama");
  
    const btnRechazarLlamada =
      document.getElementById("btnRechazarLlamada");
    const btnAceptarLlamada = document.getElementById("btnAceptarLlamada");
    console.log(btnAceptarLlamada);
  
    /********************/
  
    /*Modal Llamando*/
  
    const botonLlamada = document.querySelector(".call-btn");
    const modalLlamando = new bootstrap.Modal(document.getElementById("modalLlamando"));
    const personaALaQueSeLlama = document.getElementById("persona_a_la_que_se_llama");
    const btnFinalizarLlamando = document.getElementById("btnFinalizarLlamando");
  
    let guardarNombreUser = "";
    let receptorId = "";
  
    /****************/
  
    const sidebarNotificaciones = document.getElementById("sidebarNotificaciones");
    const sidebarChat = document.getElementById("sidebarChat");
    const chatContainer = document.querySelector(".chat"); // Contenedor del chat
    const chatAboutElement = document.querySelector(".chat-about"); // Info del usuario en el chat
    const chatBox = document.getElementById("chat-box"); // Historial de mensajes
    const chatHeaderImg = document.querySelector(".chat-header img"); // Imagen en el chat
    const btnVolverLista = document.getElementById("btnVolverLista"); // Botón para volver al listado de usuarios
    const enviarBtn = document.getElementById("enviarBtn"); // Historial de mensajes
    const mensajeInput = document.getElementById("mensajeInput"); // Historial de mensajes
    const usuarioReceptorMensaje = chatAboutElement.getAttribute("data-user-id");
    const notificacionesList = document.getElementById("notificaciones");
  
    const searchInput = document.getElementById('searchInput');
    const chatList = document.querySelector('.chat-list');
    let users = Array.from(document.querySelectorAll('.chat-list li'));
    
      searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
    
        // Filtrar usuarios
        const filteredUsers = users.filter(user => {
          const name = user.querySelector('.name').textContent.toLowerCase();
          return name.includes(searchTerm);
        });
    
        // Ordenar alfabéticamente por nombre
        filteredUsers.sort((a, b) => {
          const nameA = a.querySelector('.name').textContent.toLowerCase();
          const nameB = b.querySelector('.name').textContent.toLowerCase();
          return nameA.localeCompare(nameB);
        });
    
        // Limpiar lista actual
        chatList.innerHTML = '';
    
        // Añadir usuarios filtrados y ordenados
        filteredUsers.forEach(user => {
          chatList.appendChild(user);
        });
    
        // Si no hay término de búsqueda, restaurar lista original
        if (!searchTerm) {
          users.forEach(user => chatList.appendChild(user));
        }
      });
  
    // Agregar evento a cada usuario en la lista
    document.querySelectorAll(".usuario-chat").forEach((usuario) => {
      usuario.addEventListener("click", async () => {
        const receptorId = usuario.getAttribute("data-user-id"); // ID del usuario seleccionado
        const nombreUsuario = usuario.querySelector(".name").textContent; // Nombre del usuario
        guardarNombreUser = nombreUsuario;
        const fotoPerfil = usuario.querySelector("img").src; // Foto de perfil
  
        // Actualizar la información del usuario en el chat
  
        chatAboutElement.setAttribute("data-user-id", receptorId);
        chatAboutElement.querySelector("h6").textContent = nombreUsuario;
        chatHeaderImg.src = fotoPerfil; // Actualizar imagen en el chat
  
        //Boton de llamada
        botonLlamada.setAttribute("data-user-id", receptorId);
  
        // Mostrar el chat y ocultar la lista
        document.getElementById("plist").style.display = "none";
        chatContainer.style.display = "block";
  
        // Cargar mensajes del usuario seleccionado
        await cargarMensajes(receptorId);
      });
    });
    document.querySelectorAll('[id^="btnMail-"]').forEach(botonMail => {


        botonMail.addEventListener('click', async () => {
    
    
            console.log(botonMail.dataset)
    
    
            const correo_electronico_receptor = botonMail.dataset.correoUser; // Get data-id-user from the button
    
    
            
    
    
    
    
    
    
    
    
          if (correo_electronico_receptor) {
    
    
            console.log(correo_electronico_receptor)
    
    
            window.location.href = `/comunicacion/mail/newMailDirecto?correo=${correo_electronico_receptor}`;
    
    
          }
    
    
            
    
    
    
    
    
        })
    
    
        })
    
        document.querySelectorAll('[id^="btnLlamar-"]').forEach(botonLlamada => {
    
    
        botonLlamada.addEventListener('click', async () => {
          const receptorId = botonLlamada.dataset.idUser; // Get data-id-user from the button
          const receptor_usuario_nombre_completo = botonLlamada.dataset.nombreUser
          guardarNombreUser = receptor_usuario_nombre_completo
    
        if (receptorId) {
          personaALaQueSeLlama.setAttribute(
            "data-Persona-a-la-que-se-llama-id",
            receptorId
          )
          /*WebRTC configuracion*/
    
          const iceServers = [
            { urls: "stun:stun.l.google.com:19302" }, // Servidor STUN de Google
          ];
          MiConnexionPeer = new RTCPeerConnection({ iceServers });
          if (!localStream) {
            await setupLocalStream();
          }
          localStream
            .getTracks()
            .forEach((track) => MiConnexionPeer.addTrack(track, localStream));
          console.log("despues de local stream ");
    
          MiConnexionPeer.onicecandidate = (e) => {
    
    
            if (e.candidate) {
    
    
              personaALaQueSeLlama.textContent = guardarNombreUser;
    
    
              modalLlamando.show();
    
    
              socket.emit("enviarCandidatoICE", {
    
    
                receptorId: receptorId,
    
    
                candidatoICE: e.candidate,
    
    
                emisorId: usuarioId, // Tu ID de usuario
    
    
              });
    
    
            }
    
    
          };
    
          const oferta = await MiConnexionPeer.createOffer();
    
          console.log("Oferta SDP del emisor:", oferta.sdp); // Log del SDP
    
          await MiConnexionPeer.setLocalDescription(oferta);
          console.log(
    
    
            "Pistas enviadas por el emisor:",
    
    
            MiConnexionPeer.getSenders()
    
    
          );
    
          modalLlamando.show();
    
          socket.emit("llamarUsuario", {
            receptorId: receptorId,
            oferta: oferta,
            emisorId: usuarioId, // Tu ID de usuario
            emisorNombre: nombreDelUsuario,
          });
          MiConnexionPeer.ontrack = (event) => {
    
            console.log("Recibiendo audio remoto...");
            const remoteStream = event.streams[0];
          const audioElement = document.createElement("audio");
            audioElement.srcObject = remoteStream;
            audioElement.autoplay = true;
            audioElement.muted = false;
            document.body.appendChild(audioElement);
          console.log("Reproduciendo audio remoto por altavoc");
          };
    
    
        } else {
          console.log("No hay usuario seleccionado para llamar.");
        }
    
    
        MiConnexionPeer.oniceconnectionstatechange = () => {
    
    
          console.log("Estado ICE:", MiConnexionPeer.iceConnectionState);
    
    
        };
        })
    
        })
    
        document.querySelectorAll('[id^="btnChat-"]').forEach(botonChat => {
    
    
        botonChat.addEventListener('click', async () => {
    
    
            console.log(botonChat.dataset)
    
    
            const idUser = botonChat.dataset.idUser; // Get data-id-user from the button
    
    
          if (idUser) {
    
    
            window.location.href = `/comunicacion/chat/chatDirecto?idUser=${idUser}`;
    
    
          }
    
    
            
    
    
    
    
    
        })
    
    
        })
    
    enviarBtn.addEventListener("click", () => {
      const mensaje = mensajeInput.value.trim();
      const chatAboutElement = document.querySelector(".chat-about"); // Info del usuario en el chat
      const usuarioReceptorMensaje =
        chatAboutElement.getAttribute("data-user-id");
      if (mensaje !== "") {
        socket.emit("mensaje", {
          contenido: mensaje,
          usuarioReceptorMensaje: usuarioReceptorMensaje,
        });
        agregarMensaje(mensaje, true, new Date()); // Mostrar el mensaje en el chat
        mensajeInput.value = ""; // Limpiar el input después de enviar
  
        // Buscar el usuario en la lista
        const chatList = document.querySelector(".chat-list");
        const usuarioChat = document.querySelector(
          `.usuario-chat[data-user-id='${usuarioReceptorMensaje}']`
        );
  
        if (usuarioChat) {
          // Actualizar el último mensaje y la hora
          usuarioChat.querySelector(".last-message").textContent = mensaje;
          usuarioChat.querySelector(".message-time").textContent =
            formatearFecha(new Date());
  
          // Mover el usuario al inicio de la lista
          chatList.prepend(usuarioChat);
        }
      }
    });
    btnVolverLista.addEventListener("click", () => {
      chatContainer.style.display = "none";
      document.getElementById("plist").style.display = "block";
    });
  
    botonLlamada.addEventListener("click", async () => {
      receptorId = botonLlamada.getAttribute("data-user-id"); // Obtener el ID del usuario
  
      if (receptorId) {
        personaALaQueSeLlama.setAttribute(
          "data-Persona-a-la-que-se-llama-id",
          receptorId
        );
        /*WebRTC configuracion*/
        const iceServers = [
          { urls: "stun:stun.l.google.com:19302" }, // Servidor STUN de Google
        ];
        MiConnexionPeer = new RTCPeerConnection({ iceServers });
        if (!localStream) {
          await setupLocalStream();
        }
        localStream
          .getTracks()
          .forEach((track) => MiConnexionPeer.addTrack(track, localStream));
        console.log("despues de local stream ");
  
        //Crear la oferta
  
        MiConnexionPeer.onicecandidate = (e) => {
          if (e.candidate) {
            personaALaQueSeLlama.textContent = guardarNombreUser;
            modalLlamando.show();
            socket.emit("enviarCandidatoICE", {
              receptorId: receptorId,
              candidatoICE: e.candidate,
              emisorId: usuarioId, // Tu ID de usuario
            });
          }
        };
  
        const oferta = await MiConnexionPeer.createOffer();
        console.log("Oferta SDP del emisor:", oferta.sdp); // Log del SDP
        await MiConnexionPeer.setLocalDescription(oferta);
        console.log(
          "Pistas enviadas por el emisor:",
          MiConnexionPeer.getSenders()
        );
  
        modalLlamando.show();
        socket.emit("llamarUsuario", {
          receptorId: receptorId,
          oferta: oferta,
          emisorId: usuarioId, // Tu ID de usuario
          emisorNombre: nombreDelUsuario,
        });
  
        MiConnexionPeer.ontrack = (event) => {
          console.log("Recibiendo audio remoto...");
          const remoteStream = event.streams[0];
          const audioElement = document.createElement("audio");
          audioElement.srcObject = remoteStream;
          audioElement.autoplay = true;
          audioElement.muted = false;
          document.body.appendChild(audioElement);
          console.log("Reproduciendo audio remoto por altavoc");
        };
      } else {
        console.log("No hay usuario seleccionado para llamar.");
      }
      MiConnexionPeer.oniceconnectionstatechange = () => {
        console.log("Estado ICE:", MiConnexionPeer.iceConnectionState);
      };
    });
    btnAceptarLlamada.addEventListener("click", async () => {
      const personaQueLlamaId = personaQueLlama.getAttribute(
        "data-Persona-que-llama-id"
      );
      personaConLaQueSeHabla.setAttribute(
        "data-Persona-Con-La-Que-Se-Habla-Id",
        personaQueLlamaId
      );
  
      /*Configuracion WebRTC*/
      const iceServers = [
        { urls: "stun:stun.l.google.com:19302" }, // Servidor STUN de Google
      ];
      MiConnexionPeer = new RTCPeerConnection({ iceServers });
  
      console.log("Anres de On trak ");
      MiConnexionPeer.ontrack = (event) => {
        console.log("Recibiendo audio remoto...");
        const remoteStream = event.streams[0];
        const audioElement = document.createElement("audio");
        audioElement.srcObject = remoteStream;
        audioElement.autoplay = true;
        audioElement.muted = false;
        document.body.appendChild(audioElement);
        console.log("Reproduciendo audio remoto por altavo");
      };
  
      if (!localStream) await setupLocalStream();
      console.log("Pistas locales del emisor:", localStream.getTracks());
      localStream.getTracks().forEach((track) => {
        console.log("Añadiendo pista al emisor:", track);
        MiConnexionPeer.addTrack(track, localStream);
      });
      console.log("Oferta recibida en receptor:", ofertaRecibida.sdp); // Log de la oferta recibida
      await MiConnexionPeer.setRemoteDescription(
        new RTCSessionDescription(ofertaRecibida)
      );
      console.log(
        "Pistas recibidas por el receptor:",
        MiConnexionPeer.getReceivers()
      );
  
      for (const candidato of candidatosICERecibidos) {
        try {
          await MiConnexionPeer.addIceCandidate(
            new RTCIceCandidate(candidato)
          );
        } catch (error) {
          console.error(
            "Error al añadir candidato ICE:",
            error,
            "Candidato:",
            candidato
          );
        }
      }
  
      MiConnexionPeer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("enviarCandidatoICE", {
            receptorId: personaQueLlamaId,
            candidatoICE: e.candidate,
            emisorId: usuarioId,
          });
        }
      };
      const respuestaLlamada = await MiConnexionPeer.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      console.log("Respuesta SDP del receptor:", respuestaLlamada.sdp); // Log de la respuesta
      await MiConnexionPeer.setLocalDescription(respuestaLlamada);
  
      socket.emit("aceptarLlamada", {
        receptorId: personaQueLlamaId,
        respuestaLlamada: respuestaLlamada,
        emisorId: usuarioId, // Tu ID de usuario
        receptorDeLaLLamadaNombre: nombreDelUsuario,
      });
  
      MiConnexionPeer.oniceconnectionstatechange = () => {
        console.log("Estado ICE:", MiConnexionPeer.iceConnectionState);
      };
      modalLlamandaEntrante.hide();
  
      modalLLamadaEnCurso.show();
    });
    btnRechazarLlamada.addEventListener("click", () => {
      candidatosICERecibidos = [];
  
      const personaQueLlamaId = personaQueLlama.getAttribute(
        "data-Persona-que-llama-id"
      );
      socket.emit("rechazarLlamada", {
        receptorId: personaQueLlamaId,
        emisorId: usuarioId,
      });
  
      modalLlamandaEntrante.hide();
    });
    btnFinalizarLLamadaEnCurso.addEventListener("click", () => {
      console.log("Llamada btnFinalizarLLamadaEnCurso");
      cerrarConexionPeer();
      const receptorId = personaConLaQueSeHabla.getAttribute(
        "data-Persona-Con-La-Que-Se-Habla-Id"
      );
      socket.emit("finalizarLlamadaEnCurso", {
        receptorId: receptorId,
        emisorId: usuarioId,
      });
      modalLLamadaEnCurso.hide();
    });
    btnFinalizarLlamando.addEventListener("click", () => {
      cerrarConexionPeer();
      socket.emit("finalizarLlamada", {
        receptorId: personaALaQueSeLlama.getAttribute(
          "data-Persona-a-la-que-se-llama-id"
        ),
        emisorId: usuarioId,
      });
      socket.emit("notificacion", {
        idUsuarioReceptor: personaALaQueSeLlama.getAttribute(
          "data-Persona-a-la-que-se-llama-id"
        ),
        contenido_notificacion: nombreDelUsuario,
        tipo_notificacion: "tipo_llamada",
      });
  
      modalLlamando.hide();
    });
  
    notificacionesList.addEventListener("click", (e) => {
      if (e.target.classList.contains("borrar-notificacion")) {
        const id = e.target.getAttribute("data-notificacion-id");
  
        socket.emit("notificacionVisto", { id });
        const notificacionElement = e.target.closest("li");
        if (notificacionElement) {
          notificacionElement.remove();
        }
      }
    });
  
    document
      .getElementById("sidebarChat")
      .addEventListener("shown.bs.offcanvas", function () {
        document.getElementById("chatIcon").style.display = "block";
        document.getElementById("chatIconNew").style.display = "none";
      });
  
    document
      .getElementById("sidebarNotificaciones")
      .addEventListener("shown.bs.offcanvas", function () {
        document.getElementById("notIcon").style.display = "block";
        document.getElementById("notIconNew").style.display = "none";
      });
  
    async function cargarMensajes(usuarioReceptorId) {
      
      const usuarioEmisorId = localStorage.getItem("usuarioId");
  
      try {
        const response = await fetch(
          `/cargarMensajesChatIndividual?usuarioEmisorId=${usuarioEmisorId}&usuarioReceptorId=${usuarioReceptorId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const mensajes = await response.json();
        console.log(mensajes);
  
        chatBox.innerHTML = ""; // Limpiar chat anterior
  
        mensajes.forEach((mensaje) => {
          agregarMensaje(
            mensaje.contenido,
            mensaje.esPropio,
            mensaje.fecha
          );
        });
      } catch (error) {
        console.error("Error al cargar mensajes:", error);
      }
    }
  
    function formatearFecha(fecha) {
      const fechaObj = new Date(fecha);
      const dia = String(fechaObj.getDate()).padStart(2, "0");
      const mes = String(fechaObj.getMonth() + 1).padStart(2, "0"); // Los meses empiezan desde 0
      const año = fechaObj.getFullYear();
      const horas = String(fechaObj.getHours()).padStart(2, "0");
      const minutos = String(fechaObj.getMinutes()).padStart(2, "0");
  
      return `${dia}-${mes}-${año} ${horas}:${minutos}`;
    }
  
    function agregarMensaje(mensaje, esPropio, fecha) {
      const li = document.createElement("li");
      li.classList.add("clearfix");
  
      const formattedDate = formatearFecha(fecha);
      if (esPropio) {
        li.innerHTML = `
          <span class="message-data-time">${formattedDate}</span>
          <div class="message my-message">${mensaje}</div>
        `;
      } else {
        li.innerHTML = `
          <div class="message other-message">${mensaje}</div>
          <span class="message-data-time">${formattedDate}</span>
        `;
      }
  
      chatBox.appendChild(li);
      chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll al último mensaje
    }
  
    function agregarNotificacion(data) {
      console.log("ENTRS", data.id);
      const notificacionesList = document.getElementById("notificaciones");
      const li = document.createElement("li");
      // Quitar el prefijo "tipo_" para coincidir con las clases CSS
      li.classList.add("p-3", "border-bottom", data.tipo_notificacion);
      li.setAttribute("data-notificacion-id", data.id);
      let cabecera;
      if (data.tipo_notificacion === "tipo_mensaje") {
        cabecera = "Mensaje Nuevo";
      } else if (data.tipo_notificacion === "tipo_llamada") {
        cabecera = "Llamada Perdida";
      } else if (data.tipo_notificacion === "tipo_caducidad_3_dias_lote") {
        cabecera = "Caducación";
      } else if (data.tipo_notificacion === "tipo_caducidad_1_dias_lote") {
        cabecera = "Caducación";
      }
      li.innerHTML = `
        <small class="text-muted">${data.fecha_formateada}</small>
        <div class="fw-bold">${cabecera}</div>
        <div>${data.contenido_notificacion}</div>
        <button type="button" class="btn btn-sm btn-danger mt-1 borrar-notificacion" data-notificacion-id="${data.id}">Borrar</button>
      `;
  
      notificacionesList.appendChild(li);
  
      li.querySelector(".borrar-notificacion").addEventListener(
        "click",
        (e) => {
          const id = e.target.getAttribute("data-notificacion-id");
          console.log(id);
        }
      );
    }
  
    function cerrarConexionPeer() {
      if (MiConnexionPeer) {
        MiConnexionPeer.close();
        MiConnexionPeer = null;
        console.log("MiConnexionPeer cerrado");
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
          console.log("track.stop() cerrado");
        });
        localStream = null;
      }
      const elementosAudio = document.querySelectorAll("audio");
      elementosAudio.forEach((audio) => {
        audio.remove();
        console.log("audio.remove() cerrado");
      });
  
      oferta = null;
      console.log("oferta null");
  
      candidatosICERecibidos = [];
      console.log("candidatosICERecibidos null");
    }
  
    async function setupLocalStream() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
  
        console.log("Pistas locales creadas:", localStream.getTracks());
        localStream.getTracks().forEach((track) => {
          console.log(
            `Pista ${track.kind} - ID: ${track.id}, Estado: ${track.readyState}, Muted: ${track.muted}`
          );
          // Detectar si el micrófono está capturando audio
          track.onmute = () => console.log(`Pista ${track.kind} mutada`);
          track.onunmute = () =>
            console.log(`Pista ${track.kind} desmutada`);
        });
      } catch (error) {
        console.error("Error al obtener el stream local:", error);
      }
    }
  
   
    // Escuchar mensajes entrantes del servidor
    socket.on("mensaje", (data) => {
      const chatAboutElement = document.querySelector(".chat-about");
      const usuarioChatActivo =
        chatAboutElement.getAttribute("data-user-id");
      console.log("llega el mesnjae" + data.contenido);
      console.log("usuario activo" + usuarioChatActivo);
      console.log(data.idEmisor);
      if (usuarioChatActivo === data.idEmisor) {
        console.log("llega el mesnjae" + data.contenido);
  
        agregarMensaje(data.contenido, false, new Date()); // Mostrar mensaje en el chat activo
      } else {
        console.log(
          "Mensaje recibido de otro usuario, no se muestra en la conversación activa."
        );
      }
  
      // Buscar el usuario en la lista
      console.log(data);
      const chatList = document.querySelector(".chat-list");
      const usuarioChat = document.querySelector(
        `.usuario-chat[data-user-id='${data.idEmisor}']`
      );
  
      if (usuarioChat) {
        // Actualizar el último mensaje y la hora
        usuarioChat.querySelector(".last-message").textContent =
          data.contenido;
        usuarioChat.querySelector(".message-time").textContent =
          formatearFecha(new Date());
  
        // Mover el usuario al inicio de la lista
        chatList.prepend(usuarioChat);
      }
  
      if (!sidebarChat.classList.contains("show")) {
        console.log("El sidebar está cerrado, cambiando icono...");
        document.getElementById("chatIcon").style.display = "none";
        document.getElementById("chatIconNew").style.display = "block";
      }
    });
  
    //Escuchar llamadas entrantes
    socket.on("llamadaEntrante", ({ oferta, emisorId, emisorNombre }) => {
      console.log("llamnada entrante");
      ofertaRecibida = oferta;
      personaQueLlama.textContent = emisorNombre;
      candidatosICERecibidos = []; // Reiniciar candidatos
      personaQueLlama.setAttribute("data-Persona-que-llama-id", emisorId); // Guardar el emisorId en un atributo
      personaConLaQueSeHabla.textContent = emisorNombre;
      modalLlamandaEntrante.show();
    });
    // Recibir candidatos ICE
    socket.on("recibirCandidatoICE", ({ candidate, emisorId }) => {
      candidatosICERecibidos.push(candidate); // Acumular candidatos
    });
  
    socket.on("llamadaAceptada", async ({ respuestaLlamada, emisorId, emisorNombre }) => {
        console.log("llamadaAceptada de:", emisorNombre);
  
        personaConLaQueSeHabla.textContent = emisorNombre;
        const receptorId = personaConLaQueSeHabla.setAttribute(
          "data-Persona-Con-La-Que-Se-Habla-Id",
          emisorId
        );
  
        await MiConnexionPeer.setRemoteDescription(
          new RTCSessionDescription(respuestaLlamada)
        );
        modalLlamando.hide();
        modalLLamadaEnCurso.show();
      }
    );
   
    socket.on("llamadaRechazada", () => {
      cerrarConexionPeer();
  
      personaConLaQueSeHabla.textContent = "";
      modalLlamando.hide();
    });
   
    socket.on("llamadaFinalizada", () => {
      cerrarConexionPeer();
  
      personaConLaQueSeHabla.textContent = "";
      modalLlamandaEntrante.hide();
    });
    
    socket.on("llamadaEnCursoFinalizada", () => {
      cerrarConexionPeer();
  
      personaConLaQueSeHabla.textContent = "";
      modalLLamadaEnCurso.hide();
    });
  
    socket.on("notificacion", (data) => {
      console.log("notificaiocion", data.notificacionEnviar);
      agregarNotificacion(data.notificacionEnviar[0]);
      if (!sidebarNotificaciones.classList.contains("show")) {
        console.log("El sidebar está cerrado, cambiando icono...");
        document.getElementById("notIcon").style.display = "none";
        document.getElementById("notIconNew").style.display = "block";
      }
    });
    // Detectar desconexión
    socket.on("disconnect", () => {
      console.log("Desconectado del servidor de WebSockets");
    });
  
   
   });
  
  // Variables para el cronómetro
  let timerInterval;
    let seconds = 0;
  
    // Función para actualizar el cronómetro
    function updateTimer() {
      seconds++;
      let mins = Math.floor(seconds / 60);
      let secs = seconds % 60;
      document.getElementById("callTimer").textContent = `${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
  
    // Evento cuando el modal se muestra
    document
      .getElementById("modalLLamadaEnCurso")
      .addEventListener("shown.bs.modal", function () {
        // Reiniciamos el contador
        seconds = 0;
        document.getElementById("callTimer").textContent = "00:00";
        // Iniciamos el cronómetro
        timerInterval = setInterval(updateTimer, 1000);
      });
  
    // Evento cuando el modal se oculta
    document
      .getElementById("modalLLamadaEnCurso")
      .addEventListener("hidden.bs.modal", function () {
        // Detenemos el cronómetro
        clearInterval(timerInterval);
      });
  
    // Para Bootstrap 5, asegúrate de tener esta línea si usas el botón para cerrar
    document
      .getElementById("btnFinalizarLLamadaEnCurso")
      .addEventListener("click", function () {
        bootstrap.Modal.getInstance(
          document.getElementById("modalLLamadaEnCurso")
        ).hide();
      });
  
  
  