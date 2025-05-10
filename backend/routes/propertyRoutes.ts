import express from 'express';
import { pool } from '../index';

const router = express.Router();

// GET properties for a specific agent
router.get('/agent/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Property WHERE user_id = $1', [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ error: 'Failed to retrieve properties' });
  }
});

router.get('/search', async (req, res) => {
  const {
    city,
    state,
    type,
    min_price,
    max_price,
    min_bedrooms,
    order_by
  } = req.query;

  let query = `
    SELECT 
      p.*, 
      pr.amount, 
      COALESCE(h.rooms, a.rooms) AS rooms
    FROM Property p
    LEFT JOIN House h ON p.prop_id = h.prop_id
    LEFT JOIN Apartment a ON p.prop_id = a.prop_id
    LEFT JOIN Price pr ON p.prop_id = pr.prop_id
    WHERE p.availability = true
  `;

  const values: any[] = [];
  let i = 1;

  if (city) {
    query += ` AND p.city ILIKE $${i++}`;
    values.push(`%${city}%`);
  }

  if (state) {
    query += ` AND p.state ILIKE $${i++}`;
    values.push(`%${state}%`);
  }

  if (type) {
    query += ` AND p.type = $${i++}`;
    values.push(type);
  }

  if (min_price) {
    query += ` AND pr.amount >= $${i++}`;
    values.push(Number(min_price));
  }

  if (max_price) {
    query += ` AND pr.amount <= $${i++}`;
    values.push(Number(max_price));
  }

  if (min_bedrooms) {
    query += ` AND COALESCE(h.rooms, a.rooms) >= $${i++}`;
    values.push(Number(min_bedrooms));
  }

  if (order_by === 'price') {
    query += ` ORDER BY pr.amount ASC`;
  } else if (order_by === 'bedrooms') {
    query += ` ORDER BY rooms ASC`;
  }

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching filtered properties:', err);
    res.status(500).json({ error: 'Failed to fetch filtered properties' });
  }
});

router.post('/', async (req, res) => {
  const { user_id, address, city, state, description, availability, type, subtypeData, price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Property (user_id, address, city, state, description, availability, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING prop_id',
      [user_id, address, city, state, description, availability, type]
    );
    const prop_id = result.rows[0].prop_id;

    await pool.query(
      'INSERT INTO Price (prop_id, amount) VALUES ($1, $2)',
      [prop_id, price]
    );

    if (type === 'House') {
      await pool.query('INSERT INTO House (prop_id, rooms, sq_ft) VALUES ($1, $2, $3)', [prop_id, subtypeData.rooms, subtypeData.sq_ft]);
    } else if (type === 'Apartment') {
      await pool.query('INSERT INTO Apartment (prop_id, rooms, sq_ft, building_type) VALUES ($1, $2, $3, $4)', [prop_id, subtypeData.rooms, subtypeData.sq_ft, subtypeData.building_type]);
    } else if (type === 'CommercialBuilding') {
      await pool.query('INSERT INTO CommercialBuilding (prop_id, sq_ft, business_type) VALUES ($1, $2, $3)', [prop_id, subtypeData.sq_ft, subtypeData.business_type]);
    }

    res.status(201).json({ message: 'Property added', prop_id });
  } catch (err) {
    console.error('Error adding property:', err);
    res.status(500).json({ error: 'Failed to add property' });
  }
});

router.put('/:prop_id', async (req, res) => {
  const { prop_id } = req.params;
  const { user_id, address, city, state, description, availability, type, subtypeData, price } = req.body;
  try {
    const ownership = await pool.query('SELECT 1 FROM Property WHERE prop_id = $1 AND user_id = $2', [prop_id, user_id]);
    if (ownership.rowCount === 0) return res.status(403).json({ error: 'Forbidden: You do not own this property' });

    await pool.query(
      'UPDATE Property SET address = $1, city = $2, state = $3, description = $4, availability = $5, type = $6 WHERE prop_id = $7',
      [address, city, state, description, availability, type, prop_id]
    );

    await pool.query(
      'INSERT INTO Price (prop_id, amount) VALUES ($1, $2) ON CONFLICT (prop_id) DO UPDATE SET amount = $2',
      [prop_id, price]
    );

    if (type === 'House') {
      await pool.query('DELETE FROM Apartment WHERE prop_id = $1', [prop_id]);
      await pool.query('DELETE FROM CommercialBuilding WHERE prop_id = $1', [prop_id]);
      await pool.query('INSERT INTO House (prop_id, rooms, sq_ft) VALUES ($1, $2, $3) ON CONFLICT (prop_id) DO UPDATE SET rooms = $2, sq_ft = $3', [prop_id, subtypeData.rooms, subtypeData.sq_ft]);
    } else if (type === 'Apartment') {
      await pool.query('DELETE FROM House WHERE prop_id = $1', [prop_id]);
      await pool.query('DELETE FROM CommercialBuilding WHERE prop_id = $1', [prop_id]);
      await pool.query('INSERT INTO Apartment (prop_id, rooms, sq_ft, building_type) VALUES ($1, $2, $3, $4) ON CONFLICT (prop_id) DO UPDATE SET rooms = $2, sq_ft = $3, building_type = $4', [prop_id, subtypeData.rooms, subtypeData.sq_ft, subtypeData.building_type]);
    } else if (type === 'CommercialBuilding') {
      await pool.query('DELETE FROM House WHERE prop_id = $1', [prop_id]);
      await pool.query('DELETE FROM Apartment WHERE prop_id = $1', [prop_id]);
      await pool.query('INSERT INTO CommercialBuilding (prop_id, sq_ft, business_type) VALUES ($1, $2, $3) ON CONFLICT (prop_id) DO UPDATE SET sq_ft = $2, business_type = $3', [prop_id, subtypeData.sq_ft, subtypeData.business_type]);
    }

    res.json({ message: 'Property updated' });
  } catch (err) {
    console.error('Error updating property:', err);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE property (only if agent owns it)
router.delete('/:prop_id', async (req, res) => {
  const { prop_id } = req.params;
  const { user_id } = req.query;
  try {
    const ownership = await pool.query('SELECT 1 FROM Property WHERE prop_id = $1 AND user_id = $2', [prop_id, user_id]);
    if (ownership.rowCount === 0) return res.status(403).json({ error: 'Forbidden: You do not own this property' });

    await pool.query('DELETE FROM House WHERE prop_id = $1', [prop_id]);
    await pool.query('DELETE FROM Apartment WHERE prop_id = $1', [prop_id]);
    await pool.query('DELETE FROM CommercialBuilding WHERE prop_id = $1', [prop_id]);
    await pool.query('DELETE FROM Property WHERE prop_id = $1', [prop_id]);
    res.json({ message: 'Property deleted' });
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

export default router;