const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Facility = require('../models/Facility');

exports.createBooking = async (req, res) => {
    try {
        const { facility_id, booking_date, time_slot, hours, total_price } = req.body;
        if (!facility_id || !booking_date || !time_slot || !hours || !total_price) {
            return res.status(400).json({ message: 'All booking fields are required' });
        }
        if (!mongoose.Types.ObjectId.isValid(facility_id)) {
            return res.status(400).json({ message: 'Invalid facility ID' });
        }
        const dateObj = new Date(booking_date);
        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({ message: 'Invalid booking date' });
        }
        if (!req.user || !req.user.email) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        // Prevent Duplicate Booking
        const existingBooking = await Booking.findOne({
            facility_id,
            booking_date: dateObj,
            time_slot,
            status: { $ne: 'cancelled' }
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'This time slot is already booked for this facility.' });
        }

        const newBooking = new Booking({
            facility_id,
            user_email: req.user.email,
            booking_date: dateObj,
            time_slot,
            hours,
            total_price,
            status: 'pending' // Default status
        });

        await newBooking.save();

        // Increment facility booking count
        await Facility.findByIdAndUpdate(facility_id, { $inc: { booking_count: 1 } });

        res.status(201).json({ success: true, message: 'Booking created successfully', booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user_email !== req.user.email && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        booking.status = 'cancelled';
        await booking.save();
        res.status(200).json({ success: true, message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling booking', error: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user_email: req.user.email }).populate('facility_id');
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
};

exports.getBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json({ success: true, status: booking.status });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking status', error: error.message });
    }
};
