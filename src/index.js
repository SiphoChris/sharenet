import express from 'express';
import cors from 'cors';
import bookingsRoutes from './routes/booking.route.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/bookings', bookingsRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));