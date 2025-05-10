import express from 'express';
import { pool } from '../index';

const router = express.Router();

// POST /api/bookings - create a new booking
router.post('/', async (req, res) => {
  const { user_id, prop_id, credit_id, start, end } = req.body;

  if (!user_id || !prop_id || !credit_id || !start || !end) {
    return res.status(400).json({ error: 'Missing required booking fields' });
  }

  try {
    // Fetch price for property
    const priceResult = await pool.query('SELECT amount FROM Price WHERE prop_id = $1', [prop_id]);
    if (priceResult.rowCount === 0) {
      return res.status(404).json({ error: 'No price found for property' });
    }

    const amount = priceResult.rows[0].amount;
    const days = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24);
    const totalCost = days > 0 ? days * amount : 0;

    const insert = await pool.query(
      'INSERT INTO Booking (prop_id, user_id, credit_id, start, "end", status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING book_id',
      [prop_id, user_id, credit_id, start, end, 'confirmed']
    );

    res.status(201).json({ message: 'Booking confirmed', book_id: insert.rows[0].book_id, total_cost: totalCost });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get bookings for a prospective renter
router.get('/renter/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
      const result = await pool.query(
        `SELECT b.*, p.address, p.city, p.state, pr.amount, cc.card_number
         FROM Booking b
         JOIN Property p ON b.prop_id = p.prop_id
         LEFT JOIN Price pr ON b.prop_id = pr.prop_id
         LEFT JOIN CreditCards cc ON b.credit_id = cc.credit_id
         WHERE b.user_id = $1`,
        [user_id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching renter bookings:', err);
      res.status(500).json({ error: 'Failed to retrieve bookings' });
    }
  });
  
  // Get bookings for an agent's properties
  router.get('/agent/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
      const result = await pool.query(
        `SELECT b.*, p.address, p.city, p.state, pr.amount, u.name AS renter_name, cc.card_number
         FROM Booking b
         JOIN Property p ON b.prop_id = p.prop_id
         LEFT JOIN Price pr ON p.prop_id = pr.prop_id
         JOIN Users u ON b.user_id = u.user_id
         LEFT JOIN CreditCards cc ON b.credit_id = cc.credit_id
         WHERE p.user_id = $1`,
        [user_id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching agent bookings:', err);
      res.status(500).json({ error: 'Failed to retrieve agent bookings' });
    }
  });
  
  // Cancel a booking
  router.delete('/:book_id', async (req, res) => {
    const { book_id } = req.params;
    try {
      await pool.query('DELETE FROM Booking WHERE book_id = $1', [book_id]);
      res.json({ message: 'Booking cancelled and refunded (if applicable).' });
    } catch (err) {
      console.error('Error cancelling booking:', err);
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  });

export default router;