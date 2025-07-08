export function validateFormData(data) {
	if (!data) {
		return { isValid: false, errors: ['No data provided'] };
	}

	const errors = [];

	if (data.typeId == null || typeof data.typeId !== 'number') {
		errors.push('Type ID is required and must be a number');
	} else if (data.typeId <= 0) {
		errors.push('Type ID must be a positive integer');
	} else if (!Number.isInteger(data.typeId)) {
		errors.push('Type ID must be an integer');
	}

	if (data.email == null || typeof data.email !== 'string') {
		errors.push('Email is required and must be a string');
	} else if (data.email.trim().length === 0) {
		errors.push('Email cannot be empty');
	} else {
		const emailRegex = /^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/;

		if (!emailRegex.test(data.email.trim())) {
			errors.push('Please provide a valid email address');
		} else if (data.email.trim().length > 254) {
			errors.push('Email cannot exceed 254 characters');
		}
	}

	if (data.message == null || typeof data.message !== 'string') {
		errors.push('Message is required and must be a string');
	} else if (data.message.trim().length === 0) {
		errors.push('Message cannot be empty');
	} else if (data.message.trim().length < 2) {
		errors.push('Message must be at least 2 characters long');
	} else if (data.message.trim().length > 65_535) {
		errors.push('Message cannot exceed 65,535 characters');
	}

	return {
		isValid: errors.length === 0,
		errors,
		sanitizedData:
			errors.length === 0
				? {
						typeId: data.typeId,
						email: data.email.trim().toLowerCase(),
						message: data.message.trim(),
					}
				: undefined,
	};
}
