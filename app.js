// ==========================================
// 1. IMPORTACIONES
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
// ¡OJO! Hemos añadido 'sendEmailVerification'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 2. TUS LLAVES DE FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// REGISTRO DEL SERVICE WORKER (Para instalar la App)
// ==========================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("Service Worker registrado con éxito."))
        .catch((err) => console.log("Error al registrar el Service Worker:", err));
}

// ==========================================
// 3. ELEMENTOS HTML
// ==========================================
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');

// Pantallas Login / Registro
const vistaLogin = document.getElementById('vista-login');
const vistaRegistro = document.getElementById('vista-registro');
const linkIrRegistro = document.getElementById('linkIrRegistro');
const linkIrLogin = document.getElementById('linkIrLogin');

// Inputs Login
const emailLoginInp = document.getElementById('emailLoginInp');
const passwordLoginInp = document.getElementById('passwordLoginInp');
const btnLogin = document.getElementById('btnLogin');
const mensajeErrorLogin = document.getElementById('mensajeErrorLogin');

// Inputs Registro
const emailRegInp = document.getElementById('emailRegInp');
const passwordRegInp = document.getElementById('passwordRegInp');
const passwordConfirmRegInp = document.getElementById('passwordConfirmRegInp');
const btnRegister = document.getElementById('btnRegister');
const mensajeErrorRegistro = document.getElementById('mensajeErrorRegistro');

const btnLogout = document.getElementById('btnLogout');

// Resto de la App
const tituloTareaInp = document.getElementById('tituloTareaInp');
const categoriaInp = document.getElementById('categoriaInp');
const fechaCreacionInp = document.getElementById('fechaCreacionInp');
const descripcionInp = document.getElementById('descripcionInp');
const btnGuardarApunte = document.getElementById('btnGuardarApunte');
const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
const tituloSeccionFormulario = document.getElementById('tituloSeccionFormulario');

const contenedorApuntes = document.getElementById('contenedorApuntes');
const filtroCategoria = document.getElementById('filtroCategoria');
const filtroFecha = document.getElementById('filtroFecha');
const filtroTexto = document.getElementById('filtroTexto');
const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');

const modalCategorias = document.getElementById('modalCategorias');
const btnAbrirModalCategorias = document.getElementById('btnAbrirModalCategorias');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const nuevaCategoriaInp = document.getElementById('nuevaCategoriaInp');
const btnGuardarCategoria = document.getElementById('btnGuardarCategoria');
const listaCategoriasModal = document.getElementById('listaCategoriasModal');

let idApunteEditando = null;
let idCategoriaEditando = null;

// ==========================================
// 4. AUTENTICACIÓN Y SEGURIDAD (¡ACTUALIZADO!)
// ==========================================

// Intercambiar vistas
linkIrRegistro.addEventListener('click', () => {
    vistaLogin.style.display = 'none';
    vistaRegistro.style.display = 'block';
    mensajeErrorLogin.textContent = '';
});

linkIrLogin.addEventListener('click', () => {
    vistaRegistro.style.display = 'none';
    vistaLogin.style.display = 'block';
    mensajeErrorRegistro.textContent = '';
});

// Vigilar sesión general
onAuthStateChanged(auth, (user) => {
    // Solo dejamos entrar si existe usuario Y si ha verificado su email
    if (user && user.emailVerified) {
        loginScreen.style.display = 'none';
        appScreen.style.display = 'block';
        cargarCategorias(user.uid); 
        cargarApuntes(user.uid); 
    } else {
        loginScreen.style.display = 'flex';
        appScreen.style.display = 'none';
        contenedorApuntes.innerHTML = ""; 
    }
});

