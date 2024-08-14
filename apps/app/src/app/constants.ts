export const IS_BROWSER = typeof window !== 'undefined';
export const IS_SERVER = typeof window === 'undefined';
export const IS_PROD = process.env.NODE_ENV === 'production';
export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_TEST = process.env.NODE_ENV === 'test';

// Replicate
export const REPLICATE_API_TOKEN = 'REPLICATE_API_TOKEN';

// Replicate model
export const REPLICATE_IMAGE_GENERATION_MODEL = 'REPLICATE_IMAGE_GENERATION_MODEL';

// API Key
export const API_KEY_HEADER = 'X-API-KEY-SEBASTIEN';
export const API_KEY_SEBASTIEN = 'API_KEY_SEBASTIEN';
