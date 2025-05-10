import express from 'express';
import { pool } from '../index';

const router = express.Router();

router.post('/', async (req, res) => {
    const { prop_id, user_id, credit_id, start, end } = req.body;
  
    try {
      // Get daily price
      const priceRes = await pool.query('SELECT amount FROM Price WHERE prop_id = $1', [prop_id]);
      if (priceRes.rowCount === 0) return res.status(404).json({ error: 'Price not found' });
  
      const price = parseFloat(priceRes.rows[0].amount);
      const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24));
  
      if (days <= 0) return res.status(400).json({ error: 'Invalid booking dates' });
  
      const totalCost = days * price;
  
      // Check budget
      const budgetRes = await pool.query('SELECT budget FROM ProspectiveRenters WHERE user_id = $1', [user_id]);
      if (budgetRes.rowCount === 0) return res.status(404).json({ error: 'Renter not found' });
  
      const currentBudget = parseFloat(budgetRes.rows[0].budget);
      if (currentBudget < totalCost) return res.status(400).json({ error: 'Insufficient budget' });
  
      // Deduct from budget
      await pool.query('UPDATE ProspectiveRenters SET budget = budget - $1 WHERE user_id = $2', [totalCost, user_id]);
  
      // Insert booking
      const result = await pool.query(`
        INSERT INTO Booking (prop_id, user_id, credit_id, start, "end", status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING book_id
      `, [prop_id, user_id, credit_id, start, end, 'confirmed']);
  
      res.status(201).json({ message: 'Booking successful', book_id: result.rows[0].book_id, totalCost });
  
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
  
  router.delete('/:booking_id', async (req, res) => {
    const { booking_id } = req.params;
  
    try {
      // 1. Get booking details
      const result = await pool.query(`
        SELECT b.*, p.user_id AS agent_id, pr.amount
        FROM Booking b
        JOIN Property p ON b.prop_id = p.prop_id
        JOIN Price pr ON p.prop_id = pr.prop_id
        WHERE b.book_id = $1
      `, [booking_id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }
  
      const booking = result.rows[0];
      const { user_id, start, end, amount } = booking;
  
      // 2. Calculate rental duration
      const startDate = new Date(start);
      const endDate = new Date(end);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const totalRefund = days * parseFloat(amount);
  
      // 3. Refund to renter's budget (if exists)
      await pool.query(`
        UPDATE ProspectiveRenters 
        SET budget = budget + $1 
        WHERE user_id = $2
      `, [totalRefund, user_id]);
  
      // 4. Delete the booking
      await pool.query(`DELETE FROM Booking WHERE book_id = $1`, [booking_id]);
  
      res.json({ message: 'Booking canceled and refund processed', refund: totalRefund });
  
    } catch (err) {
      console.error('Error canceling booking:', err);
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  });

export default router;