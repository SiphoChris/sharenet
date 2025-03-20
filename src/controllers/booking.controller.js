import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Generate a unique reference code
const generateReferenceCode = () => crypto.randomBytes(6).toString('hex').toUpperCase();

export const createBooking = async (req, res) => {
  const { name, date, totalSeats } = req.body;

  try {
    const referenceCode = generateReferenceCode();
    const newBooking = await prisma.booking.create({
      data: {
        name,
        date: new Date(date),
        status: 'available',
        reference: referenceCode,
        totalSeats: totalSeats || 100,
        availableSeats: totalSeats || 100,
      },
    });

    res.status(201).json({
      message: 'Booking successful',
      booking: newBooking,
      referenceCode,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Could not create booking' });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch bookings' });
  }
};

export const getBookingByReference = async (req, res) => {
  const { code } = req.params;
  try {
    const booking = await prisma.booking.findUnique({
      where: { reference: code },
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch booking' });
  }
};

export const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['available', 'sold out'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Could not update booking' });
  }
};

export const bookSeat = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'sold out' || booking.availableSeats <= 0) {
      return res.status(400).json({ error: 'No seats available' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: Number(id) },
      data: {
        availableSeats: booking.availableSeats - 1,
        userEmail: email,
        status: booking.availableSeats <= 1 ? 'sold out' : 'available',
      },
    });

    res.json({
      message: 'Seat booked successfully',
      booking: updatedBooking,
      reference: updatedBooking.reference,
    });
  } catch (error) {
    console.error('Error booking seat:', error);
    res.status(500).json({ error: 'Could not book seat' });
  }
};