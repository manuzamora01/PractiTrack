[![Netlify Status](https://api.netlify.com/api/v1/badges/98d32035-68df-4dd4-98ad-4dd4fb59eab1/deploy-status)](https://app.netlify.com/projects/practitrack/deploys)

# 📓 PractiTrack - Gestión de Apuntes para Prácticas

PractiTrack es una **Progressive Web App (PWA)** diseñada para estudiantes y profesionales en periodo de prácticas que necesitan llevar un registro diario, organizado y profesional de sus tareas, reuniones y aprendizajes.

---

## 🚀 Características Principales

- 🔐 **Sistema de Autenticación Seguro:** Registro y Login independiente mediante Firebase Auth.
- 📧 **Verificación de Correo:** Validación de cuentas reales para mayor seguridad.
- 📁 **Ámbitos Personalizados:** Crea, edita y gestiona tus propias categorías (Desarrollo, Reuniones, Formación, etc.).
- 📝 **Editor Markdown:** Soporte para texto enriquecido (negritas, listas, títulos) en tus apuntes.
- 🔍 **Búsqueda Inteligente:** Filtros dinámicos por ámbito, fecha y búsqueda de texto libre.
- 📱 **Instalable (PWA):** Úsala como una app nativa en tu móvil Android o iOS.
- ☁️ **Sincronización en la Nube:** Tus datos siempre disponibles gracias a Firestore.

---

## 🛠️ Herramientas y Tecnologías

- **Frontend:** HTML5, CSS3 (Custom Variables & Grid), JavaScript Vanilla (ES6+).
- **Backend (BaaS):** [Google Firebase](https://firebase.google.com/) (Firestore & Auth).
- **Formato de Texto:** [Marked.js](https://marked.js.org/) para renderizado de Markdown.
- **Tipografía:** [Inter](https://fonts.google.com/specimen/Inter) vía Google Fonts.
- **Hosting:** [Netlify](https://www.netlify.com/).
- **PWA:** Service Workers y Web Manifest.

---

## ⚙️ Instalación y Configuración

Si quieres clonar este proyecto y usar tu propia base de datos:

1. Clona el repositorio: `git clone https://github.com/manuzamora01/PractiTrack.git`
2. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
3. Activa **Authentication** (Email/Password) y **Firestore Database**.
4. Copia tus credenciales en el archivo `app.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "",
     authDomain: "",
     projectId: "",
     storageBucket: "",
     messagingSenderId: "",
     appId: ""
   };
   ```
5. Abre el archivo index.html con un servidor local (ej. Live Server en VS Code).

[**✨ Explorar la App en vivo »**](https://practitrack.netlify.app)
