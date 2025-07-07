const ticketsContainer = document.querySelector('#ticketsContainer');
const loadingDiv = document.querySelector('#loadingDiv');
const noTicketsDiv = document.querySelector('#noTickets');
const messageDiv = document.querySelector('#message');
const ticketCountDiv = document.querySelector('#ticketCount');
const refreshButton = document.querySelector('#refreshBtn');

function showMessage(text, type) {
	messageDiv.textContent = text;
	messageDiv.className = `message ${type}`;
	messageDiv.style.display = 'block';

	setTimeout(() => {
		messageDiv.style.display = 'none';
	}, 5000);
}

function formatDate(dateString) {
	const date = new Date(dateString);

	return date.toLocaleString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function createTicketCard(ticket) {
	const card = document.createElement('div');
	card.className = 'ticket-card';

	const typeClass = `type-${ticket.type_name}`;

	card.innerHTML = `
	  <div class="ticket-header">
			<div class="ticket-id">Ticket #${ticket.id}</div>
			<div class="ticket-type ${typeClass}">${ticket.type_name}</div>
		</div>
		<div class="ticket-email">${ticket.email}</div>
		<div class="ticket-message">${ticket.message}</div>
		<div class="ticket-date">Created: ${formatDate(ticket.created_at)}</div>
	`;

	return card;
}

async function loadTickets() {
	try {
		loadingDiv.style.display = 'block';
		ticketsContainer.style.display = 'none';
		noTicketsDiv.style.display = 'none';
		refreshButton.disabled = true;
		refreshButton.textContent = 'Loading...';

		const response = await fetch('/api/tickets');

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		if (data.success && data.data) {
			loadingDiv.style.display = 'none';

			if (data.data.length === 0) {
				noTicketsDiv.style.display = 'block';
				ticketCountDiv.textContent = 'No tickets found';
			} else {
				ticketsContainer.innerHTML = '';

				for (const ticket of data.data) {
					const card = createTicketCard(ticket);
					ticketsContainer.append(card);
				}

				ticketsContainer.style.display = 'grid';
				ticketCountDiv.textContent = `Total tickets: ${data.data.length}`;
			}
		} else {
			throw new Error('Invalid response format');
		}
	} catch (error) {
		console.error('Error loading tickets:', error);

		loadingDiv.style.display = 'none';

		if (error.message.includes('401') || error.message.includes('status: 401')) {
			showMessage('Authentication required. Please log in.', 'error');
		} else {
			showMessage('Failed to load tickets. Please try again.', 'error');
		}
	} finally {
		refreshButton.disabled = false;
		refreshButton.textContent = 'Refresh';
	}
}

refreshButton.addEventListener('click', loadTickets);

document.addEventListener('DOMContentLoaded', loadTickets);
