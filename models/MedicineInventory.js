const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    _id: String, // Change _id to a string type
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    quantity: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
    lastRestockDate: { type: Date, required: true },
    notes: { type: String },
});

// Create a virtual property for stock level
medicineSchema.virtual('stockLevel').get(function () {
    const quantity = this.quantity;
    if (quantity >= 20) {
        return 'high';
    } else if (quantity >= 10) {
        return 'moderate';
    } else {
        return 'low';
    }
});

// Create a Counter schema for auto-incrementing IDs for Medicine Inventory
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequenceValue: { type: Number, default: 100 },
});

const Counter = mongoose.model('Counter', counterSchema);

// Create a function to auto-increment the _id field for Medicine Inventory
medicineSchema.pre('save', function (next) {
    const medicine = this;
    if (!medicine.isNew) {
        // Only auto-increment for new documents
        return next();
    }

    // Find and update the existing counter document for Medicine Inventory
    Counter.findByIdAndUpdate(
        'medicineId', // Use a specific document in the Counter collection for medicine inventory
        { $inc: { sequenceValue: 1 } }, // Increment the sequenceValue
        { new: true, upsert: true }
    )
        .then((counter) => {
            medicine._id = `M${counter.sequenceValue}`; // Add the "M" prefix
            next();
        })
        .catch((error) => {
            next(error);
        });
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;