import express from 'express';
import { pool } from '../index';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { email, name, isAgent, jobTitle, agency, contactInfo, moveInDate, preferredLocation, budget } = req.body;
    try {
        const userResult = await pool.query('INSERT INTO Users (email, name) VALUES ($1, $2) RETURNING user_id', [email, name]);
        const userId = userResult.rows[0].user_id;
        
        if (isAgent) {
            await pool.query('INSERT INTO Agents (user_id, job_title, agency, contact_info) VALUES ($1, $2, $3, $4)', [userId, jobTitle, agency, contactInfo]);
        } else {
            await pool.query('INSERT INTO ProspectiveRenters (user_id, move_in_date, preferred_location, budget) VALUES ($1, $2, $3, $4)', [userId, moveInDate, preferredLocation, budget]);
        }
        res.status(201).json({ message: 'User successfully registered!'});
    } catch (err) {
        console.error("Registration error: ", err);
        res.status(500).json({ error: 'Failed to register user'});
    }
});

router.post('/login', async (req, res) => {
    const { email } = req.body;

    try {
        const result = await pool.query('GET * FROM Users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User does not exist" });
        }

        const user = result.rows[0];
        res.status(200).json({ message: 'Login successful', user_id: user.user_id });
    } catch (err) {
        console.error("Login error: ", err);
        res.status(500).json({ error: 'Failed to login user'});
    }

})

router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM Users WHERE user_id = $1', [user_id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error occured for user: ', err);
        res.status(500).json({ error: 'Cannot fetch user'});
    }
});

router.put('/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const { name } = req.body;
    try {
        const result = await pool.query('UPDATE Users SET name = $1 WHERE user_id = $2', [name, user_id]);
        res.status(200).json({ message: 'User updated!'});
    } catch (err) {
        console.error('Error occured for user: ', err);
        res.status(500).json({ error: 'Cannot update user'});
    }
});

router.delete('/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await pool.query('DELETE FROM Users WHERE user_id = $1', [user_id]);
        res.status(200).json({ message: 'User deleted!'});
    } catch (err) {
        console.error('Error occured for user: ', err);
        res.status(500).json({ error: 'Cannot deleted user'});
    }
});

export default router;
