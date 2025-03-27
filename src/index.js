import express from 'express';
import cors from 'cors';
import bookingsRoutes from './routes/booking.route.js';
import { userRouter } from './routes/user.route.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/bookings', bookingsRoutes);
app.use('/user', userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));