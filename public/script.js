const API_URL = 'https://galeria-multimedia-hgo7.onrender.com/api/multimedia';
const form = document.getElementById('multimediaForm');
const lista = document.getElementById('lista');

// CONTROL DE ERRORES: Previene fallos si el contenedor "lista" no existe en el HTML
if (!lista) {
  console.warn("Advertencia: No se encontró el elemento con id='lista' en el HTML.");
}

// Crear Elemento (POST)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  try {
    const res = await fetch(API_URL, { method: 'POST', body: data });
    const result = await res.json();
    alert(result.mensaje || "Elemento guardado correctamente 🎵");
    form.reset(); // CORRECCIÓN: Limpia el formulario tras guardar con éxito
    cargarElementos();
  } catch (error) {
    console.error("Error al guardar el elemento:", error);
    alert("Hubo un error al guardar el elemento.");
  }
});

// Cargar elementos y renderizar tarjetas (GET)
async function cargarElementos() {
  if (!lista) return; // Evita errores si no existe el contenedor
  try {
    const res = await fetch(API_URL);
    const elementos = await res.json();

    // CORRECCIÓN: Valida si la API devolvió un arreglo para evitar que .map() falle
    if (!Array.isArray(elementos)) {
      lista.innerHTML = "<p>No hay elementos multimedia disponibles.</p>";
      return;
    }

    lista.innerHTML = elementos.map(el => {
      // CORRECCIÓN: Asegura que el campo tags sea un arreglo antes de usar .join()
      const listaTags = Array.isArray(el.tags) ? el.tags.join(', ') : (el.tags || 'Sin tags');
      
      // CORRECCIÓN: Se usa encodeURIComponent en los botones para que nombres con espacios o caracteres especiales no rompan el HTML
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

// Mostrar un elemento por nombre (GET)
async function mostrarElemento(nombre) {
  try {
    const res = await fetch(`${API_URL}/${nombre}`); // El nombre ya viene con encodeURIComponent desde el botón
    const el = await res.json();
    
    // CORRECCIÓN: Verifica si 'tags' existe y es arreglo antes de unirlo
    const listaTags = Array.isArray(el.tags) ? el.tags.join(', ') : (el.tags || 'Sin tags');
    alert(`📌 Detalles:\n\nTítulo: ${el.titulo}\nDescripción: ${el.descripcion || 'Sin descripción'}\nTags: ${listaTags}`);
  } catch (error) {
    console.error("Error al mostrar el elemento:", error);
  }
}

// Editar Elemento (PUT)
async function editarElemento(nombre) {
  // CORRECCIÓN: decodeURIComponent recupera el nombre original con espacios para mostrarlo en el prompt
  const nombreOriginal = decodeURIComponent(nombre); 
  const nuevoTitulo = prompt("Nuevo título:", nombreOriginal);
  const nuevaDescripcion = prompt("Nueva descripción:");
  
  // Si cancela ambos prompts o los deja vacíos, detiene la ejecución
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
    console.error("Error al editar:", error);
  }
}

// Eliminar Elemento (DELETE)
async function eliminarElemento(nombre) {
  const nombreOriginal = decodeURIComponent(nombre);
  if (!confirm(`¿Seguro que quieres eliminar "${nombreOriginal}"?`)) return;
  
  try {
    const res = await fetch(`${API_URL}/${nombre}`, { method: "DELETE" });
    const data = await res.json();
    alert(data.mensaje || "Elemento eliminado correctamente 🗑️");
    cargarElementos();
  } catch (error) {
    console.error("Error al eliminar:", error);
  }
}

// Duplicar Elemento (POST)
async function duplicarElemento(nombre) {
  try {
    const res = await fetch(`${API_URL}/${nombre}/duplicate`, { method: "POST" });
    const data = await res.json();
    alert(data.mensaje || "Elemento duplicado correctamente ➕");
    cargarElementos();
  } catch (error) {
    console.error("Error al duplicar:", error);
  }
}

// CORRECCIÓN GLOBAL: Expone explícitamente las funciones a la ventana global (window)
// Esto evita de forma definitiva los errores "ReferenceError: ... is not defined" en los botones onclick
window.cargarElementos = cargarElementos;
window.mostrarElemento = mostrarElemento;
window.editarElemento = editarElemento;
window.eliminarElemento = eliminarElemento;
window.duplicarElemento = duplicarElemento;

// Función para el botón global de Actualizar
function solicitarNombreParaEditar() {
  const nombre = prompt("Ingresa el NOMBRE del elemento que deseas editar:");
  if (nombre === null || nombre.trim() === "") return; // Si cancela o está vacío, no hace nada
  
  // Codifica el nombre de forma segura para la URL de la API y llama a la función de editar
  editarElemento(encodeURIComponent(nombre.trim()));
}

// Función para el botón global de Eliminar
function solicitarNombreParaEliminar() {
  const nombre = prompt("Ingresa el NOMBRE del elemento que deseas eliminar:");
  if (nombre === null || nombre.trim() === "") return;
  
  // Codifica el nombre de forma segura para la URL de la API y llama a la función de eliminar
  eliminarElemento(encodeURIComponent(nombre.trim()));
}

// NO OLVIDES EXPONERLAS GLOBALMENTE (junto a las otras del final de tu script)
window.solicitarNombreParaEditar = solicitarNombreParaEditar;
window.solicitarNombreParaEliminar = solicitarNombreParaEliminar;

// Inicializar la carga automática al abrir la página
cargarElementos();
