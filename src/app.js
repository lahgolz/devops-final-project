import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';

import { connectDatabase } from './db/connection.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');

const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', routes);

app.use((_request, response) => {
	response.status(500).json({
		success: false,
		errors: ['Something went wrong!'],
	});
});

async function startServer() {
	try {
		await connectDatabase();

		app.listen(PORT, () => {
			console.log(`Server is running on http://localhost:${PORT}`);
		});
	} catch (error) {
		throw new Error('Failed to start server:', error);
	}
}

await startServer();
