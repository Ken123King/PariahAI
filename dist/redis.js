"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("@upstash/redis");
// Initialize Redis client using environment variables
let redis;
// Check if we have the REST API URL and token (preferred for Upstash)
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new redis_1.Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
    });
}
// Fallback to REDIS_URL if it's in the correct format (https://...)
else if (process.env.REDIS_URL && process.env.REDIS_URL.startsWith("https://")) {
    const urlParts = process.env.REDIS_URL.split("?token=");
    redis = new redis_1.Redis({
        url: urlParts[0],
        token: urlParts[1] || "",
    });
}
// Create a default instance that will be replaced at runtime
else {
    console.warn("No valid Redis configuration found. Using a placeholder client that will be initialized at runtime.");
    redis = new redis_1.Redis({
        url: "https://placeholder.upstash.io",
        token: "placeholder_token",
    });
}
exports.default = redis;
