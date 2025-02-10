const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    typeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Type', required: true }, // Liên kết với danh mục lớn
}, { timestamps: true });

const SubCategory = mongoose.model('SubCategory', SubCategorySchema);
module.exports = SubCategory;
