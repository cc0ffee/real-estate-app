import express from 'express';
import session from 'express-session';
import cors from 'cors';
import bParser from 'body-parser';
import { Pool } from 'pg';
import userRoutes from './routes/userRoutes';
import propertyRoutes from './routes/propertyRoutes';
import bookingRoutes from './routes/bookingRoutes';

const app = express();
const port = 3001;

export const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'realestate',
    password: 'your_password',
    port: 5432,
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true}));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);


app.listen(port, () => console.log(`Server online! Listening on port ${port}`));