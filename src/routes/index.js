import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import basicAuth from 'express-basic-auth';

import 'dotenv/config';

import { getConnection } from '../db/connection.js';
import { asyncWrapper } from '../utils/async-wrapper.js';
import { validateFormData } from '../validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/', (_request, response) => {
	response.sendFile(path.join(__dirname, '../../public/form.html'));
});

router.post(
	'/api/new-ticket',
	asyncWrapper(async (request, response) => {
		const connection = getConnection();

		const { isValid, errors, sanitizedData } = validateFormData(request.body);

		if (!isValid) {
			return response.status(400).json({
				success: false,
				errors,
			});
		}

		const { typeId, email, message } = sanitizedData;

		await connection.execute('INSERT INTO tickets (type_id, email, message) VALUES (?, ?, ?)', [
			typeId,
			email,
			message,
		]);

		response.json({
			success: true,
			message: 'Ticket created successfully',
		});
	}),
);

router.get(
	'/api/ticket-types',
	asyncWrapper(async (_request, response) => {
		const connection = getConnection();

		const [rows] = await connection.execute('SELECT id, name FROM types ORDER BY name');

		response.json({
			success: true,
			data: rows,
		});
	}),
);

router.get(
	'/tickets',
	basicAuth({
		users: { [process.env.ADMIN_USER]: process.env.ADMIN_PASSWORD },
		challenge: true,
		realm: 'Imb4T3st4pp',
	}),
	(_request, response) => {
		response.sendFile(path.join(__dirname, '../../public/tickets.html'));
	},
);

router.get(
	'/api/tickets',
	basicAuth({
		users: { [process.env.ADMIN_USER]: process.env.ADMIN_PASSWORD },
		challenge: true,
		realm: 'Imb4T3st4pp',
	}),
	asyncWrapper(async (_request, response) => {
		const connection = getConnection();

		const [rows] = await connection.execute(`
			SELECT 
				t.id,
				t.email,
				t.message,
				t.created_at,
				ty.name as type_name
			FROM tickets t
			JOIN types ty ON t.type_id = ty.id
			ORDER BY t.created_at DESC
		`);

		response.json({
			success: true,
			data: rows,
		});
	}),
);

export default router;
