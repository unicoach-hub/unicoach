const { z } = require('zod');

/**
 * Higher-order validation middleware using Zod
 * @param {z.ZodSchema} schema 
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: formattedErrors
      });
    }
    return res.status(400).json({ error: 'Invalid request data' });
  }
};

// Common reusable Zod Schemas
const phoneRegex = /^\+?[0-9]{10,15}$/;

const leadSubmitSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number (must be 10-15 digits)'),
  dreamCountry: z.string().optional(),
  preferredIntake: z.string().optional(),
  highestEducation: z.string().optional(),
  currentCity: z.string().optional(),
  source: z.string().optional(),
  university: z.string().optional()
});

const userRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number').optional(),
  password: z.string().length(6, 'Password must be exactly 6 characters')
});

const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is missing or invalid'),
  id: z.string().min(5, 'User ID is missing or invalid'),
  newPassword: z.string().length(6, 'Password must be exactly 6 characters')
});

const googleAuthSchema = z.object({
  credential: z.string().min(10, 'Google credential token is required')
});

const adminLoginSchema = z.object({
  username: z.string().min(3, 'Username is required'),
  password: z.string().min(5, 'Password is required')
});

module.exports = {
  validate,
  leadSubmitSchema,
  userRegisterSchema,
  userLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
  adminLoginSchema
};