// Botón de Registrarse
btnRegister.addEventListener('click', () => {
    const email = emailRegInp.value;
    const pass = passwordRegInp.value;
    const passConf = passwordConfirmRegInp.value;

    if (pass !== passConf) {
        mensajeErrorRegistro.style.color = "var(--danger)";
        mensajeErrorRegistro.textContent = "Las contraseñas no coinciden.";
        return;
    }

    btnRegister.disabled = true;
    btnRegister.textContent = "Creando cuenta...";

    createUserWithEmailAndPassword(auth, email, pass)
        .then((userCredential) => {
            // Mandamos el correo oficial de Firebase
            sendEmailVerification(userCredential.user)
                .then(() => {
                    // Cerramos la sesión oculta que hace Firebase por defecto al registrar
                    signOut(auth);
                    
                    // Llevamos al usuario al Login y le avisamos
                    vistaRegistro.style.display = 'none';
                    vistaLogin.style.display = 'block';
                    mensajeErrorLogin.style.color = "green";
                    mensajeErrorLogin.textContent = "¡Cuenta creada! Revisa tu bandeja de entrada (o SPAM) para verificar tu correo antes de entrar.";
                    
                    // Limpiamos cajas
                    emailRegInp.value = ''; passwordRegInp.value = ''; passwordConfirmRegInp.value = '';
                });
        })
        .catch((e) => { 
            mensajeErrorRegistro.style.color = "var(--danger)"; 
            mensajeErrorRegistro.textContent = "Error: " + e.message; 
        })
        .finally(() => {
            btnRegister.disabled = false;
            btnRegister.textContent = "Crear mi cuenta";
        });
});

// Botón de Entrar
btnLogin.addEventListener('click', () => {
    btnLogin.disabled = true;
    btnLogin.textContent = "Entrando...";

    signInWithEmailAndPassword(auth, emailLoginInp.value, passwordLoginInp.value)
        .then((userCredential) => {
            // Comprobamos el correo antes de dejarle pasar
            if (!userCredential.user.emailVerified) {
                signOut(auth); // Le echamos
                mensajeErrorLogin.style.color = "var(--warning)";
                mensajeErrorLogin.textContent = "Debes verificar tu correo electrónico antes de entrar. Revisa tu bandeja de entrada.";
            } else {
                mensajeErrorLogin.textContent = ""; 
                emailLoginInp.value = ''; passwordLoginInp.value = ''; 
            }
        })
        .catch(() => { 
            mensajeErrorLogin.style.color = "var(--danger)"; 
            mensajeErrorLogin.textContent = "Error: Correo o contraseña incorrectos."; 
        })
        .finally(() => {
            btnLogin.disabled = false;
            btnLogin.textContent = "Entrar al panel";
        });
});

btnLogout.addEventListener('click', () => signOut(auth));


// ==========================================
// 5. GESTIÓN DE ÁMBITOS / CATEGORÍAS (Sin cambios)
// ==========================================
async function cargarCategorias(uid) {
    try {
        const q = query(collection(db, "categorias"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            await addDoc(collection(db, "categorias"), { uid: uid, nombre: "General" });
            cargarCategorias(uid); 
            return;
        }

        let categorias = [];
        querySnapshot.forEach(doc => categorias.push({ id: doc.id, nombre: doc.data().nombre }));
        categorias.sort((a, b) => a.nombre.localeCompare(b.nombre));

        categoriaInp.innerHTML = '';
        filtroCategoria.innerHTML = '<option value="Todos">Todos los ámbitos</option>';
        listaCategoriasModal.innerHTML = '';

        categorias.forEach(cat => {
            categoriaInp.innerHTML += `<option value="${cat.nombre}">${cat.nombre}</option>`;
            filtroCategoria.innerHTML += `<option value="${cat.nombre}">${cat.nombre}</option>`;
            
            listaCategoriasModal.innerHTML += `
                <div class="item-categoria">
                    <span style="font-weight: 500;">${cat.nombre}</span>
                    <div class="acciones-cat">
                        <button class="btn-accion btn-edit btn-editar-cat" data-id="${cat.id}" data-nombre="${cat.nombre}">✏️</button>
                        <button class="btn-accion btn-del btn-borrar-cat" data-id="${cat.id}">🗑️</button>
                    </div>
                </div>
            `;
        });

        document.querySelectorAll('.btn-borrar-cat').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm("¿Borrar este ámbito?")){
                    await deleteDoc(doc(db, "categorias", e.target.closest('button').getAttribute('data-id')));
                    cargarCategorias(uid);
                }
            });
        });

        document.querySelectorAll('.btn-editar-cat').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                idCategoriaEditando = target.getAttribute('data-id');
                nuevaCategoriaInp.value = target.getAttribute('data-nombre');
                btnGuardarCategoria.textContent = "Guardar cambios";
            });
        });

    } catch (error) { console.error("Error", error); }
}

