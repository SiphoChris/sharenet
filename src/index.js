import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();
const app = new Hono();

// GET endpoint to fetch available sessions
app.get('/sessions', async (c) => {
  try {
    const currentDate = new Date();
    
    // Get all future sessions
    const sessions = await prisma.session.findMany({
      where: {
        date: {
          gte: currentDate
        }
      },
      orderBy: {
        date: 'asc'
      },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    });
    
    // Calculate availability for each session
    const sessionsWithAvailability = sessions.map(session => {
      const bookedSpots = session._count.bookings;
      const availableSpots = session.capacity - bookedSpots;
      const isSoldOut = availableSpots <= 0;
      
      // Remove _count from response and add availability info
      const { _count, ...sessionData } = session;
      
      return {
        ...sessionData,
        bookedSpots,
        availableSpots,
        isSoldOut
      };
    });
    
    return c.json({
      success: true,
      data: sessionsWithAvailability
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return c.json({
      success: false,
      message: 'Failed to fetch sessions',
      error: error.message
    }, 500);
  }
});

// POST endpoint to create a new booking
app.post('/bookings', async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, name, email, phone } = body;
    
    // Validate required fields
    if (!sessionId || !name || !email) {
      return c.json({
        success: false,
        message: 'Missing required fields: sessionId, name, and email are required'
      }, 400);
    }
    
    // Check if session exists and has availability
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    });
    
    if (!session) {
      return c.json({
        success: false,
        message: 'Session not found'
      }, 404);
    }
    
    // Check if session is already sold out
    if (session._count.bookings >= session.capacity) {
      return c.json({
        success: false,
        message: 'Session is sold out'
      }, 400);
    }
    
    // Check if user already has a booking for this session
    const existingBooking = await prisma.booking.findFirst({
      where: {
        sessionId,
        email
      }
    });
    
    if (existingBooking) {
      return c.json({
        success: false,
        message: 'You have already booked this session'
      }, 400);
    }
    
    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        sessionId,
        name,
        email,
        phone
      }
    });
    
    return c.json({
      success: true,
      message: 'Booking confirmed',
      data: booking
    }, 201);
  } catch (error) {
    console.error('Error creating booking:', error);
    return c.json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    }, 500);
  }
});

// POST endpoint to create a new session (admin functionality)
app.post('/sessions', async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, date, startTime, endTime, capacity, location } = body;
    
    // Validate required fields
    if (!title || !date || !startTime || !endTime || !capacity) {
      return c.json({
        success: false,
        message: 'Missing required fields: title, date, startTime, endTime, and capacity are required'
      }, 400);
    }
    
    // Create the session
    const session = await prisma.session.create({
      data: {
        title,
        description,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity: parseInt(capacity),
        location
      }
    });
    
    return c.json({
      success: true,
      message: 'Session created',
      data: session
    }, 201);
  } catch (error) {
    console.error('Error creating session:', error);
    return c.json({
      success: false,
      message: 'Failed to create session',
      error: error.message
    }, 500);
  }
});

// Keep your existing routes for testing
app.get('/', async (c) => {
  try {
    const result = await prisma.$queryRaw`SELECT version()`;
    return c.text(`Hello, World! Database connected. PostgreSQL version: ${result[0].version}`);
  } catch (error) {
    console.error('Database connection error:', error);
    return c.text('Error connecting to database', 500);
  }
});

export default app;