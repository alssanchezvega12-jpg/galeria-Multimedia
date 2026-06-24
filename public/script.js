// URL de tu API de Render vinculada de forma definitiva
const API_URL = 'https://galeria-multimedia-hgo7.onrender.com/api/multimedia';
const form = document.getElementById('multimediaForm');
const lista = document.getElementById('lista');

// 1. Crear Elemento (POST)
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita que la página se recargue por el método HTML antiguo
  const data = new FormData(form);

  try {
    const res = await fetch(API_URL, { method: 'POST', body: data });
    const result = await res.json();
    alert(result.mensaje || "Elemento guardado correctamente 🎵");
    form.reset(); 
    cargarElementos();
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("Hubo un error al conectar con el servidor de Render.");
  }
});

// 2. Cargar elementos y renderizar tarjetas (GET)
async function cargarElementos() {
  if (!lista) return;
  try {
    const res = await fetch(API_URL);
    const elementos = await res.json();

    if (!Array.isArray(elementos)) {
      lista.innerHTML = "<p>No hay elementos multimedia disponibles en este momento.</p>";
      return;
    }

    lista.innerHTML = elementos.map(el => {
      const listaTags = Array.isArray(el.tags) ? el.tags.join(', ') : (el.tags || 'Sin tags');
      // Codificación de seguridad para strings con espacios (ej: nombres de canciones)
      const nombreEscapado = encodeURIComponent(el.titulo);

      return `
        <div class="card">
          <h3>${el.titulo}</h3>
          <p>${el.descripcion || 'Sin descripción'}</p>
          <img src="${el.imagenUrl}" alt="${el.titulo}" width="150">
          <audio controls src="${el.audioUrl}"></audio>
          <p><strong>Tags:</strong> ${listaTags}</p>
          <div>
            <button onclick="mostrarElemento('${nombreEscapado}')">👁️ Mostrar</button>
            <button onclick="editarElemento('${nombreEscapado}')">✏️ Editar</button>
            <button onclick="eliminarElemento('${nombreEscapado}')">🗑️ Eliminar</button>
            <button onclick="duplicarElemento('${nombreEscapado}')">➕ Duplicar</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error("Error al cargar elementos:", error);
  }
}

// 3. Mostrar un elemento específico por Nombre (GET)
async function mostrarElemento(nombre) {
  try {
    const res = await fetch(`${API_URL}/${nombre}`);
    const el = await res.json();
    const listaTags = Array.isArray(el.tags) ? el.tags.join(', ') : (el.tags || 'Sin tags');
    alert(`📌 Detalles:\n\nTítulo: ${el.titulo}\nDescripción: ${el.descripcion || 'Sin descripción'}\nTags: ${listaTags}`);
  } catch (error) {
    console.error("Error al mostrar el elemento:", error);
  }
}

// 4. Editar por Nombre (PUT)
async function editarElemento(nombre) {
  const nombreOriginal = decodeURIComponent(nombre); 
  const nuevoTitulo = prompt("Nuevo título para el elemento:", nombreOriginal);
  const nuevaDescripcion = prompt("Nueva descripción para el elemento:");
  
  if (nuevoTitulo === null && nuevaDescripcion === null) return;

  try {
    const res = await fetch(`${API_URL}/${nombre}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        titulo: nuevoTitulo || undefined, 
        descripcion: nuevaDescripcion || undefined 
      })
    });
    const data = await res.json();
    alert(data.mensaje || "Elemento actualizado correctamente ✏️");
    cargarElementos();
  } catch (error) {
    console.error("Error al editar el elemento:", error);
  }
}

// 5. Eliminar por Nombre (DELETE)
async function eliminarElemento(nombre) {
  const nombreOriginal = decodeURIComponent(nombre);
  if (!confirm(`¿Seguro que quieres eliminar definitivamente "${nombreOriginal}"?`)) return;
  
  try {
    const res = await fetch(`${API_URL}/${nombre}`, { method: "DELETE" });
    const data = await res.json();
    alert(data.mensaje || "Elemento eliminado correctamente 🗑️");
    cargarElementos();
  } catch (error) {
    console.error("Error al eliminar el elemento:", error);
  }
}

// 6. Duplicar por Nombre (POST)
async function duplicarElemento(nombre) {
  try {
    const res = await fetch(`${API_URL}/${nombre}/duplicate`, { method: "POST" });
    const data = await res.json();
    alert(data.mensaje || "Elemento duplicado correctamente ➕");
    cargarElementos();
  } catch (error) {
    console.error("Error al duplicar el elemento:", error);
  }
}

// 7. Lógica para los botones interactivos del menú HTML (Piden el nombre de texto)
function solicitarNombreParaEditar() {
  const nombre = prompt("Escribe el NOMBRE exacto del elemento que quieres EDITAR:");
  if (!nombre || nombre.trim() === "") return;
  editarElemento(encodeURIComponent(nombre.trim()));
}

function solicitarNombreParaEliminar() {
  const nombre = prompt("Escribe el NOMBRE exacto del elemento que quieres ELIMINAR:");
  if (!nombre || nombre.trim() === "") return;
  eliminarElemento(encodeURIComponent(nombre.trim()));
}

// Registro explícito en el objeto Window (Solución total a "is not defined")
window.cargarElementos = cargarElementos;
window.mostrarElemento = mostrarElemento;
window.editarElemento = editarElemento;
window.eliminarElemento = eliminarElemento;
window.duplicarElemento = duplicarElemento;
window.solicitarNombreParaEditar = solicitarNombreParaEditar;
window.solicitarNombreParaEliminar = solicitarNombreParaEliminar;

// Carga inicial automatizada de tus datos de Render
cargarElementos();