btnAbrirModalCategorias.addEventListener('click', () => modalCategorias.style.display = 'flex');
btnCerrarModal.addEventListener('click', () => modalCategorias.style.display = 'none');

btnGuardarCategoria.addEventListener('click', async () => {
    const nombre = nuevaCategoriaInp.value.trim();
    const uid = auth.currentUser.uid;
    if(!nombre) return;

    btnGuardarCategoria.disabled = true;
    try {
        if (idCategoriaEditando) {
            await updateDoc(doc(db, "categorias", idCategoriaEditando), { nombre: nombre });
            idCategoriaEditando = null;
            btnGuardarCategoria.textContent = "Añadir";
        } else {
            await addDoc(collection(db, "categorias"), { uid: uid, nombre: nombre });
        }
        nuevaCategoriaInp.value = "";
        cargarCategorias(uid);
    } catch(e) { console.error(e); }
    btnGuardarCategoria.disabled = false;
});

// ==========================================
// 6. LÓGICA DE APUNTES (CRUD Y FILTROS)
// ==========================================
function establecerFechasIniciales() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    fechaCreacionInp.value = `${año}-${mes}-${dia}`;
    filtroFecha.value = `${año}-${mes}-${dia}`; 
}
establecerFechasIniciales();

btnGuardarApunte.addEventListener('click', async () => {
    const titulo = tituloTareaInp.value;
    const categoria = categoriaInp.value;
    const descripcion = descripcionInp.value;
    const fechaSeleccionada = fechaCreacionInp.value; 
    const u = auth.currentUser; 

    if (titulo.trim() === "" || descripcion.trim() === "") { alert("Rellena título y apunte."); return; }

    if (u) {
        btnGuardarApunte.disabled = true; btnGuardarApunte.textContent = "Guardando...";
        const partes = fechaSeleccionada.split('-'); 
        const fReal = new Date(); fReal.setFullYear(partes[0], partes[1] - 1, partes[2]);
        const fFinal = fReal.toISOString(); 

        try {
            if (idApunteEditando) {
                await updateDoc(doc(db, "apuntes", idApunteEditando), { titulo, categoria, descripcion, fecha: fFinal });
            } else {
                await addDoc(collection(db, "apuntes"), { uid: u.uid, titulo, categoria, descripcion, fecha: fFinal });
            }
            limpiarFormulario();
            cargarApuntes(u.uid);
        } catch (e) { alert("Error al guardar."); } 
        finally { btnGuardarApunte.disabled = false; }
    }
});

function limpiarFormulario() {
    idApunteEditando = null;
    tituloTareaInp.value = ''; descripcionInp.value = '';
    establecerFechasIniciales();
    tituloSeccionFormulario.textContent = "✨ Nuevo Apunte";
    btnGuardarApunte.textContent = "Guardar Apunte";
    btnCancelarEdicion.style.display = 'none';
}

btnCancelarEdicion.addEventListener('click', limpiarFormulario);

