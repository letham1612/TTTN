const mongoose = require('mongoose');

const TypeSchema = new mongoose.Schema({
    Type_name: { type: String, required: true,  unique: true, trim: true,},
}, 
{ timestamps: true });

const Type = mongoose.model('Type', TypeSchema);

module.exports = Type;