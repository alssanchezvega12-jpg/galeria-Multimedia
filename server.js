const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Multimedia = require('./models/Multimedia'); // Importar el modelo

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // sirve index.html y script.js
app.use('/uploads', express.static('uploads'));

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("❌ Error de conexión:", err));

// Configuración de Multer para subir imagen y audio
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

/* ------------------ RUTAS ------------------ */
app.use(express.static('public'));


// CREATE
app.post('/api/multimedia', upload.fields([{ name: 'imagen' }, { name: 'audio' }]), async (req, res) => {
  try {
    if (!req.files || !req.files['imagen'] || !req.files['audio']) {
      return res.status(400).json({ mensaje: 'Faltan archivos (imagen o audio)' });
    }

    const imagenUrl = `/uploads/${req.files['imagen'][0].filename}`;
    const audioUrl = `/uploads/${req.files['audio'][0].filename}`;

    const nuevo = new Multimedia({
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      imagenUrl,
      audioUrl,
      tags: req.body.tags ? req.body.tags.split(',') : []
    });

    await nuevo.save();
    res.json({ mensaje: "Elemento guardado correctamente 🎵", data: nuevo });
  } catch (err) {
    console.error("❌ Error al guardar:", err);
    res.status(500).json({ mensaje: "Error al guardar", error: err.message });
  }
});

// READ todos
app.get('/api/multimedia', async (req, res) => {
  try {
    const elementos = await Multimedia.find().sort({ fechaCreacion: -1 });
    res.json(elementos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ filtrando por tag
app.get('/api/multimedia/tag/:tag', async (req, res) => {
  try {
    const resultados = await Multimedia.find({ tags: req.params.tag });
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE general (titulo, descripcion, tags, etc.)
app.put('/api/multimedia/:id', async (req, res) => {
  try {
    const actualizado = await Multimedia.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!actualizado) return res.status(404).json({ mensaje: "Elemento no encontrado" });
    res.json({ mensaje: "Elemento actualizado correctamente ✏️", data: actualizado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE solo tags
app.put('/api/multimedia/:id/tags', async (req, res) => {
  try {
    const actualizado = await Multimedia.findByIdAndUpdate(
      req.params.id,
      { $set: { tags: req.body.tags } }, // req.body.tags debe ser array
      { new: true }
    );
    if (!actualizado) return res.status(404).json({ mensaje: "Elemento no encontrado" });
    res.json({ mensaje: "Tags actualizados correctamente 🏷️", data: actualizado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete('/api/multimedia/:id', async (req, res) => {
  try {
    const eliminado = await Multimedia.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ mensaje: "Elemento no encontrado" });
    res.json({ mensaje: "Elemento eliminado correctamente 🗑️" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ------------------ INICIO SERVIDOR ------------------ */
app.listen(3000, () => console.log("🚀 Servidor en http://localhost:3000"));
