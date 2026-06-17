const mongoose = require('mongoose');

const ElementoMultimediaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: String,
  imagenUrl: { type: String, required: true },
  audioUrl: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
  tags: { type: [String], default: [] } // Array de etiquetas
});

module.exports = mongoose.model('Multimedia', ElementoMultimediaSchema);

