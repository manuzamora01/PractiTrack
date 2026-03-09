if ('serviceWorker' in navigator) { navigator.serviceWorker.register('./sw.js').catch((err) => console.log("Error SW:", err)); }

// ==========================================
// 1. IMPORTACIONES
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc, setDoc, getDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 2. TUS LLAVES DE FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCH7TiOqQ-UeF1LoaJywD2xSl6CZbVf2Bc",
  authDomain: "misapuntespracticas.firebaseapp.com",
  projectId: "misapuntespracticas",
  storageBucket: "misapuntespracticas.firebasestorage.app",
  messagingSenderId: "768424216418",
  appId: "1:768424216418:web:1e32349508700fc1ca0e3b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// TOASTS Y CONFIRMACIONES
// ==========================================
function mostrarToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    let icono = 'ℹ️'; if(tipo === 'success') icono = '✅'; if(tipo === 'error') icono = '⚠️'; if(tipo === 'warning') icono = '⏳';
    toast.innerHTML = `<span>${icono}</span> <span>${mensaje}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'fadeOut 0.3s forwards'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function mostrarConfirmacion(mensaje) {
    return new Promise((resolve) => {
        const modal = document.getElementById('modalConfirmacion');
        const txtMensaje = document.getElementById('txtMensajeConfirmacion');
        const btnCancelar = document.getElementById('btnConfirmarCancelar');
        const btnAceptar = document.getElementById('btnConfirmarAceptar');

        txtMensaje.textContent = mensaje; modal.style.display = 'flex';
        const onAceptar = () => { limpiar(); resolve(true); };
        const onCancelar = () => { limpiar(); resolve(false); };
        function limpiar() { btnAceptar.removeEventListener('click', onAceptar); btnCancelar.removeEventListener('click', onCancelar); modal.style.display = 'none'; }

        btnAceptar.addEventListener('click', onAceptar); btnCancelar.addEventListener('click', onCancelar);
    });
}

// ==========================================
// MODO OSCURO
// ==========================================
const btnToggleTema = document.getElementById('btnToggleTema');
let isDarkMode = localStorage.getItem('practitrack_theme') === 'dark';
function aplicarTema() { if (isDarkMode) { document.body.classList.add('dark-mode'); btnToggleTema.textContent = '☀️'; } else { document.body.classList.remove('dark-mode'); btnToggleTema.textContent = '🌙'; } }
aplicarTema();
btnToggleTema.addEventListener('click', () => { isDarkMode = !isDarkMode; localStorage.setItem('practitrack_theme', isDarkMode ? 'dark' : 'light'); aplicarTema(); });

// ==========================================
// INICIALIZACIÓN QUILL
// ==========================================
const quill = new Quill('#editor-container', { theme: 'snow', placeholder: 'Escribe aquí tu apunte...', modules: { toolbar: [ ['bold', 'italic', 'underline', 'strike'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], [{ 'header': [1, 2, 3, false] }], ['clean'] ] } });

// ==========================================
// 3. ELEMENTOS HTML
// ==========================================
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const nombreUsuarioHeader = document.getElementById('nombreUsuarioHeader'); 

const vistaLogin = document.getElementById('vista-login');
const vistaRegistro = document.getElementById('vista-registro');
const linkIrRegistro = document.getElementById('linkIrRegistro');
const linkIrLogin = document.getElementById('linkIrLogin');

const emailLoginInp = document.getElementById('emailLoginInp');
const passwordLoginInp = document.getElementById('passwordLoginInp');
const btnLogin = document.getElementById('btnLogin');

const nombreRegInp = document.getElementById('nombreRegInp');
const apellidosRegInp = document.getElementById('apellidosRegInp');
const emailRegInp = document.getElementById('emailRegInp');
const passwordRegInp = document.getElementById('passwordRegInp');
const passwordConfirmRegInp = document.getElementById('passwordConfirmRegInp');
const btnRegister = document.getElementById('btnRegister');
const btnLogout = document.getElementById('btnLogout');

const tituloTareaInp = document.getElementById('tituloTareaInp');
const categoriaInp = document.getElementById('categoriaInp');
const fechaCreacionInp = document.getElementById('fechaCreacionInp');
const horaInicioInp = document.getElementById('horaInicioInp');
const horaFinInp = document.getElementById('horaFinInp');
const btnGuardarApunte = document.getElementById('btnGuardarApunte');
const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
const tituloSeccionFormulario = document.getElementById('tituloSeccionFormulario');

const contenedorApuntes = document.getElementById('contenedorApuntes');
const filtroCategoria = document.getElementById('filtroCategoria');
const filtroFecha = document.getElementById('filtroFecha');
const filtroTexto = document.getElementById('filtroTexto');
const filtroOrden = document.getElementById('filtroOrden');
const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');

const modalCategorias = document.getElementById('modalCategorias');
const btnAbrirModalCategorias = document.getElementById('btnAbrirModalCategorias');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const nuevaCategoriaInp = document.getElementById('nuevaCategoriaInp');
const btnGuardarCategoria = document.getElementById('btnGuardarCategoria');
const listaCategoriasModal = document.getElementById('listaCategoriasModal');

const grupoActivoSelect = document.getElementById('grupoActivoSelect');
const btnGestionarGrupos = document.getElementById('btnGestionarGrupos');
const modalGrupos = document.getElementById('modalGrupos');
const btnCerrarModalGrupos = document.getElementById('btnCerrarModalGrupos');
const nuevoGrupoInp = document.getElementById('nuevoGrupoInp');
const btnCrearGrupo = document.getElementById('btnCrearGrupo');
const invitarEmailInp = document.getElementById('invitarEmailInp');
const btnInvitarMiembro = document.getElementById('btnInvitarMiembro');

const statTotal = document.getElementById('statTotal');
const statHoras = document.getElementById('statHoras');
const statAmbito = document.getElementById('statAmbito');

// ELEMENTOS EXPORTACIÓN
const btnSeleccionarVisibles = document.getElementById('btnSeleccionarVisibles');
const btnExportarPDF = document.getElementById('btnExportarPDF');
const contadorSeleccion = document.getElementById('contadorSeleccion');

let idApunteEditando = null;
let idCategoriaEditando = null;
let nombreUsuarioActual = "Usuario"; 

let notasSeleccionadas = new Set();
let apuntesCargadosMemoria = []; 

// ==========================================
// 4. AUTENTICACIÓN
// ==========================================
linkIrRegistro.addEventListener('click', () => { vistaLogin.style.display = 'none'; vistaRegistro.style.display = 'block'; });
linkIrLogin.addEventListener('click', () => { vistaRegistro.style.display = 'none'; vistaLogin.style.display = 'block'; });

onAuthStateChanged(auth, async (user) => {
    if (user && user.emailVerified) {
        loginScreen.style.display = 'none'; appScreen.style.display = 'block';
        try {
            const docUsuario = await getDoc(doc(db, "usuarios", user.uid));
            if (docUsuario.exists()) {
                nombreUsuarioActual = docUsuario.data().nombre + " " + docUsuario.data().apellidos;
                nombreUsuarioHeader.textContent = "👋 Hola, " + docUsuario.data().nombre;
            }
        } catch (error) { console.error("Error perfil", error); }
        await cargarMisGrupos(user.uid); 
        cargarCategorias(user.uid); 
        if(grupoActivoSelect.value) { cargarApuntes(grupoActivoSelect.value); }
    } else { loginScreen.style.display = 'flex'; appScreen.style.display = 'none'; contenedorApuntes.innerHTML = ""; notasSeleccionadas.clear(); actualizarContador(); }
});

btnRegister.addEventListener('click', () => {
    const nombre = nombreRegInp.value.trim(), apellidos = apellidosRegInp.value.trim(); const email = emailRegInp.value, pass = passwordRegInp.value, passConf = passwordConfirmRegInp.value;
    if (!nombre || !apellidos) { mostrarToast("Introduce nombre y apellidos.", "error"); return; }
    if (pass !== passConf) { mostrarToast("Las contraseñas no coinciden.", "error"); return; }
    btnRegister.disabled = true; btnRegister.textContent = "Creando cuenta...";
    createUserWithEmailAndPassword(auth, email, pass).then(async (userCredential) => { await setDoc(doc(db, "usuarios", userCredential.user.uid), { nombre, apellidos, email, fechaRegistro: new Date().toISOString() }); sendEmailVerification(userCredential.user).then(() => { signOut(auth); vistaRegistro.style.display = 'none'; vistaLogin.style.display = 'block'; mostrarToast("¡Cuenta creada! Revisa tu email para verificarla.", "success"); }); }).catch((e) => { mostrarToast("Error: " + e.message, "error"); }).finally(() => { btnRegister.disabled = false; btnRegister.textContent = "Crear mi cuenta"; });
});

btnLogin.addEventListener('click', () => {
    btnLogin.disabled = true; btnLogin.textContent = "Entrando...";
    signInWithEmailAndPassword(auth, emailLoginInp.value, passwordLoginInp.value).then((userCredential) => { if (!userCredential.user.emailVerified) { signOut(auth); mostrarToast("Debes verificar tu correo antes de entrar.", "warning"); } else { emailLoginInp.value = ''; passwordLoginInp.value = ''; mostrarToast("Sesión iniciada", "success");} }).catch(() => { mostrarToast("Correo o contraseña incorrectos.", "error"); }).finally(() => { btnLogin.disabled = false; btnLogin.textContent = "Entrar al panel"; });
});
btnLogout.addEventListener('click', () => signOut(auth));

// ==========================================
// 5. GESTIÓN DE GRUPOS
// ==========================================
async function cargarMisGrupos(uid) {
    try {
        const q = query(collection(db, "grupos"), where("miembros", "array-contains", uid)); const qs = await getDocs(q);
        if (qs.empty) { await addDoc(collection(db, "grupos"), { nombre: "Mi Espacio Personal", creador: uid, miembros: [uid], admins: [uid] }); await cargarMisGrupos(uid); return; }
        const oldValue = grupoActivoSelect.value; grupoActivoSelect.innerHTML = '';
        qs.forEach(d => { grupoActivoSelect.innerHTML += `<option value="${d.id}">${d.data().nombre}</option>`; });
        if (oldValue && Array.from(grupoActivoSelect.options).some(opt => opt.value === oldValue)) { grupoActivoSelect.value = oldValue; }
    } catch (e) { console.error("Error", e); }
}
grupoActivoSelect.addEventListener('change', () => { notasSeleccionadas.clear(); actualizarContador(); if(grupoActivoSelect.value) { cargarApuntes(grupoActivoSelect.value); } });

btnGestionarGrupos.addEventListener('click', async () => { modalGrupos.style.display = 'flex'; invitarEmailInp.value = ''; const grupoId = grupoActivoSelect.value; const nombreGrupo = grupoActivoSelect.options[grupoActivoSelect.selectedIndex].text; if (nombreGrupo === "Mi Espacio Personal") { document.getElementById('zonaGestionGrupoActivo').style.display = 'none'; document.getElementById('mensajeEspacioPersonal').style.display = 'block'; return; } document.getElementById('zonaGestionGrupoActivo').style.display = 'block'; document.getElementById('mensajeEspacioPersonal').style.display = 'none'; document.getElementById('nombreGrupoGestion').textContent = nombreGrupo; await pintarMiembros(grupoId); });
btnCerrarModalGrupos.addEventListener('click', () => modalGrupos.style.display = 'none');

async function pintarMiembros(grupoId) {
    const lista = document.getElementById('listaMiembrosGrupo'); lista.innerHTML = "<p style='padding:10px; font-size:13px;'>Cargando lista de miembros...</p>";
    try {
        const grupoDoc = await getDoc(doc(db, "grupos", grupoId)); if (!grupoDoc.exists()) return;
        const grupoData = grupoDoc.data(); const currentUid = auth.currentUser.uid; const adminsList = grupoData.admins || [grupoData.creador]; const soyAdminDelGrupo = adminsList.includes(currentUid);
        document.getElementById('accionesGrupoCreador').style.display = soyAdminDelGrupo ? 'flex' : 'none'; document.getElementById('zonaInvitar').style.display = soyAdminDelGrupo ? 'block' : 'none'; lista.innerHTML = "";

        for (let uid of grupoData.miembros) {
            const userDoc = await getDoc(doc(db, "usuarios", uid)); const userData = userDoc.exists() ? userDoc.data() : { nombre: "Usuario", apellidos: "", email: "Sin correo" }; const esMismoUsuario = uid === currentUid; const esUsuarioListadoAdmin = adminsList.includes(uid);
            let selectorRol = soyAdminDelGrupo ? `<select class="select-rol" data-uid="${uid}" style="padding: 2px 5px; font-size: 11px; margin-left: 5px; border-radius: 4px; background: var(--badge-bg); border: 1px solid var(--border-color); color: var(--text-main); cursor:pointer;"><option value="admin" ${esUsuarioListadoAdmin ? 'selected' : ''}>👑 Admin</option><option value="miembro" ${!esUsuarioListadoAdmin ? 'selected' : ''}>👤 Miembro</option></select>` : `<span style="color:var(--text-muted); font-size:11px; margin-left:5px;">${esUsuarioListadoAdmin ? '👑 Admin' : '👤 Miembro'}</span>`;
            let botonAccion = (soyAdminDelGrupo && !esMismoUsuario) ? `<button class="btn-expulsar" data-uid="${uid}" style="background:none; border:none; color:var(--danger); font-size:12px; font-weight:bold; cursor:pointer;" title="Expulsar">❌ Echar</button>` : (!soyAdminDelGrupo && esMismoUsuario) ? `<button class="btn-salir" data-uid="${uid}" style="background:none; border:none; color:var(--warning); font-size:12px; font-weight:bold; cursor:pointer;" title="Salir del grupo">🚪 Salir</button>` : "";
            lista.innerHTML += `<div class="fila-miembro"><div style="font-size: 13px; line-height: 1.2;"><strong>${userData.nombre} ${userData.apellidos}</strong> ${selectorRol}<br><span style="color:var(--text-muted); font-size:12px;">${userData.email}</span></div>${botonAccion}</div>`;
        }
        document.querySelectorAll('.select-rol').forEach(s => s.addEventListener('change', async (e) => { const uidAfectado = e.target.getAttribute('data-uid'); const nuevoRol = e.target.value; if (nuevoRol === 'miembro') { if (adminsList.length === 1 && adminsList.includes(uidAfectado)) { mostrarToast("Error: El grupo debe tener al menos un Admin.", "error"); e.target.value = 'admin'; return; } await updateDoc(doc(db, "grupos", grupoId), { admins: arrayRemove(uidAfectado) }); } else { await updateDoc(doc(db, "grupos", grupoId), { admins: arrayUnion(uidAfectado) }); } pintarMiembros(grupoId); mostrarToast("Rol actualizado", "success"); }));
        document.querySelectorAll('.btn-expulsar').forEach(b => b.addEventListener('click', async (e) => { if(await mostrarConfirmacion("¿Expulsar a esta persona del grupo?")) { const uEchar = e.target.getAttribute('data-uid'); await updateDoc(doc(db, "grupos", grupoId), { miembros: arrayRemove(uEchar), admins: arrayRemove(uEchar) }); pintarMiembros(grupoId); mostrarToast("Usuario expulsado", "info"); } }));
        document.querySelectorAll('.btn-salir').forEach(b => b.addEventListener('click', async (e) => { if(await mostrarConfirmacion("¿Estás seguro de salir de este grupo?")) { await updateDoc(doc(db, "grupos", grupoId), { miembros: arrayRemove(e.target.getAttribute('data-uid')), admins: arrayRemove(e.target.getAttribute('data-uid')) }); modalGrupos.style.display = 'none'; await cargarMisGrupos(auth.currentUser.uid); if(grupoActivoSelect.value) cargarApuntes(grupoActivoSelect.value); mostrarToast("Has salido del grupo", "info"); } }));
    } catch (e) { console.error(e); }
}

document.getElementById('btnEditarNombreGrupo').addEventListener('click', async () => { const grupoId = grupoActivoSelect.value; const nuevoNombre = prompt("Nuevo nombre para este grupo:", document.getElementById('nombreGrupoGestion').textContent); if (nuevoNombre && nuevoNombre.trim() !== "") { await updateDoc(doc(db, "grupos", grupoId), { nombre: nuevoNombre.trim() }); await cargarMisGrupos(auth.currentUser.uid); document.getElementById('nombreGrupoGestion').textContent = nuevoNombre.trim(); mostrarToast("Nombre cambiado", "success"); } });
document.getElementById('btnBorrarGrupo').addEventListener('click', async () => { const grupoId = grupoActivoSelect.value; if (await mostrarConfirmacion("Vas a borrar el grupo entero y todos perderán el acceso. ¿Proceder?")) { await deleteDoc(doc(db, "grupos", grupoId)); modalGrupos.style.display = 'none'; await cargarMisGrupos(auth.currentUser.uid); if(grupoActivoSelect.value) cargarApuntes(grupoActivoSelect.value); mostrarToast("Grupo eliminado", "success"); } });
btnCrearGrupo.addEventListener('click', async () => { const nombre = nuevoGrupoInp.value.trim(); const uid = auth.currentUser.uid; if(!nombre) { mostrarToast("Ponle un nombre al grupo", "error"); return; } btnCrearGrupo.disabled = true; try { await addDoc(collection(db, "grupos"), { nombre: nombre, creador: uid, miembros: [uid], admins: [uid] }); nuevoGrupoInp.value = ""; await cargarMisGrupos(uid); cargarApuntes(grupoActivoSelect.value); modalGrupos.style.display = 'none'; mostrarToast(`Grupo '${nombre}' creado`, "success"); } catch(e) { mostrarToast("Error al crear grupo", "error"); } btnCrearGrupo.disabled = false; });
btnInvitarMiembro.addEventListener('click', async () => { const email = invitarEmailInp.value.trim().toLowerCase(); const grupoId = grupoActivoSelect.value; if(!email) { mostrarToast("Escribe un email", "error"); return; } btnInvitarMiembro.disabled = true; try { const q = query(collection(db, "usuarios"), where("email", "==", email)); const qs = await getDocs(q); if (qs.empty) { mostrarToast("El usuario no existe en el sistema", "error"); } else { let nUid = ""; qs.forEach(d => { nUid = d.id; }); await updateDoc(doc(db, "grupos", grupoId), { miembros: arrayUnion(nUid) }); mostrarToast("¡Usuario añadido!", "success"); invitarEmailInp.value = ""; pintarMiembros(grupoId); } } catch (e) { mostrarToast("Error al invitar", "error"); } btnInvitarMiembro.disabled = false; });

// ==========================================
// 6. GESTIÓN DE ÁMBITOS Y 7. APUNTES
// ==========================================
async function cargarCategorias(uid) {
    try {
        const q = query(collection(db, "categorias"), where("uid", "==", uid)); const qs = await getDocs(q);
        if (qs.empty) { await addDoc(collection(db, "categorias"), { uid: uid, nombre: "General" }); cargarCategorias(uid); return; }
        let cats = []; qs.forEach(d => cats.push({ id: d.id, nombre: d.data().nombre })); cats.sort((a, b) => a.nombre.localeCompare(b.nombre));
        categoriaInp.innerHTML = ''; filtroCategoria.innerHTML = '<option value="Todos">Todos los ámbitos</option>'; listaCategoriasModal.innerHTML = '';
        cats.forEach(c => {
            categoriaInp.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`; filtroCategoria.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
            listaCategoriasModal.innerHTML += `<div class="item-categoria"><span style="font-weight: 500;">${c.nombre}</span><div class="acciones-cat"><button class="btn-accion btn-edit btn-editar-cat" data-id="${c.id}" data-nombre="${c.nombre}">✏️</button><button class="btn-accion btn-del btn-borrar-cat" data-id="${c.id}">🗑️</button></div></div>`;
        });
        document.querySelectorAll('.btn-borrar-cat').forEach(b => b.addEventListener('click', async (e) => { if(await mostrarConfirmacion("¿Borrar este ámbito?")) { await deleteDoc(doc(db, "categorias", e.target.closest('button').getAttribute('data-id'))); cargarCategorias(uid); mostrarToast("Ámbito borrado", "success"); } }));
        document.querySelectorAll('.btn-editar-cat').forEach(b => b.addEventListener('click', (e) => { const t = e.target.closest('button'); idCategoriaEditando = t.getAttribute('data-id'); nuevaCategoriaInp.value = t.getAttribute('data-nombre'); btnGuardarCategoria.textContent = "Guardar"; }));
    } catch (e) { console.error(e); }
}

