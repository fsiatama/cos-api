import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  port: parseInt(process.env.AUTH_API_PORT, 10) || 3000,
  apiKey: 'test_api_key',
  jwtSecret: process.env.JWT_SECRET,
}));
