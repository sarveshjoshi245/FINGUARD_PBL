/**
 * Contact Validator
 * Validates contact information (email, mobile, phone)
 */

const { z } = require('zod');
const { VALIDATION_PATTERNS } = require('../../../shared/constants/validation');

const contactValidator = z.object({
  email: z.string()
    .email('Invalid email address'),
  
  mobile: z.string()
    .regex(VALIDATION_PATTERNS.MOBILE, 'Invalid 10-digit mobile number'),
  
  phone: z.string()
    .regex(VALIDATION_PATTERNS.PHONE, 'Invalid phone number format')
    .optional(),
});

module.exports = {
  contactValidator,
  validateContact: (data) => contactValidator.safeParse(data),
};
