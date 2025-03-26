import express from 'express';
import cors from 'cors';
import bookingsRoutes from './routes/booking.route.js';
import { userRouter } from './routes/user.route.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/bookings', bookingsRoutes);
app.use('/users', userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));