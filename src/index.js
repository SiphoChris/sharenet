import express from "express";
import cors from "cors";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Generate a unique reference code
const generateReferenceCode = () =>
  crypto.randomBytes(6).toString("hex").toUpperCase();

// Create Booking
app.post("/bookings", async (req, res) => {
  const { name, date, totalSeats } = req.body;

  try {
    // Generate a reference code for the user
    const referenceCode = generateReferenceCode();

    const newBooking = await prisma.booking.create({
      data: {
        name,
        date: new Date(date),
        status: "available",
        reference: referenceCode,
        totalSeats: totalSeats || 100,
        availableSeats: totalSeats || 100,
      },
    });

    // Return booking details including the reference code
    res.status(201).json({
      message: "Booking successful",
      booking: newBooking,
      referenceCode,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Could not create booking" });
  }
});

// Get All Bookings
app.get("/bookings", async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch bookings" });
  }
});

// Get a Single Booking by Reference Code
app.get("/bookings/reference/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const booking = await prisma.booking.findUnique({
      where: { reference: code },
    });

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch booking" });
  }
});

// Update Booking Status
app.patch("/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["available", "sold out"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Could not update booking" });
  }
});

// Book a seat for an event
app.post("/bookings/:id/book", async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
  
    try {
      // Get the current booking
      const booking = await prisma.booking.findUnique({
        where: { id: Number(id) },
      });
  
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
  
      if (booking.status === "sold out" || booking.availableSeats <= 0) {
        return res.status(400).json({ error: "No seats available" });
      }
  
      // Update the booking
      const updatedBooking = await prisma.booking.update({
        where: { id: Number(id) },
        data: {
          availableSeats: booking.availableSeats - 1,
          userEmail: email,
          // If this was the last seat, mark as sold out
          status: booking.availableSeats <= 1 ? "sold out" : "available",
        },
      });
  
      // Return the updated booking with reference code
      res.json({
        message: "Seat booked successfully",
        booking: updatedBooking,
        reference: updatedBooking.reference, // Corrected line
      });
    } catch (error) {
      console.error("Error booking seat:", error);
      res.status(500).json({ error: "Could not book seat" });
    }
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
