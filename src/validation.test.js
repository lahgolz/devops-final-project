import { validateFormData } from './validation.js';

describe('validateFormData', () => {
	describe('Input validation', () => {
		test('should return error when no data provided', () => {
			const result = validateFormData(null);
			expect(result.isValid).toBe(false);
			expect(result.errors).toEqual(['No data provided']);
			expect(result.sanitizedData).toBeUndefined();
		});

		test('should return error when undefined data provided', () => {
			const result = validateFormData(undefined);
			expect(result.isValid).toBe(false);
			expect(result.errors).toEqual(['No data provided']);
			expect(result.sanitizedData).toBeUndefined();
		});

		test('should return error when empty object provided', () => {
			const result = validateFormData({});
			expect(result.isValid).toBe(false);
			expect(result.errors).toHaveLength(3);
			expect(result.errors).toContain('Type ID is required and must be a number');
			expect(result.errors).toContain('Email is required and must be a string');
			expect(result.errors).toContain('Message is required and must be a string');
		});
	});

	describe('typeId validation', () => {
		test('should return error when typeId is missing', () => {
			const data = {
				email: 'test@example.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Type ID is required and must be a number');
		});

		test('should return error when typeId is null', () => {
			const data = {
				typeId: null,
				email: 'test@example.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Type ID is required and must be a number');
		});

		test('should return error when typeId is a string', () => {
			const data = {
				typeId: '1',
				email: 'test@example.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Type ID is required and must be a number');
		});

		test('should return error when typeId is zero', () => {
			const data = {
				typeId: 0,
				email: 'test@example.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Type ID must be a positive integer');
		});

		test('should return error when typeId is negative', () => {
			const data = {
				typeId: -1,
				email: 'test@example.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Type ID must be a positive integer');
		});

		test('should return error when typeId is a float', () => {
			const data = {
				typeId: 1.5,
				email: 'test@example.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Type ID must be an integer');
		});

		test('should accept valid positive integer typeId', () => {
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		test('should accept large positive integer typeId', () => {
			const data = {
				typeId: 999_999,
				email: 'test@example.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});
	});

	describe('email validation', () => {
		test('should return error when email is missing', () => {
			const data = {
				typeId: 1,
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Email is required and must be a string');
		});

		test('should return error when email is null', () => {
			const data = {
				typeId: 1,
				email: null,
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Email is required and must be a string');
		});

		test('should return error when email is not a string', () => {
			const data = {
				typeId: 1,
				email: 123,
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Email is required and must be a string');
		});

		test('should return error when email is empty string', () => {
			const data = {
				typeId: 1,
				email: '',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Email cannot be empty');
		});

		test('should return error when email is only whitespace', () => {
			const data = {
				typeId: 1,
				email: '   ',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Email cannot be empty');
		});

		test('should return error for invalid email format - no @', () => {
			const data = {
				typeId: 1,
				email: 'testexample.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Please provide a valid email address');
		});

		test('should return error for invalid email format - no domain', () => {
			const data = {
				typeId: 1,
				email: 'test@',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Please provide a valid email address');
		});

		test('should return error for invalid email format - no TLD', () => {
			const data = {
				typeId: 1,
				email: 'test@example',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Please provide a valid email address');
		});

		test('should return error for invalid email format - invalid characters', () => {
			const data = {
				typeId: 1,
				email: 'test@exam ple.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Please provide a valid email address');
		});

		test('should return error for email exceeding 254 characters', () => {
			const longEmail = 'a'.repeat(250) + '@example.com'; // 261 characters total
			const data = {
				typeId: 1,
				email: longEmail,
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Email cannot exceed 254 characters');
		});

		test('should accept valid email format', () => {
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
		});

		test('should accept email with dots and hyphens', () => {
			const data = {
				typeId: 1,
				email: 'test.user-name@sub-domain.example.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
		});

		test('should accept email with numbers', () => {
			const data = {
				typeId: 1,
				email: 'user123@example123.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
		});

		test('should accept email with underscores', () => {
			const data = {
				typeId: 1,
				email: 'test_user@example_domain.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
		});

		test('should trim and lowercase email in sanitized data', () => {
			const data = {
				typeId: 1,
				email: '  Test.User@EXAMPLE.COM  ',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
			expect(result.sanitizedData.email).toBe('test.user@example.com');
		});
	});

	describe('message validation', () => {
		test('should return error when message is missing', () => {
			const data = {
				typeId: 1,
				email: 'test@example.com',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Message is required and must be a string');
		});

		test('should return error when message is null', () => {
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: null,
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Message is required and must be a string');
		});

		test('should return error when message is not a string', () => {
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: 123,
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Message is required and must be a string');
		});

		test('should return error when message is empty string', () => {
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: '',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Message cannot be empty');
		});

		test('should return error when message is only whitespace', () => {
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: '   ',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Message cannot be empty');
		});

		test('should return error when message is too short (1 character)', () => {
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: 'A',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Message must be at least 2 characters long');
		});

		test('should return error when message exceeds 65535 characters', () => {
			const longMessage = 'A'.repeat(65_536);
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: longMessage,
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Message cannot exceed 65,535 characters');
		});

		test('should accept message with exactly 2 characters', () => {
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: 'Hi',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
		});

		test('should accept message with exactly 65535 characters', () => {
			const maxMessage = 'A'.repeat(65_535);
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: maxMessage,
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
		});

		test('should trim message in sanitized data', () => {
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: '  This is a test message  ',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
			expect(result.sanitizedData.message).toBe('This is a test message');
		});

		test('should accept message with special characters', () => {
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: 'Message with special chars: !@#$%^&*()[]{}|;:,.<>?',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
		});

		test('should accept message with unicode characters', () => {
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: 'Message with unicode: 你好 🌟 café résumé',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
		});

		test('should accept message with newlines and tabs', () => {
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: 'Line 1\nLine 2\tTabbed content',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
		});
	});

	describe('multiple validation errors', () => {
		test('should return all validation errors for completely invalid data', () => {
			const data = {
				typeId: 'invalid',
				email: 'invalid-email',
				message: 'A',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toHaveLength(3);
			expect(result.errors).toContain('Type ID is required and must be a number');
			expect(result.errors).toContain('Please provide a valid email address');
			expect(result.errors).toContain('Message must be at least 2 characters long');
			expect(result.sanitizedData).toBeUndefined();
		});
	});

	describe('successful validation', () => {
		test('should return sanitized data for valid input', () => {
			const data = {
				typeId: 1,
				email: '  Test@Example.COM  ',
				message: '  This is a valid message  ',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
			expect(result.sanitizedData).toEqual({
				typeId: 1,
				email: 'test@example.com',
				message: 'This is a valid message',
			});
		});

		test('should preserve typeId exactly in sanitized data', () => {
			const data = {
				typeId: 42,
				email: 'test@example.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
			expect(result.sanitizedData.typeId).toBe(42);
		});

		test('should handle minimal valid data', () => {
			const data = {
				typeId: 1,
				email: 'a@b.co',
				message: 'Hi',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
			expect(result.sanitizedData).toEqual({
				typeId: 1,
				email: 'a@b.co',
				message: 'Hi',
			});
		});

		test('should handle complex valid data', () => {
			const data = {
				typeId: 999,
				email: 'complex.user-name123@sub-domain.example-site.com',
				message: 'This is a complex message with\nmultiple lines\tand tabs, special chars !@#$%^&*() and unicode 🚀',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
			expect(result.sanitizedData.typeId).toBe(999);
			expect(result.sanitizedData.email).toBe('complex.user-name123@sub-domain.example-site.com');
		});
	});

	describe('edge cases', () => {
		test('should handle object with extra properties', () => {
			const data = {
				typeId: 1,
				email: 'test@example.com',
				message: 'Test message',
				extraProperty: 'should be ignored',
				anotherExtra: 123,
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(true);
			expect(result.sanitizedData).toEqual({
				typeId: 1,
				email: 'test@example.com',
				message: 'Test message',
			});
		});

		test('should handle boolean values correctly', () => {
			const data = {
				typeId: true, // boolean, not number
				email: false, // boolean, not string
				message: true, // boolean, not string
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Type ID is required and must be a number');
			expect(result.errors).toContain('Email is required and must be a string');
			expect(result.errors).toContain('Message is required and must be a string');
		});

		test('should handle array values correctly', () => {
			const data = {
				typeId: [1],
				email: ['test@example.com'],
				message: ['Test message'],
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Type ID is required and must be a number');
			expect(result.errors).toContain('Email is required and must be a string');
			expect(result.errors).toContain('Message is required and must be a string');
		});

		test('should handle NaN typeId', () => {
			const data = {
				typeId: Number.NaN,
				email: 'test@example.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Type ID must be an integer');
		});

		test('should handle Infinity typeId', () => {
			const data = {
				typeId: Infinity,
				email: 'test@example.com',
				message: 'Test message',
			};
			const result = validateFormData(data);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Type ID must be an integer');
		});
	});
});
