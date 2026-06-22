const form = document.getElementById('multimediaForm');
const lista = document.getElementById('lista');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  const res = await fetch('/api/multimedia', {
    method: 'POST',
    body: data
  });
  const result = await res.json();
  alert(result.mensaje || "Elemento guardado correctamente 🎵");

  cargarElementos();
});

async function cargarElementos() {
  const res = await fetch('/api/multimedia');
  const elementos = await res.json();
  lista.innerHTML = elementos.map(el => `
    <div class="card">
      <h3>${el.titulo}</h3>
      <p>${el.descripcion || ''}</p>
      <img src="${el.imagenUrl}" width="150">
      <audio controls src="${el.audioUrl}"></audio>
      <p><strong>Tags:</strong> ${el.tags.join(', ')}</p>
      
      <!-- Botones CRUD -->
      <button onclick="mostrarElemento('${el._id}')">👁️ Mostrar</button>
      <button onclick="editarElemento('${el._id}')">✏️ Editar</button>
      <button onclick="eliminarElemento('${el._id}')">🗑️ Eliminar</button>
      <button onclick="crearElemento('${el._id}')">➕ Crear</button>
    </div>
  `).join('');
}

// Mostrar
async function mostrarElemento(id) {
  const res = await fetch(`/api/multimedia/${id}`);
  const el = await res.json();
  alert(
    `📌 Detalles:\n\n` +
    `Título: ${el.titulo}\n` +
    `Descripción: ${el.descripcion || 'Sin descripción'}\n` +
    `Tags: ${el.tags.join(', ')}\n` +
    `Imagen: ${el.imagenUrl}\n` +
    `Audio: ${el.audioUrl}`
  );
}

// Editar
async function editarElemento(id) {
  const nuevoTitulo = prompt("Nuevo título:");
  const nuevaDescripcion = prompt("Nueva descripción:");
  if (!nuevoTitulo && !nuevaDescripcion) return;

  const res = await fetch(`/api/multimedia/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo: nuevoTitulo, descripcion: nuevaDescripcion })
  });
  const data = await res.json();
  alert(data.mensaje || "Elemento actualizado correctamente ✏️");
  cargarElementos();
}

// Eliminar
async function eliminarElemento(id) {
  if (!confirm("¿Seguro que quieres eliminar este elemento?")) return;
  const res = await fetch(`/api/multimedia/${id}`, { method: "DELETE" });
  const data = await res.json();
  alert(data.mensaje);
  cargarElementos();
}

// Crear (duplica un elemento existente)
async function crearElemento(id) {
  const res = await fetch(`/api/multimedia/${id}`);
  const el = await res.json();

  const nuevo = {
    titulo: el.titulo + " (copia)",
    descripcion: el.descripcion,
    imagenUrl: el.imagenUrl,
    audioUrl: el.audioUrl,
    tags: el.tags
  };

  const crearRes = await fetch('/api/multimedia', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevo)
  });
  const data = await crearRes.json();
  alert(data.mensaje || "Elemento creado correctamente ➕");
  cargarElementos();
}

cargarElementos();
