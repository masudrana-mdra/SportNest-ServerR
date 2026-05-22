const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    facility_type: { type: String, required: true },
    image: {
        type: String,
        required: true,
        match: [/^https?:\/\//i, 'Image URL must start with http:// or https://']
    },
    location: { type: String, required: true },
    price_per_hour: { type: Number, required: true },
    capacity: { type: Number, required: true },
    available_slots: { type: [String], required: true },
    description: { type: String, required: true },
    owner_email: { type: String, required: true },
    booking_count: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Facility', facilitySchema);
