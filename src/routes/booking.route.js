import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingByReference,
  updateBookingStatus,
  bookSeat,
} from '../controllers/booking.controller.js';

const bookingRouter = express.Router();

bookingRouter.post('/', createBooking);
bookingRouter.get('/', getAllBookings);
bookingRouter.get('/reference/:code', getBookingByReference);
bookingRouter.patch('/:id', updateBookingStatus);
bookingRouter.post('/:id/book', bookSeat);

export default bookingRouter