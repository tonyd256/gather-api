
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  comment: String,
  createdAt: { type: Date, required: true, default: Date.now }
});

var groupSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  type: { type: String, required: true },
  time: { type: Date, required: true },
  latitude: Number,
  longitude: Number,
  people: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  comments: [commentSchema],
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('group', groupSchema);

