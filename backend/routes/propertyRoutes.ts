import express from 'express';
import { pool } from '../index';

const router = express.Router();

router.get('/agents/:user_id/properties', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM Property WHERE user_id = $1',
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching agent properties:', err);
    res.status(500).json({ error: 'Failed to retrieve properties' });
  }
});

router.post('/properties', async (req, res) => {
  const { user_id, address, city, state, description, availability, type, subtypeData } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Property (user_id, address, city, state, description, availability, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING prop_id',
      [user_id, address, city, state, description, availability, type]
    );
    const prop_id = result.rows[0].prop_id;

    if (type === 'House') {
      const { rooms, sq_ft } = subtypeData;
      await pool.query('INSERT INTO House (prop_id, rooms, sq_ft) VALUES ($1, $2, $3)', [prop_id, rooms, sq_ft]);
    } else if (type === 'Apartment') {
      const { rooms, sq_ft, building_type } = subtypeData;
      await pool.query('INSERT INTO Apartment (prop_id, rooms, sq_ft, building_type) VALUES ($1, $2, $3, $4)', [prop_id, rooms, sq_ft, building_type]);
    } else if (type === 'CommercialBuilding') {
      const { sq_ft, business_type } = subtypeData;
      await pool.query('INSERT INTO CommercialBuilding (prop_id, sq_ft, business_type) VALUES ($1, $2, $3)', [prop_id, sq_ft, business_type]);
    }

    res.status(201).json({ message: 'Property added', prop_id });
  } catch (err) {
    console.error('Error adding property:', err);
    res.status(500).json({ error: 'Failed to add property' });
  }
});

router.put('/properties/:prop_id', async (req, res) => {
  const { prop_id } = req.params;
  const { address, city, state, description, availability, type, subtypeData } = req.body;
  try {
    await pool.query(
      'UPDATE Property SET address = $1, city = $2, state = $3, description = $4, availability = $5, type = $6 WHERE prop_id = $7',
      [address, city, state, description, availability, type, prop_id]
    );

    if (type === 'House') {
      const { rooms, sq_ft } = subtypeData;
      const exists = await pool.query('SELECT 1 FROM House WHERE prop_id = $1', [prop_id]);
      if (exists.rowCount) {
        await pool.query('UPDATE House SET rooms = $1, sq_ft = $2 WHERE prop_id = $3', [rooms, sq_ft, prop_id]);
      } else {
        await pool.query('INSERT INTO House (prop_id, rooms, sq_ft) VALUES ($1, $2, $3)', [prop_id, rooms, sq_ft]);
      }
    } else if (type === 'Apartment') {
      const { rooms, sq_ft, building_type } = subtypeData;
      const exists = await pool.query('SELECT 1 FROM Apartment WHERE prop_id = $1', [prop_id]);
      if (exists.rowCount) {
        await pool.query('UPDATE Apartment SET rooms = $1, sq_ft = $2, building_type = $3 WHERE prop_id = $4', [rooms, sq_ft, building_type, prop_id]);
      } else {
        await pool.query('INSERT INTO Apartment (prop_id, rooms, sq_ft, building_type) VALUES ($1, $2, $3, $4)', [prop_id, rooms, sq_ft, building_type]);
      }
    } else if (type === 'CommercialBuilding') {
      const { sq_ft, business_type } = subtypeData;
      const exists = await pool.query('SELECT 1 FROM CommercialBuilding WHERE prop_id = $1', [prop_id]);
      if (exists.rowCount) {
        await pool.query('UPDATE CommercialBuilding SET sq_ft = $1, business_type = $2 WHERE prop_id = $3', [sq_ft, business_type, prop_id]);
      } else {
        await pool.query('INSERT INTO CommercialBuilding (prop_id, sq_ft, business_type) VALUES ($1, $2, $3)', [prop_id, sq_ft, business_type]);
      }
    }

    res.json({ message: 'Property updated' });
  } catch (err) {
    console.error('Error updating property:', err);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

router.delete('/properties/:prop_id', async (req, res) => {
  const { prop_id } = req.params;
  try {
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
