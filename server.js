const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Servir carpeta uploads como pública
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Conectado a MongoDB Atlas"))
.catch(err => console.error("❌ Error de conexión:", err));

// Esquema y modelo
const multimediaSchema = new mongoose.Schema({
  titulo: String,
  descripcion: String,
  imagenUrl: String,
  audioUrl: String,
  tags: [String]
});
const Multimedia = mongoose.model('Multimedia', multimediaSchema);

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// CREATE (con archivos)
app.post('/api/multimedia', upload.fields([{ name: 'imagen' }, { name: 'audio' }]), async (req, res) => {
  try {
    const nuevo = new Multimedia({
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      imagenUrl: req.files['imagen'] ? '/uploads/' + req.files['imagen'][0].filename : '',
      audioUrl: req.files['audio'] ? '/uploads/' + req.files['audio'][0].filename : '',
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []
    });
    await nuevo.save();
    res.json({ mensaje: "Elemento guardado correctamente 🎵", data: nuevo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ todos
app.get('/api/multimedia', async (req, res) => {
  try {
    const elementos = await Multimedia.find().sort({ _id: -1 });
    res.json(elementos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ uno
app.get('/api/multimedia/:id', async (req, res) => {
  try {
    const el = await Multimedia.findById(req.params.id);
    res.json(el);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put('/api/multimedia/:id', async (req, res) => {
  try {
    const actualizado = await Multimedia.findByIdAndUpdate(
      req.params.id,
      { titulo: req.body.titulo, descripcion: req.body.descripcion },
      { new: true }
    );
    res.json({ mensaje: "Elemento actualizado correctamente ✏️", data: actualizado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete('/api/multimedia/:id', async (req, res) => {
  try {
    await Multimedia.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Elemento eliminado correctamente 🗑️" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DUPLICATE
app.post('/api/multimedia/:id/duplicate', async (req, res) => {
  try {
    const original = await Multimedia.findById(req.params.id);
    if (!original) return res.status(404).json({ mensaje: "Elemento no encontrado" });

    const copia = new Multimedia({
      titulo: original.titulo + " (copia)",
      descripcion: original.descripcion,
      imagenUrl: original.imagenUrl,
      audioUrl: original.audioUrl,
      tags: original.tags
    });

    await copia.save();
    res.json({ mensaje: "Elemento duplicado correctamente ➕", data: copia });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Root
app.get('/', (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// Escuchar
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
