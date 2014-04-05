
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  comment: String,
  createdAt: { type: Date, required: true, default: Date.now }
}, { safe: true });

var groupSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  type: { type: String, required: true },
  time: { type: Date, required: true },
  coordinate: { type: [Number], index: '2d' },
  people: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  comments: { type: [commentSchema], default: [] },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now }
}, { safe: true });

module.exports = mongoose.model('group', groupSchema);

