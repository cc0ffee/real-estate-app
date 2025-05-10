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
  try {
    const { city, state, type, bedrooms, minPrice, maxPrice, order, date } = req.query;

    let conditions = [];
    let values = [];
    let idx = 1;

    if (city) {
      conditions.push(`p.city ILIKE $${idx++}`);
      values.push(`%${city}%`);
    }
    if (state) {
      conditions.push(`p.state ILIKE $${idx++}`);
      values.push(`%${state}%`);
    }
    if (type) {
      conditions.push(`p.type = $${idx++}`);
      values.push(type);
    }
    if (bedrooms) {
      conditions.push(`COALESCE(h.rooms, a.rooms) >= $${idx++}`);
      values.push(Number(bedrooms));
    }
    if (minPrice) {
      conditions.push(`pr.amount >= $${idx++}`);
      values.push(Number(minPrice));
    }
    if (maxPrice) {
      conditions.push(`pr.amount <= $${idx++}`);
      values.push(Number(maxPrice));
    }
    if (date) {
      conditions.push(`p.availability = true`);
    }

    let query = `
      SELECT p.*, pr.amount, COALESCE(h.rooms, a.rooms) AS rooms
      FROM Property p
      LEFT JOIN House h ON p.prop_id = h.prop_id
      LEFT JOIN Apartment a ON p.prop_id = a.prop_id
      LEFT JOIN Price pr ON p.prop_id = pr.prop_id
    `;

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    if (order === 'price') {
      query += ' ORDER BY pr.amount ASC';
    } else if (order === 'bedrooms') {
      query += ' ORDER BY rooms DESC';
    }

    const result = await pool.query(query);
    console.log('Fetched properties:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// PUT update property (only if agent owns it)
router.put('/:prop_id', async (req, res) => {
  const { prop_id } = req.params;
  const { user_id, address, city, state, description, availability, type, subtypeData } = req.body;
  try {
    const ownership = await pool.query('SELECT 1 FROM Property WHERE prop_id = $1 AND user_id = $2', [prop_id, user_id]);
    if (ownership.rowCount === 0) return res.status(403).json({ error: 'Forbidden: You do not own this property' });

    await pool.query(
      'UPDATE Property SET address = $1, city = $2, state = $3, description = $4, availability = $5, type = $6 WHERE prop_id = $7',
      [address, city, state, description, availability, type, prop_id]
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