btnAbrirModalCategorias.addEventListener('click', () => modalCategorias.style.display = 'flex'); btnCerrarModal.addEventListener('click', () => modalCategorias.style.display = 'none');
btnGuardarCategoria.addEventListener('click', async () => { const nombre = nuevaCategoriaInp.value.trim(); const uid = auth.currentUser.uid; if(!nombre) return; btnGuardarCategoria.disabled = true; try { if (idCategoriaEditando) { await updateDoc(doc(db, "categorias", idCategoriaEditando), { nombre }); idCategoriaEditando = null; btnGuardarCategoria.textContent = "Añadir"; mostrarToast("Ámbito actualizado", "success");} else { await addDoc(collection(db, "categorias"), { uid, nombre }); mostrarToast("Ámbito creado", "success");} nuevaCategoriaInp.value = ""; cargarCategorias(uid); } catch(e) { mostrarToast("Error", "error"); } btnGuardarCategoria.disabled = false; });

function establecerValoresIniciales() { const hoy = new Date(); const año = hoy.getFullYear(), mes = String(hoy.getMonth() + 1).padStart(2, '0'), dia = String(hoy.getDate()).padStart(2, '0'); fechaCreacionInp.value = `${año}-${mes}-${dia}`; filtroFecha.value = `${año}-${mes}-${dia}`; horaInicioInp.value = "09:00"; horaFinInp.value = "10:00"; }
establecerValoresIniciales();

