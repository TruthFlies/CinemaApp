/**
 * Loading of Secret keys and Environment variable configuration
 */
import logger from "./logging";
import dotenv from "dotenv";
import fs from "fs";

// Check if environment variable are defined in .env file
if (fs.existsSync(".env")) {
    logger.debug("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
} else {
    logger.debug("Using .env.example file to supply config environment variables. Please make sure to create .env with correct configuration");
    // Default configuration to be used by dotenv for loading evironment variables
    dotenv.config({ path: ".env.example" });  
}
export const ENVIRONMENT = process.env.NODE_ENV;
// Anything else is treated as 'dev'
const prod = ENVIRONMENT === "production"; 

export const SESSION_SECRET = process.env["SESSION_SECRET"];
export const MONGODB_URI = (prod ? process.env["MONGODB_URI"] : process.env["MONGODB_URI_LOCAL"]);

if (!SESSION_SECRET) {
    logger.error("No client secret. Set SESSION_SECRET environment variable.");
    process.exit(1);
}

if (!MONGODB_URI) {
    if (prod) {
        logger.error("No mongo connection string. Set MONGODB_URI environment variable.");
    } else {
        logger.error("No mongo connection string. Set MONGODB_URI_LOCAL environment variable.");
    }
    process.exit(1);
}