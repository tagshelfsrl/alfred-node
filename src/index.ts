import { AlfredClient } from "./alfred-client";

// Using constructor with API key
const instance = new AlfredClient("your-api-key-value");

// Using environment variable
const instanceFromEnv = AlfredClient.getFromEnvironmentVariables();