btnGuardarApunte.addEventListener('click', async () => {
    const titulo = tituloTareaInp.value, categoria = categoriaInp.value, fSel = fechaCreacionInp.value, hIni = horaInicioInp.value, hFin = horaFinInp.value;
    const descripcion = quill.root.innerHTML; const textoPlano = quill.getText().trim();
    const u = auth.currentUser; const grupoActivoId = grupoActivoSelect.value; 

    if (!titulo.trim() || textoPlano.length === 0) { mostrarToast("Rellena título y apunte.", "warning"); return; }
    if (!grupoActivoId) { mostrarToast("Error: No tienes grupo seleccionado.", "error"); return; }

    if (u) {
        btnGuardarApunte.disabled = true; btnGuardarApunte.textContent = "Guardando...";
        const fReal = new Date(`${fSel}T${hIni || '00:00'}:00`); const fFinal = fReal.toISOString(); 
        try {
            const dApunte = { titulo, categoria, descripcion, fecha: fFinal, horaInicio: hIni, horaFin: hFin, grupoId: grupoActivoId, autorUid: u.uid, autorNombre: nombreUsuarioActual }; 
            if (idApunteEditando) { await updateDoc(doc(db, "apuntes", idApunteEditando), dApunte); mostrarToast("Apunte actualizado", "success");} 
            else { await addDoc(collection(db, "apuntes"), dApunte); mostrarToast("Apunte guardado", "success");}
            limpiarFormulario(); cargarApuntes(grupoActivoId);
        } catch (e) { mostrarToast("Error al guardar.", "error"); } finally { btnGuardarApunte.disabled = false; }
    }
});

