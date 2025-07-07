import 'dotenv/config';

import { connectDatabase } from '../src/db/connection';

export async function seedDatabase() {
	try {
		console.log('Creating database with sample data...');

		const connection = await connectDatabase();

		await connection.execute(`
			CREATE TABLE IF NOT EXISTS types (
				id INT AUTO_INCREMENT PRIMARY KEY,
				name VARCHAR(100) NOT NULL UNIQUE,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`);

		await connection.execute(`INSERT IGNORE INTO types (name) VALUES ('bug'), ('question'), ('suggestion')`);

		await connection.execute(`
			CREATE TABLE IF NOT EXISTS tickets (
				id INT AUTO_INCREMENT PRIMARY KEY,
				type_id INT NOT NULL,
				email VARCHAR(255) NOT NULL,
				message TEXT NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (type_id) REFERENCES types(id) ON DELETE RESTRICT ON UPDATE CASCADE
			)
		`);

		const [rows] = await connection.execute('SELECT COUNT(*) as count FROM tickets');

		if (rows[0].count > 0) {
			console.log('Database already has data, skipping seed');

			return;
		}

		const typeMap = {};
		const [types] = await connection.execute('SELECT id, name FROM types');

		for (const type of types) {
			typeMap[type.name] = type.id;
		}

		const sampleData = [
			[typeMap['bug'], 'john.doe@example.com', 'The application crashes when I try to submit a form.'],
			[typeMap['question'], 'jane.smith@example.com', 'How do I reset my password?'],
			[typeMap['suggestion'], 'bob.johnson@example.com', 'It would be great to have a dark mode option.'],
			[typeMap['bug'], 'alice.brown@example.com', 'The search functionality is not working properly.'],
			[typeMap['question'], 'mike.wilson@example.com', 'Can I export my data to CSV format?'],
		];

		for (const [typeId, email, message] of sampleData) {
			await connection.execute('INSERT INTO tickets (type_id, email, message) VALUES (?, ?, ?)', [
				typeId,
				email,
				message,
			]);
		}

		console.log('Database with sample data created successfully');
	} catch (error) {
		console.error('Database seeding error:', error);

		throw error;
	}
}
