const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken); // All booking routes require authentication

router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.getMyBookings);
router.patch('/:id/cancel', bookingController.cancelBooking);
router.get('/:id/status', bookingController.getBookingStatus);

module.exports = router;
