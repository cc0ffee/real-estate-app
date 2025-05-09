import express from 'express';
import session from 'express-session';
import cors from 'cors';
import bParser from 'body-parser';
import { Pool } from 'pg';

const app = express();
const port = 3001;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'realestate',
    password: '',
    port: 5432,
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true}));
app.use(bParser.json());

app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('api/bookings', bookingRoutes);


app.listen(port, () => console.log(`Server online! Listening on port ${port}`));