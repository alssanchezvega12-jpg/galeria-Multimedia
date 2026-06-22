const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const Multimedia = require('./models/Multimedia');

const app = express();

/* ------------------ MIDDLEWARE ------------------ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // carpeta para archivos subidos

/* ------------------ CONEXIÓN A MONGODB ------------------ */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error de conexión:", err));

/* ------------------ CONFIGURACIÓN DE MULTER ------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

/* ------------------ RUTAS API ------------------ */

// CREATE (imagen + audio + tags)
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
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []
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

// READ uno por ID (para Mostrar 👁️)
app.get('/api/multimedia/:id', async (req, res) => {
  try {
    const elemento = await Multimedia.findById(req.params.id);
    if (!elemento) return res.status(404).json({ mensaje: "Elemento no encontrado" });
    res.json(elemento);
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

// UPDATE general
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
    const tagsArray = Array.isArray(req.body.tags)
      ? req.body.tags
      : req.body.tags.split(',').map(t => t.trim());

    const actualizado = await Multimedia.findByIdAndUpdate(
      req.params.id,
      { $set: { tags: tagsArray } },
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

/* ------------------ FRONTEND ------------------ */
app.use(express.static('public')); // sirve index.html y script.js

/* ------------------ INICIO SERVIDOR ------------------ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
