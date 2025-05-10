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
        const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);

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

router.get('user/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM Users WHERE user_id = $1', [user_id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error occured for user: ', err);
        res.status(500).json({ error: 'Cannot fetch user'});
    }
});

router.put('user/:user_id', async (req, res) => {
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

router.delete('user/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await pool.query('DELETE FROM Users WHERE user_id = $1', [user_id]);
        res.status(200).json({ message: 'User deleted!'});
    } catch (err) {
        console.error('Error occured for user: ', err);
        res.status(500).json({ error: 'Cannot deleted user'});
    }
});

router.post('user/:user_id/addresses', async (req, res) => {
    const { user_id } = req.params;
    const { address } = req.body;

    try {
        const result = await pool.query('INSERT INTO addresses (user_id, address) values ($1, $2)', [user_id, address]);
        res.status(200).json({ message: 'Address added!', address_id: result.rows[0].address_id });
    } catch (err) {
        console.error('Error occured for address: ', err);
        res.status(500).json({ error: 'Cannot add address'});
    }
});

router.get('user/:user_id/addresses', async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM Addresses where user_id = $1', [user_id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error occured for address: ', err);
        res.status(500).json({ error: 'Cannot fetch addresses'});
    }
});

router.put('user/:user_id/addresses/:address_id', async (req, res) => {
    const { address_id } = req.params;
    const { address } = req.body;

    try {
        const result = await pool.query('UPDATE Addresses SET address = $1 WHERE address_id = $2', [address, address_id]);
        res.status(200).json({ message: 'Address added!', address_id: result.rows[0].address_id });
    } catch (err) {
        console.error('Error occured for address: ', err);
        res.status(500).json({ error: 'Cannot add address'});
    }
});

router.delete('user/:user_id/addresses/:address_id', async (req, res) => {
    const { address_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM CreditCards WHERE address = (SELECT address FROM Addresses WHERE address_id = $1)', [address_id]);
        if (result.rows.length !== 0) {
            return res.status(400).json({error: "Cannot delete address that is linked to a card!"})
        }
        await pool.query('DELETE FROM Addresses WHERE address_id = $1', [address_id]);
        res.status(200).json({ message: 'Address deleted!'});
    } catch (err) {
        console.error('Error occured for address: ', err);
        res.status(500).json({ error: 'Cannot delete address'});
    }
});

router.post('user/:user_id/credit_cards', async (req, res) => {
    const { user_id } = req.params;
    const { card_number, exp_date, name, address } = req.body;

    try {
        const result = await pool.query('INSERT INTO CreditCards (user_id, card_number, exp_date, name, address) VALUES ($1, $2, $3, $4, $5)', [user_id, card_number, exp_date, name, address]);
        res.status(201).json({ message: "Credit card added!", credit_id: result.rows[0].credit_id });
    } catch (err) {
        console.error('Error occured for credit card: ', err);
        res.status(500).json({ error: 'Cannot add credit card'});
    }
});

router.get('user/:user_id/credit_cards', async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM CreditCards where user_id = $1', [user_id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error occured for credit cards: ', err);
        res.status(500).json({ error: 'Cannot fetch credit cards for user'});
    }
});

router.put('user/:user_id/credit_cards/:credit_id', async (req, res) => {
    const { credit_id } = req.params;
    const { card_number, exp_date, name, address } = req.body;

    try {
        const result = await pool.query('UPDATE CreditCards SET card_number = $1, exp_date = $2, name = $3, address = $4 WHERE credit_id = $5', [card_number, exp_date, name, address, credit_id]);
        res.status(200).json({ message: 'Credit card updated!', address_id: result.rows[0].address_id });
    } catch (err) {
        console.error('Error occured for credit card: ', err);
        res.status(500).json({ error: 'Cannot update credit card'});
    }
});

router.delete('user/:user_id/credit_cards/:credit_id', async (req, res) => {
    const { credit_id } = req.params;
    try {
        await pool.query('DELETE FROM Addresses WHERE address_id = $1', [credit_id]);
        res.status(200).json({ message: 'Credit card deleted!'});
    } catch (err) {
        console.error('Error occured for address: ', err);
        res.status(500).json({ error: 'Cannot delete credit card'});
    }
});

export default router;