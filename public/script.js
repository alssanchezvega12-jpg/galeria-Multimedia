const API_URL = 'https://galeria-multimedia-hgo7.onrender.com/api/multimedia';
const form = document.getElementById('multimediaForm');
const lista = document.getElementById('lista');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  const res = await fetch(API_URL, { method: 'POST', body: data });
  const result = await res.json();
  alert(result.mensaje || "Elemento guardado correctamente 🎵");
  cargarElementos();
});

// Cargar elementos y renderizar tarjetas
async function cargarElementos() {
  try {
    const res = await fetch(API_URL);
    const elementos = await res.json();

    lista.innerHTML = elementos.map(el => `
      <div class="card">
        <h3>${el.titulo}</h3>
        <p>${el.descripcion || 'Sin descripción'}</p>
        <img src="${el.imagenUrl}" alt="${el.titulo}" width="150">
        <audio controls src="${el.audioUrl}"></audio>
        <p><strong>Tags:</strong> ${el.tags.join(', ')}</p>
        <div>
          <button onclick="mostrarElemento('${el.titulo}')">👁️ Mostrar</button>
          <button onclick="editarElemento('${el.titulo}')">✏️ Editar</button>
          <button onclick="eliminarElemento('${el.titulo}')">🗑️ Eliminar</button>
          <button onclick="duplicarElemento('${el.titulo}')">➕ Duplicar</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error("Error al cargar elementos:", error);
  }
}

// Mostrar
async function mostrarElemento(nombre) {
  const res = await fetch(`${API_URL}/${nombre}`);
  const el = await res.json();
  alert(`📌 Detalles:\n\nTítulo: ${el.titulo}\nDescripción: ${el.descripcion}\nTags: ${el.tags.join(', ')}`);
}

// Editar
async function editarElemento(nombre) {
  const nuevoTitulo = prompt("Nuevo título:");
  const nuevaDescripcion = prompt("Nueva descripción:");
  if (!nuevoTitulo && !nuevaDescripcion) return;

  const res = await fetch(`${API_URL}/${nombre}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo: nuevoTitulo, descripcion: nuevaDescripcion })
  });
  const data = await res.json();
  alert(data.mensaje || "Elemento actualizado correctamente ✏️");
  cargarElementos();
}

// Eliminar
async function eliminarElemento(nombre) {
  if (!confirm(`¿Seguro que quieres eliminar "${nombre}"?`)) return;
  const res = await fetch(`${API_URL}/${nombre}`, { method: "DELETE" });
  const data = await res.json();
  alert(data.mensaje);
  cargarElementos();
}

// Duplicar
async function duplicarElemento(nombre) {
  const res = await fetch(`${API_URL}/${nombre}/duplicate`, { method: "POST" });
  const data = await res.json();
  alert(data.mensaje || "Elemento duplicado correctamente ➕");
  cargarElementos();
}

// Inicializar
cargarElementos();