async function cargarApuntes(uid) {
    contenedorApuntes.innerHTML = "<p class='mensaje-vacio'>Cargando tus apuntes...</p>";
    try {
        const q = query(collection(db, "apuntes"), where("uid", "==", uid));
        const qs = await getDocs(q);
        contenedorApuntes.innerHTML = ""; 

        if (qs.empty) { contenedorApuntes.innerHTML = "<p class='mensaje-vacio'>Aún no tienes apuntes.</p>"; return; }

        let lista = [];
        const catFiltro = filtroCategoria.value;
        const fecFiltro = filtroFecha.value;
        const txtFiltro = filtroTexto.value.toLowerCase(); 

        qs.forEach((d) => {
            const datos = d.data();
            let pasaCat = (catFiltro === "Todos" || datos.categoria === catFiltro);
            let pasaFec = true; 
            if (fecFiltro) {
                const f = new Date(datos.fecha);
                const fCorta = `${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,'0')}-${String(f.getDate()).padStart(2,'0')}`;
                pasaFec = (fCorta === fecFiltro);
            }
            let pasaTxt = txtFiltro === "" || datos.titulo.toLowerCase().includes(txtFiltro) || datos.descripcion.toLowerCase().includes(txtFiltro);

            if (pasaCat && pasaFec && pasaTxt) lista.push({ id: d.id, ...datos });
        });

        if (lista.length === 0) { contenedorApuntes.innerHTML = `<p class='mensaje-vacio'>No se encontraron resultados.</p>`; return; }

        lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        lista.forEach((ap) => {
            const fFormato = new Date(ap.fecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
            const etiqCat = ap.categoria ? `<span class="etiqueta-categoria">${ap.categoria}</span>` : '';
            let txtFmt = ap.descripcion;
            try { if(typeof marked !== 'undefined') txtFmt = marked.parse(ap.descripcion); } catch(e){}

            contenedorApuntes.innerHTML += `
                <div class="nota-card">
                    <div class="nota-header">
                        <h4 class="nota-titulo">${ap.titulo} ${etiqCat}</h4>
                        <div class="nota-acciones">
                            <button class="btn-accion btn-edit btn-editar" data-id="${ap.id}" title="Editar">✏️</button>
                            <button class="btn-accion btn-del btn-borrar" data-id="${ap.id}" title="Borrar">🗑️</button>
                        </div>
                    </div>
                    <div class="nota-meta">📅 ${fFormato}</div>
                    <div class="contenido-nota">${txtFmt}</div>
                </div>
            `;
        });

        document.querySelectorAll('.btn-borrar').forEach(b => b.addEventListener('click', async (e) => {
            if (confirm("¿Borrar este apunte?")) { await deleteDoc(doc(db, "apuntes", e.target.closest('button').getAttribute('data-id'))); cargarApuntes(uid); }
        }));

        document.querySelectorAll('.btn-editar').forEach(b => b.addEventListener('click', (e) => {
            const ap = lista.find(i => i.id === e.target.closest('button').getAttribute('data-id'));
            if (ap) {
                idApunteEditando = ap.id; tituloTareaInp.value = ap.titulo;
                categoriaInp.value = ap.categoria; descripcionInp.value = ap.descripcion;
                fechaCreacionInp.value = ap.fecha.substring(0, 10);
                tituloSeccionFormulario.textContent = "✏️ Editando Apunte";
                btnGuardarApunte.textContent = "Actualizar Cambios";
                btnCancelarEdicion.style.display = 'inline-block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }));
    } catch (e) { console.error("Error", e); }
}

filtroCategoria.addEventListener('change', () => { const u = auth.currentUser; if(u) cargarApuntes(u.uid); });
filtroFecha.addEventListener('change', () => { const u = auth.currentUser; if(u) cargarApuntes(u.uid); });
filtroTexto.addEventListener('input', () => { const u = auth.currentUser; if(u) cargarApuntes(u.uid); });

btnLimpiarFiltros.addEventListener('click', () => {
    filtroCategoria.value = "Todos"; filtroFecha.value = ""; filtroTexto.value = "";
    const u = auth.currentUser; if(u) cargarApuntes(u.uid);
});