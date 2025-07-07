const form = document.querySelector('#ticketForm');
const typeSelect = document.querySelector('#typeId');
const messageDiv = document.querySelector('#message');
const submitButton = document.querySelector('#submitBtn');

async function loadTicketTypes() {
	try {
		const response = await fetch('/api/ticket-types');
		const data = await response.json();

		if (data.success && data.data) {
			typeSelect.innerHTML = '<option value="">Select a type...</option>';

			for (const type of data.data) {
				const option = document.createElement('option');
				option.value = type.id;
				option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);

				typeSelect.append(option);
			}
		} else {
			throw new Error('Failed to load ticket types');
		}
	} catch (error) {
		console.error('Error loading ticket types:', error);

		typeSelect.innerHTML = '<option value="">Error loading types</option>';

		showMessage('Failed to load ticket types. Please refresh the page.', 'error');
	}
}

function showMessage(text, type) {
	messageDiv.textContent = text;
	messageDiv.className = `message ${type}`;
	messageDiv.style.display = 'block';

	setTimeout(() => {
		messageDiv.style.display = 'none';
	}, 5000);
}

form.addEventListener('submit', async (e) => {
	e.preventDefault();

	const formData = new FormData(form);
	const data = {
		typeId: Number.parseInt(formData.get('typeId'), 10),
		email: formData.get('email'),
		message: formData.get('message'),
	};

	if (!data.typeId || !data.email || !data.message) {
		showMessage('Please fill in all fields.', 'error');

		return;
	}

	submitButton.disabled = true;
	submitButton.textContent = 'Creating Ticket...';

	try {
		const response = await fetch('/api/new-ticket', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		const result = await response.json();

		if (result.success) {
			showMessage('Ticket created successfully!', 'success');

			form.reset();
			typeSelect.value = '';
		} else {
			const errorMessage = result.errors ? result.errors.join(', ') : 'Failed to create ticket';

			showMessage(errorMessage, 'error');
		}
	} catch (error) {
		console.error('Error creating ticket:', error);

		showMessage('An error occurred while creating the ticket. Please try again.', 'error');
	} finally {
		submitButton.disabled = false;
		submitButton.textContent = 'Create Ticket';
	}
});

document.addEventListener('DOMContentLoaded', loadTicketTypes);
