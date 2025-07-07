import mysql from 'mysql2/promise';

import 'dotenv/config';

let connection;

export async function connectDatabase() {
	try {
		connection = await mysql.createConnection({
			host: process.env.MARIADB_HOST ?? 'localhost',
			port: process.env.MARIADB_PORT ?? 3306,
			user: process.env.MARIADB_USER ?? 'root',
			password: process.env.MARIADB_ROOT_PASSWORD ?? 'password',
			database: process.env.MARIADB_DATABASE ?? 'tickets_db',
		});

		console.log('Connected to MariaDB database');

		return connection;
	} catch (error) {
		console.error('Database connection error:', error);

		throw error;
	}
}

export function getConnection() {
	if (!connection) {
		throw new Error('Database not connected, call connectDatabase first.');
	}

	return connection;
}
