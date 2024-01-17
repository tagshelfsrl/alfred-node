// src/alfred-client.ts
import axios, { AxiosInstance } from 'axios';
import { ALFRED_BASE_URL } from './constants';
import { EnvironmentType } from './types';
import { toSnakeCase } from './utils/convert-case';

export class AlfredClient {
    private apiKey: string;
    private http: AxiosInstance;
    public environment: EnvironmentType;

    constructor(apiKey: string, environment: EnvironmentType = 'production') {
        this.apiKey = apiKey;
        this.environment = environment;
        
        this.http = axios.create({
            baseURL: ALFRED_BASE_URL[environment],
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        // Optionally, set a response interceptor to automatically convert responses to 
        this.http.interceptors.response.use(response => {
            response.data = toSnakeCase(response.data);
            return response;
        });
    }

    static getFromEnvironmentVariables(): AlfredClient {
        const apiKey = process.env.ALFRED_API_KEY;
        const environment = (process.env.ALFRED_ENVIRONMENT as EnvironmentType) || 'production';
        if (!apiKey) {
            throw new Error('API key not found in environment variables');
        }
        return new AlfredClient(apiKey, environment);
    }
}
