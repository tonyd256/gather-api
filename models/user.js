
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: { type: String, required: true },
  deviceID: { type: String, required: true, unique: true },
  pushID: String,
  pushEnabled: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now }
}, { safe: true });

module.exports = mongoose.model('user', userSchema);