function limpiarFormulario() { idApunteEditando = null; tituloTareaInp.value = ''; quill.setContents([]); establecerValoresIniciales(); tituloSeccionFormulario.textContent = "✨ Nuevo Apunte"; btnGuardarApunte.textContent = "Guardar Apunte"; btnCancelarEdicion.style.display = 'none'; }
btnCancelarEdicion.addEventListener('click', limpiarFormulario);

// ==========================================
// EXPORTACIÓN NATIVA PDF
// ==========================================
function actualizarContador() {
    contadorSeleccion.textContent = notasSeleccionadas.size;
    if (notasSeleccionadas.size > 0) { btnExportarPDF.style.opacity = '1'; btnExportarPDF.style.pointerEvents = 'auto'; } 
    else { btnExportarPDF.style.opacity = '0.5'; btnExportarPDF.style.pointerEvents = 'none'; }
}

btnSeleccionarVisibles.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.chk-exportar');
    let todasMarcadas = true;
    checkboxes.forEach(chk => { if(!chk.checked) todasMarcadas = false; });
    checkboxes.forEach(chk => {
        chk.checked = !todasMarcadas;
        if(chk.checked) notasSeleccionadas.add(chk.getAttribute('data-id'));
        else notasSeleccionadas.delete(chk.getAttribute('data-id'));
    });
    actualizarContador();
    btnSeleccionarVisibles.innerHTML = todasMarcadas ? "☑️ Marcar visibles" : "🔳 Desmarcar visibles";
});

