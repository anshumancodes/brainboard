const JWT_KEY = process.env.JWT_SECRET;

export const JWT_SECRET = new TextEncoder().encode(JWT_KEY);
