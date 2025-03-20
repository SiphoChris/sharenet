import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingByReference,
  updateBookingStatus,
  bookSeat,
} from '../controllers/booking.controller.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/', getAllBookings);
router.get('/reference/:code', getBookingByReference);
router.patch('/:id', updateBookingStatus);
router.post('/:id/book', bookSeat);

export default router;