btnExportarPDF.addEventListener('click', () => {
    if(notasSeleccionadas.size === 0) return;
    mostrarToast("Preparando documento...", "info");
    
    const apuntesAExportar = apuntesCargadosMemoria.filter(ap => notasSeleccionadas.has(ap.id));
    apuntesAExportar.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    const nombreGrupo = grupoActivoSelect.options[grupoActivoSelect.selectedIndex].text;
    const fechaHoy = new Date().toLocaleDateString('es-ES');

    let htmlCabecera = `
        <div style="text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 30px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 26px;">Registro de Prácticas</h1>
            <h3 style="margin: 8px 0; color: #555; font-size: 18px;">Grupo: ${nombreGrupo}</h3>
            <p style="margin: 0; font-size: 13px; color: #888;">Generado por: ${nombreUsuarioActual} | Fecha: ${fechaHoy}</p>
        </div>
    `;

    let htmlCuerpo = "";
    apuntesAExportar.forEach(ap => {
        const fechaApunte = new Date(ap.fecha).toLocaleDateString('es-ES');
        const horasTxt = (ap.horaInicio && ap.horaFin) ? `${ap.horaInicio} a ${ap.horaFin}` : "Sin hora";
        
        htmlCuerpo += `
            <div style="margin-bottom: 25px; page-break-inside: avoid; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                <h2 style="font-size: 18px; color: #111; margin: 0 0 10px 0; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                    ${ap.titulo}
                </h2>
                <div style="font-size: 12px; color: #666; margin-bottom: 15px; font-weight: bold;">
                    📅 ${fechaApunte} &nbsp;&nbsp;|&nbsp;&nbsp; ⏱️ ${horasTxt} &nbsp;&nbsp;|&nbsp;&nbsp; 📁 ${ap.categoria || 'Sin ámbito'}
                </div>
                <div style="font-size: 14px; line-height: 1.6; color: #333;" class="ql-editor">
                    ${ap.descripcion}
                </div>
            </div>
        `;
    });

    let oldIframe = document.getElementById('iframePDF');
    if (oldIframe) { oldIframe.remove(); }

    const iframe = document.createElement('iframe');
    iframe.id = 'iframePDF';
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const docIframe = iframe.contentWindow.document;
    docIframe.open();
    docIframe.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Informe_${nombreGrupo.replace(/\s+/g, '_')}</title>
            <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
            <style>
                body { font-family: 'Arial', sans-serif; color: #333; padding: 20px; max-width: 800px; margin: 0 auto; }
                .ql-editor { padding: 0 !important; }
                @media print {
                    body { padding: 0; margin: 0; }
                    @page { margin: 1.5cm; }
                }
            </style>
        </head>
        <body>
            ${htmlCabecera}
            ${htmlCuerpo}
        </body>
        </html>
    `);
    docIframe.close();

    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        mostrarToast("Selecciona 'Guardar como PDF' en la ventana", "success");
        notasSeleccionadas.clear(); actualizarContador(); 
        document.querySelectorAll('.chk-exportar').forEach(chk => chk.checked = false);
    }, 1000);
});

// ==========================================
// RENDERIZADO DE NOTAS
// ==========================================
async function cargarApuntes(grupoId) {
    if(!grupoId) return;
    contenedorApuntes.innerHTML = "<p class='mensaje-vacio'>Cargando...</p>";
    try {
        const grupoDoc = await getDoc(doc(db, "grupos", grupoId));
        const adminsGrupo = grupoDoc.exists() ? (grupoDoc.data().admins || [grupoDoc.data().creador]) : [];
        const currentUid = auth.currentUser.uid;
        const soyAdminDelGrupo = adminsGrupo.includes(currentUid);

        const q = query(collection(db, "apuntes"), where("grupoId", "==", grupoId)); const qs = await getDocs(q);
        
        let lista = []; const catF = filtroCategoria.value, fecF = filtroFecha.value, txtF = filtroTexto.value.toLowerCase(); 
        qs.forEach((d) => {
            const datos = d.data();
            let pC = (catF === "Todos" || datos.categoria === catF), pF = true; 
            if (fecF) { const f = new Date(datos.fecha); pF = (`${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,'0')}-${String(f.getDate()).padStart(2,'0')}` === fecF); }
            let pT = txtF === "" || datos.titulo.toLowerCase().includes(txtF) || datos.descripcion.toLowerCase().includes(txtF);
            if (pC && pF && pT) lista.push({ id: d.id, ...datos });
        });

        apuntesCargadosMemoria = lista;

        let totalMinutos = 0; let conteoAmbitos = {};
        lista.forEach(ap => {
            if (ap.horaInicio && ap.horaFin) {
                let [hI, mI] = ap.horaInicio.split(':').map(Number); let [hF, mF] = ap.horaFin.split(':').map(Number); let dif = (hF * 60 + mF) - (hI * 60 + mI);
                if (dif > 0) totalMinutos += dif; 
            }
            if (ap.categoria) { conteoAmbitos[ap.categoria] = (conteoAmbitos[ap.categoria] || 0) + 1; }
        });
        statTotal.textContent = lista.length; statHoras.textContent = `${Math.floor(totalMinutos / 60)}h ${totalMinutos % 60}m`;
        let ambitoEstrella = "-"; let maxVeces = 0;
        for (let cat in conteoAmbitos) { if (conteoAmbitos[cat] > maxVeces) { maxVeces = conteoAmbitos[cat]; ambitoEstrella = cat; } }
        statAmbito.textContent = ambitoEstrella;

        contenedorApuntes.innerHTML = ""; 
        if (lista.length === 0) { contenedorApuntes.innerHTML = `<p class='mensaje-vacio'>No hay resultados.</p>`; return; }

        const orden = filtroOrden.value;
        lista.sort((a, b) => {
            if (a.destacado && !b.destacado) return -1; if (!a.destacado && b.destacado) return 1;
            const tA = new Date(a.fecha).getTime(); const tB = new Date(b.fecha).getTime();
            return orden === 'desc' ? tB - tA : tA - tB;
        });

        lista.forEach((ap) => {
            const fObj = new Date(ap.fecha); const diaC = fObj.toLocaleDateString('es-ES');
            const eCat = ap.categoria ? `<span class="etiqueta-categoria">${ap.categoria}</span>` : '';
            const eHoras = (ap.horaInicio && ap.horaFin) ? `<div class="pildora-tiempo">⏱️ ${ap.horaInicio} - ${ap.horaFin}</div>` : '';
            
            let tFmt = ap.descripcion; try { if(typeof marked !== 'undefined') tFmt = marked.parse(ap.descripcion); } catch(e){}
            const eAutor = ap.autorNombre ? `<div class="firma-autor">👤 ${ap.autorNombre}</div>` : '';
            const puedoEditar = (ap.autorUid === currentUid) || soyAdminDelGrupo;
            const btnPin = soyAdminDelGrupo ? `<button class="btn-accion btn-pin" data-id="${ap.id}" data-estado="${ap.destacado ? 'true' : 'false'}" style="background:transparent; border:none; font-size:18px; padding: 2px; cursor:pointer;" title="Fijar apunte">${ap.destacado ? '⭐' : '☆'}</button>` : (ap.destacado ? '<span style="font-size:18px;">⭐</span>' : '');
            const btnEditDel = puedoEditar ? `<button class="btn-accion btn-edit btn-editar" data-id="${ap.id}">✏️</button><button class="btn-accion btn-del btn-borrar" data-id="${ap.id}">🗑️</button>` : `<span style="font-size:12px; color:var(--text-muted); font-style:italic;">Solo lectura</span>`;

            const estaSeleccionado = notasSeleccionadas.has(ap.id) ? 'checked' : '';

            // ¡AQUÍ ESTÁ LA MAGIA! La caja 'contenido-nota' controla el scroll máximo,
            // y dentro creamos una cajita nueva con 'ql-editor' que solo controla el diseño del texto.
            contenedorApuntes.innerHTML += `
                <div class="nota-card ${ap.destacado ? 'destacada' : ''}">
                    <div class="nota-header">
                        <div class="nota-header-izq">
                            <input type="checkbox" class="chk-exportar" data-id="${ap.id}" ${estaSeleccionado} title="Seleccionar para PDF">
                            <h4 class="nota-titulo">${ap.titulo} ${eCat}</h4>
                        </div>
                        <div class="nota-acciones">${btnPin} ${btnEditDel}</div>
                    </div>
                    <div class="nota-meta"><div>📅 ${diaC}</div>${eHoras}${eAutor}</div>
                    
                    <div class="contenido-nota">
                        <div class="ql-editor" style="padding: 0; overflow-y: visible; height: auto;">${tFmt}</div>
                    </div>
                </div>`;
        });

        document.querySelectorAll('.chk-exportar').forEach(chk => chk.addEventListener('change', (e) => {
            if (e.target.checked) notasSeleccionadas.add(e.target.getAttribute('data-id'));
            else notasSeleccionadas.delete(e.target.getAttribute('data-id'));
            actualizarContador();
        }));

        document.querySelectorAll('.btn-pin').forEach(b => b.addEventListener('click', async (e) => { const btn = e.target.closest('button'); const id = btn.getAttribute('data-id'); const estadoActual = btn.getAttribute('data-estado') === 'true'; await updateDoc(doc(db, "apuntes", id), { destacado: !estadoActual }); cargarApuntes(grupoId); mostrarToast(!estadoActual ? "Apunte fijado arriba" : "Apunte desmarcado", "success"); }));
        document.querySelectorAll('.btn-borrar').forEach(b => b.addEventListener('click', async (e) => { if (await mostrarConfirmacion("¿Borrar permanentemente este apunte?")) { await deleteDoc(doc(db, "apuntes", e.target.closest('button').getAttribute('data-id'))); cargarApuntes(grupoId); mostrarToast("Apunte eliminado", "info"); } }));
        document.querySelectorAll('.btn-editar').forEach(b => b.addEventListener('click', (e) => { const ap = lista.find(i => i.id === e.target.closest('button').getAttribute('data-id')); if (ap) { idApunteEditando = ap.id; tituloTareaInp.value = ap.titulo; categoriaInp.value = ap.categoria; quill.clipboard.dangerouslyPasteHTML(ap.descripcion); const f = new Date(ap.fecha); fechaCreacionInp.value = `${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,'0')}-${String(f.getDate()).padStart(2,'0')}`; horaInicioInp.value = ap.horaInicio || ""; horaFinInp.value = ap.horaFin || ""; tituloSeccionFormulario.textContent = "✏️ Editando Apunte"; btnGuardarApunte.textContent = "Actualizar Cambios"; btnCancelarEdicion.style.display = 'inline-block'; window.scrollTo({ top: 0, behavior: 'smooth' }); } }));
        
        actualizarContador(); 
    } catch (e) { console.error(e); }
}

filtroCategoria.addEventListener('change', () => cargarApuntes(grupoActivoSelect.value));
filtroFecha.addEventListener('change', () => cargarApuntes(grupoActivoSelect.value));
filtroTexto.addEventListener('input', () => cargarApuntes(grupoActivoSelect.value));
filtroOrden.addEventListener('change', () => cargarApuntes(grupoActivoSelect.value)); 
btnLimpiarFiltros.addEventListener('click', () => { filtroCategoria.value = "Todos"; filtroFecha.value = ""; filtroTexto.value = ""; filtroOrden.value = "desc"; cargarApuntes(grupoActivoSelect.value); });