import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import bluebird from "bluebird";

import { MONGODB_URI, SESSION_SECRET } from "./utils/secret";
import logger from "./utils/logging";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl: string = MONGODB_URI || "mongodb://";
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, { autoIndex: true }).then(
    () => {
        logger.info("Connected to MongoDB.");
    },
).catch(err => {
    logger.error(`MongoDB connection error. Please make sure MongoDB is running.${mongoUrl} ${err}`);
    process.exit(1);
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET || "secret",
    store: new MongoStore({
        mongoUrl
    })
}));

/**
 * Primary app routes.
 * 
 * home -> /home : redirect/render static frontend
 * login -> /login : login API route
 * register -> /register : register API route
 * forgot password -> /forgot-password  : forgot password API route
 * reset password -> /reset-password : reset password API route
 */


/**
 * API routes.
 * Main controller route for business logic
 */


export default app;