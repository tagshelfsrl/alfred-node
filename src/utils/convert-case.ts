import { camelizeKeys, decamelizeKeys } from 'humps';

// Converts object keys to camelCase, typically used for API response data
export const toCamelCase = (data: any) => camelizeKeys(data);

// Converts object keys to snake_case, typically used for sending data to the API
export const toSnakeCase = (data: any) => decamelizeKeys(data);
