"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const redis_1 = require("@upstash/redis");
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize Redis client
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
// ==================== REDIS KEYS ====================
// Tweet Keys
const RECENT_TWEETS_KEY = "recent:tweets";
const TWEET_HASHTAGS_KEY = "tweet:hashtags";
const TWEET_MENTIONS_KEY = "tweet:mentions";
const TRENDING_TOPICS_KEY = "trending:topics";
// Wallet Keys
const TRACKED_WALLETS_KEY = "tracked:wallets";
const WALLET_DATA_KEY_PREFIX = "wallet:data:";
const WALLET_TRANSACTIONS_KEY_PREFIX = "wallet:txs:";
const WALLET_TOKENS_KEY_PREFIX = "wallet:tokens:";
const FALLEN_WALLETS_KEY = "fallen:wallets";
// Trending Coin Keys
const TRENDING_COINS_KEY = "trending:coins";
const COIN_VOLUME_KEY_PREFIX = "coin:volume:";
const COIN_MENTIONS_KEY_PREFIX = "coin:mentions:";
const COIN_DATA_KEY_PREFIX = "coin:data:";
const ANOMALY_ALERTS_KEY = "anomaly:alerts";
// ==================== MOCK DATA ====================
// Mock Tweet Data
const MOCK_TWEETS = [
    {
        id: "tweet-1",
        author: "Crypto Trader",
        authorHandle: "cryptotrader",
        content: "Just lost everything on that $SOL dump. Down 98% on my portfolio. This is the end for me. #SolanaRugPull",
        timestamp: new Date().toISOString(),
        likes: 234,
        retweets: 56,
        hashtags: ["SolanaRugPull"],
        mentions: [],
    },
    {
        id: "tweet-2",
        author: "DeFi Degen",
        authorHandle: "defidegen",
        content: "Another day, another Solana project rugs. $MDOGE team just disappeared with $4.5M. I'm done with this ecosystem.",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        likes: 567,
        retweets: 123,
        hashtags: [],
        mentions: [],
    },
];
const MOCK_HASHTAGS = [
    { hashtag: "SolanaRugPull", count: 1245 },
    { hashtag: "Crypto", count: 876 },
    { hashtag: "BONK", count: 654 },
    { hashtag: "SOL", count: 432 },
    { hashtag: "PariahAI", count: 321 },
];
const MOCK_MENTIONS = [
    { mention: "cryptoinfluencer", count: 543 },
    { mention: "solana", count: 432 },
    { mention: "bonk", count: 321 },
    { mention: "AIPariah", count: 210 },
    { mention: "VCbro", count: 123 },
];
const MOCK_TOPICS = [
    {
        topic: "Solana Crash",
        tweetCount: 12450,
        change24h: 345,
        sentiment: "negative",
        lastUpdated: new Date().toISOString(),
    },
    {
        topic: "SOL Liquidations",
        tweetCount: 8760,
        change24h: 230,
        sentiment: "negative",
        lastUpdated: new Date().toISOString(),
    },
    {
        topic: "Solana Recovery",
        tweetCount: 4320,
        change24h: -120,
        sentiment: "positive",
        lastUpdated: new Date().toISOString(),
    },
];
// Mock Wallet Data
const MOCK_WALLET_DATA = {
    address: "",
    balance: 5.234,
    usdValue: 785.1,
    lastActive: new Date().toISOString(),
    riskScore: 65,
    isTracked: false,
    lastUpdated: new Date().toISOString(),
};
const MOCK_TRANSACTIONS = [
    {
        signature: "5xGZsYxGBq4qtbrgLXKKXs9ZUc8xzGrz6JuDuJDEpDUJxkqNMgSNALUKfU1cBhDMNTVKXgJr9BdfVXQUEMwuGTJu",
        blockTime: Math.floor(Date.now() / 1000) - 3600,
        slot: 100000000,
        fee: 0.000005,
        status: "success",
        type: "swap",
        tokenAmount: 100,
        tokenSymbol: "BONK",
        usdValue: 25,
        counterparty: "0x7a2D...3e4F",
        programId: "11111111111111111111111111111111",
    },
    {
        signature: "4tGHsYxGBq4qtbrgLXKKXs9ZUc8xzGrz6JuDuJDEpDUJxkqNMgSNALUKfU1cBhDMNTVKXgJr9BdfVXQUEMwuGTJu",
        blockTime: Math.floor(Date.now() / 1000) - 7200,
        slot: 100000001,
        fee: 0.000005,
        status: "success",
        type: "transfer",
        tokenAmount: 0.5,
        tokenSymbol: "SOL",
        usdValue: 75,
        counterparty: "0xB3c5...9a1D",
        programId: "11111111111111111111111111111111",
    },
];
const MOCK_TOKENS = [
    {
        mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        symbol: "BONK",
        name: "Bonk",
        amount: 1000000,
        usdValue: 123.45,
        priceChange24h: 5.2,
    },
    {
        mint: "So11111111111111111111111111111111111111112",
        symbol: "SOL",
        name: "Solana",
        amount: 5.234,
        usdValue: 785.1,
        priceChange24h: -2.3,
    },
];
const MOCK_FALLEN_WALLETS = [
    {
        address: "0x7a2D...3e4F",
        liquidationDate: new Date().toISOString(),
        assetsLost: 124500,
        lossPercentage: 98.7,
        lastActive: new Date().toISOString(),
        message: "Believed in the 'next Solana' and now lives in a cardboard box.",
        epitaph: "Here lies a trader who bought high and sold low. May your next life have better timing.",
    },
    {
        address: "0xB3c5...9a1D",
        liquidationDate: new Date(Date.now() - 86400000).toISOString(),
        assetsLost: 78900,
        lossPercentage: 100,
        lastActive: new Date(Date.now() - 86400000).toISOString(),
        message: "Aped into a rug. Deleted Twitter. Never seen again.",
        epitaph: "Trusted the team. The team disappeared with the funds. Trust no one.",
    },
];
// Mock Trending Coin Data
const MOCK_COINS = [
    {
        symbol: "SOL",
        name: "Solana",
        price: 150,
        volume24h: 1200000,
        volumeChange24h: 5.2,
        mentions24h: 5600,
        mentionsChange24h: 12.3,
        lastUpdated: new Date().toISOString(),
        score: 85,
    },
    {
        symbol: "BONK",
        name: "Bonk",
        price: 0.00000123,
        volume24h: 450000,
        volumeChange24h: 25.7,
        mentions24h: 3200,
        mentionsChange24h: 45.8,
        lastUpdated: new Date().toISOString(),
        score: 92,
    },
];
// ==================== TWEET SERVICE FUNCTIONS ====================
/**
 * Store a new tweet
 */
async function storeTweet(tweet) {
    try {
        // Store tweet in recent tweets list
        await redis.lpush(RECENT_TWEETS_KEY, JSON.stringify(tweet));
        await redis.ltrim(RECENT_TWEETS_KEY, 0, 9); // Keep only last 10 tweets
        // Track hashtags
        if (tweet.hashtags && tweet.hashtags.length > 0) {
            for (const hashtag of tweet.hashtags) {
                await redis.zincrby(TWEET_HASHTAGS_KEY, 1, hashtag.toLowerCase());
            }
        }
        // Track mentions
        if (tweet.mentions && tweet.mentions.length > 0) {
            for (const mention of tweet.mentions) {
                await redis.zincrby(TWEET_MENTIONS_KEY, 1, mention.toLowerCase());
            }
        }
        // Publish to tweets channel for real-time updates
        await redis.publish("tweets:new", JSON.stringify(tweet));
    }
    catch (error) {
        console.error("Error storing tweet:", error);
        throw error;
    }
}
/**
 * Get recent tweets
 */
async function getRecentTweets(limit = 10) {
    try {
        const tweets = await redis.lrange(RECENT_TWEETS_KEY, 0, limit - 1);
        return tweets.map((tweet) => JSON.parse(tweet));
    }
    catch (error) {
        console.error("Error getting recent tweets:", error);
        return [];
    }
}
/**
 * Get top hashtags
 */
async function getTopHashtags(limit = 10) {
    try {
        const results = await redis.zrange(TWEET_HASHTAGS_KEY, 0, limit - 1, {
            withScores: true,
            rev: true,
        });
        const hashtags = [];
        for (let i = 0; i < results.length; i += 2) {
            hashtags.push({
                hashtag: results[i],
                count: Number(results[i + 1]),
            });
        }
        return hashtags;
    }
    catch (error) {
        console.error("Error getting top hashtags:", error);
        return [];
    }
}
/**
 * Get top mentions
 */
async function getTopMentions(limit = 10) {
    try {
        const results = await redis.zrange(TWEET_MENTIONS_KEY, 0, limit - 1, {
            withScores: true,
            rev: true,
        });
        const mentions = [];
        for (let i = 0; i < results.length; i += 2) {
            mentions.push({
                mention: results[i],
                count: Number(results[i + 1]),
            });
        }
        return mentions;
    }
    catch (error) {
        console.error("Error getting top mentions:", error);
        return [];
    }
}
/**
 * Update trending topics
 */
async function updateTrendingTopic(topic, count, change, sentiment) {
    try {
        const now = new Date().toISOString();
        const topicData = {
            topic,
            tweetCount: count,
            change24h: change,
            sentiment,
            lastUpdated: now,
        };
        // Store topic data
        await redis.set(`trending:topic:${topic}`, JSON.stringify(topicData));
        // Update trending topics sorted set
        await redis.zadd(TRENDING_TOPICS_KEY, { score: count, member: topic });
    }
    catch (error) {
        console.error(`Error updating trending topic ${topic}:`, error);
        throw error;
    }
}
/**
 * Get trending topics
 */
async function getTrendingTopics(limit = 5) {
    try {
        // Get top topics by count
        const topTopics = await redis.zrange(TRENDING_TOPICS_KEY, 0, limit - 1, { rev: true });
        if (!topTopics.length)
            return [];
        // Get topic data for each topic
        const topicDataPromises = topTopics.map(async (topic) => {
            const data = await redis.get(`trending:topic:${topic}`);
            return data ? JSON.parse(data) : null;
        });
        const topicsData = await Promise.all(topicDataPromises);
        return topicsData.filter(Boolean);
    }
    catch (error) {
        console.error("Error getting trending topics:", error);
        return [];
    }
}
/**
 * Analyze tweet sentiment
 */
function analyzeSentiment(content) {
    const positiveWords = ["moon", "pump", "bullish", "gain", "profit", "up", "win", "good", "great", "best"];
    const negativeWords = ["dump", "bearish", "crash", "loss", "down", "bad", "worst", "rug", "scam", "fail"];
    const lowerContent = content.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    for (const word of positiveWords) {
        if (lowerContent.includes(word))
            positiveScore++;
    }
    for (const word of negativeWords) {
        if (lowerContent.includes(word))
            negativeScore++;
    }
    if (positiveScore > negativeScore)
        return "positive";
    if (negativeScore > positiveScore)
        return "negative";
    return "neutral";
}
// ==================== WALLET SERVICE FUNCTIONS ====================
/**
 * Track a wallet
 */
async function trackWallet(address) {
    try {
        // Add to tracked wallets set
        await redis.sadd(TRACKED_WALLETS_KEY, address);
        // Update wallet data with tracked flag
        const walletData = await getWalletData(address);
        if (walletData) {
            await updateWalletData({
                ...walletData,
                isTracked: true,
            });
        }
    }
    catch (error) {
        console.error(`Error tracking wallet ${address}:`, error);
        throw error;
    }
}
/**
 * Untrack a wallet
 */
async function untrackWallet(address) {
    try {
        // Remove from tracked wallets set
        await redis.srem(TRACKED_WALLETS_KEY, address);
        // Update wallet data with tracked flag
        const walletData = await getWalletData(address);
        if (walletData) {
            await updateWalletData({
                ...walletData,
                isTracked: false,
            });
        }
    }
    catch (error) {
        console.error(`Error untracking wallet ${address}:`, error);
        throw error;
    }
}
/**
 * Get tracked wallets
 */
async function getTrackedWallets() {
    try {
        return (await redis.smembers(TRACKED_WALLETS_KEY));
    }
    catch (error) {
        console.error("Error getting tracked wallets:", error);
        return [];
    }
}
/**
 * Update wallet data
 */
async function updateWalletData(walletData) {
    try {
        const now = new Date().toISOString();
        // Update wallet data
        await redis.set(`${WALLET_DATA_KEY_PREFIX}${walletData.address}`, JSON.stringify({
            ...walletData,
            lastUpdated: now,
        }));
    }
    catch (error) {
        console.error(`Error updating wallet data for ${walletData.address}:`, error);
        throw error;
    }
}
/**
 * Get wallet data
 */
async function getWalletData(address) {
    try {
        const data = await redis.get(`${WALLET_DATA_KEY_PREFIX}${address}`);
        return data ? JSON.parse(data) : null;
    }
    catch (error) {
        console.error(`Error getting wallet data for ${address}:`, error);
        return null;
    }
}
/**
 * Add transaction to wallet history
 */
async function addWalletTransaction(address, transaction) {
    try {
        // Add to transactions list
        await redis.lpush(`${WALLET_TRANSACTIONS_KEY_PREFIX}${address}`, JSON.stringify(transaction));
        await redis.ltrim(`${WALLET_TRANSACTIONS_KEY_PREFIX}${address}`, 0, 99); // Keep last 100 transactions
        // Update last active time in wallet data
        const walletData = await getWalletData(address);
        if (walletData) {
            await updateWalletData({
                ...walletData,
                lastActive: new Date(transaction.blockTime * 1000).toISOString(),
            });
        }
    }
    catch (error) {
        console.error(`Error adding transaction for wallet ${address}:`, error);
        throw error;
    }
}
/**
 * Get wallet transactions
 */
async function getWalletTransactions(address, limit = 20) {
    try {
        const transactions = await redis.lrange(`${WALLET_TRANSACTIONS_KEY_PREFIX}${address}`, 0, limit - 1);
        return transactions.map((tx) => JSON.parse(tx));
    }
    catch (error) {
        console.error(`Error getting transactions for wallet ${address}:`, error);
        return [];
    }
}
/**
 * Update wallet token holdings
 */
async function updateWalletTokens(address, tokens) {
    try {
        // Store token holdings
        await redis.set(`${WALLET_TOKENS_KEY_PREFIX}${address}`, JSON.stringify(tokens));
    }
    catch (error) {
        console.error(`Error updating tokens for wallet ${address}:`, error);
        throw error;
    }
}
/**
 * Get wallet token holdings
 */
async function getWalletTokens(address) {
    try {
        const tokens = await redis.get(`${WALLET_TOKENS_KEY_PREFIX}${address}`);
        return tokens ? JSON.parse(tokens) : [];
    }
    catch (error) {
        console.error(`Error getting tokens for wallet ${address}:`, error);
        return [];
    }
}
/**
 * Get fallen wallets
 */
async function getFallenWallets(limit = 10) {
    try {
        const wallets = await redis.lrange(FALLEN_WALLETS_KEY, 0, limit - 1);
        return wallets.map((wallet) => JSON.parse(wallet));
    }
    catch (error) {
        console.error("Error getting fallen wallets:", error);
        return [];
    }
}
// ==================== TRENDING COIN SERVICE FUNCTIONS ====================
/**
 * Add or update a coin in the trending list
 */
async function updateTrendingCoin(coin) {
    try {
        const now = new Date().toISOString();
        // Calculate trending score based on volume and mentions
        const score = calculateTrendingScore(coin.volumeChange24h, coin.mentionsChange24h);
        const coinData = {
            ...coin,
            score,
            lastUpdated: now,
        };
        // Store coin data
        await redis.set(`${COIN_DATA_KEY_PREFIX}${coin.symbol}`, JSON.stringify(coinData));
        // Update volume history
        await redis.lpush(`${COIN_VOLUME_KEY_PREFIX}${coin.symbol}`, coin.volume24h.toString());
        await redis.ltrim(`${COIN_VOLUME_KEY_PREFIX}${coin.symbol}`, 0, 13); // Keep last 14 days
        // Update mentions history
        await redis.lpush(`${COIN_MENTIONS_KEY_PREFIX}${coin.symbol}`, coin.mentions24h.toString());
        await redis.ltrim(`${COIN_MENTIONS_KEY_PREFIX}${coin.symbol}`, 0, 6); // Keep last 7 days
        // Update trending list sorted by score
        await redis.zadd(TRENDING_COINS_KEY, { score, member: coin.symbol });
        return coinData;
    }
    catch (error) {
        console.error("Error updating trending coin:", error);
        throw error;
    }
}
/**
 * Get top trending coins
 */
async function getTopTrendingCoins(limit = 5) {
    try {
        // Get top coins by score
        const topCoins = await redis.zrange(TRENDING_COINS_KEY, 0, limit - 1, { rev: true });
        if (!topCoins.length)
            return [];
        // Get coin data for each symbol
        const coinDataPromises = topCoins.map(async (symbol) => {
            const data = await redis.get(`${COIN_DATA_KEY_PREFIX}${symbol}`);
            return data ? JSON.parse(data) : null;
        });
        const coinsData = await Promise.all(coinDataPromises);
        return coinsData.filter(Boolean);
    }
    catch (error) {
        console.error("Error getting top trending coins:", error);
        return [];
    }
}
/**
 * Get volume history for a coin
 */
async function getCoinVolumeHistory(symbol) {
    try {
        const history = await redis.lrange(`${COIN_VOLUME_KEY_PREFIX}${symbol}`, 0, 13);
        return history.map((item) => Number(item));
    }
    catch (error) {
        console.error(`Error getting volume history for ${symbol}:`, error);
        return [];
    }
}
/**
 * Get mentions history for a coin
 */
async function getCoinMentionsHistory(symbol) {
    try {
        const history = await redis.lrange(`${COIN_MENTIONS_KEY_PREFIX}${symbol}`, 0, 6);
        return history.map((item) => Number(item));
    }
    catch (error) {
        console.error(`Error getting mentions history for ${symbol}:`, error);
        return [];
    }
}
/**
 * Get all volume anomalies
 */
async function getVolumeAnomalies() {
    try {
        const anomalies = await redis.lrange(ANOMALY_ALERTS_KEY, 0, 9); // Get last 10 anomalies
        return anomalies.map((item) => JSON.parse(item));
    }
    catch (error) {
        console.error("Error getting volume anomalies:", error);
        return [];
    }
}
/**
 * Calculate trending score based on volume and mentions change
 */
function calculateTrendingScore(volumeChange, mentionsChange) {
    // Weight factors
    const volumeWeight = 0.6;
    const mentionsWeight = 0.4;
    // Normalize changes to a 0-100 scale
    const normalizedVolumeChange = Math.min(100, Math.max(0, volumeChange + 50));
    const normalizedMentionsChange = Math.min(100, Math.max(0, mentionsChange + 50));
    // Calculate weighted score
    return normalizedVolumeChange * volumeWeight + normalizedMentionsChange * mentionsWeight;
}
/**
 * Post to X (Twitter)
 */
async function postToX(options) {
    try {
        // In a real implementation, this would use the X API
        // We're using environment variables for the API keys
        // NEVER hardcode API keys in your code
        const apiKey = process.env.X_API_KEY;
        const apiSecret = process.env.X_API_SECRET;
        if (!apiKey || !apiSecret) {
            throw new Error("X API credentials not configured");
        }
        // Add hashtags if provided
        const text = options.hashtags && options.hashtags.length > 0
            ? `${options.text} ${options.hashtags.map((tag) => `#${tag}`).join(" ")}`
            : options.text;
        console.log(`Would post to X: ${text}`);
        // In a real implementation, this would make an API call to X
        // For demo purposes, we're just returning a mock success response
        return {
            success: true,
            id: `mock-tweet-${Date.now()}`,
        };
    }
    catch (error) {
        console.error("Error posting to X:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
// ==================== API ROUTES ====================
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});
// ===== TRENDING ROUTES =====
app.get("/api/trending", async (req, res) => {
    try {
        // Try to get real data
        const [coins, topics, fallenWallets] = await Promise.all([
            getTopTrendingCoins(5),
            getTrendingTopics(5),
            getFallenWallets(5),
        ]);
        return res.json({
            success: true,
            data: {
                coins: coins.length > 0 ? coins : MOCK_COINS,
                topics: topics.length > 0 ? topics : MOCK_TOPICS,
                fallenWallets: fallenWallets.length > 0 ? fallenWallets : MOCK_FALLEN_WALLETS,
            },
        });
    }
    catch (error) {
        console.error("Error in trending API:", error);
        // Return mock data as fallback
        return res.json({
            success: true,
            data: {
                coins: MOCK_COINS,
                topics: MOCK_TOPICS,
                fallenWallets: MOCK_FALLEN_WALLETS,
            },
        });
    }
});
// ===== TWEETS ROUTES =====
app.get("/api/tweets", async (req, res) => {
    try {
        // Try to get real data
        const [tweets, hashtags, mentions, topics] = await Promise.all([
            getRecentTweets(10),
            getTopHashtags(10),
            getTopMentions(10),
            getTrendingTopics(5),
        ]);
        // If we have real data, use it
        return res.json({
            success: true,
            data: {
                tweets: tweets.length > 0 ? tweets : MOCK_TWEETS,
                hashtags: hashtags.length > 0 ? hashtags : MOCK_HASHTAGS,
                mentions: mentions.length > 0 ? mentions : MOCK_MENTIONS,
                topics: topics.length > 0 ? topics : MOCK_TOPICS,
            },
        });
    }
    catch (error) {
        console.error("Error getting tweets data:", error);
        // Return mock data as fallback
        return res.json({
            success: true,
            data: {
                tweets: MOCK_TWEETS,
                hashtags: MOCK_HASHTAGS,
                mentions: MOCK_MENTIONS,
                topics: MOCK_TOPICS,
            },
        });
    }
});
app.get("/api/tweets/topics", async (req, res) => {
    try {
        const topics = await getTrendingTopics(5);
        return res.json({
            success: true,
            data: topics.length > 0 ? topics : MOCK_TOPICS,
        });
    }
    catch (error) {
        console.error("Error getting trending topics:", error);
        return res.json({ success: true, data: MOCK_TOPICS });
    }
});
// ===== WALLETS ROUTES =====
app.post("/api/wallets/track", async (req, res) => {
    const { address } = req.body;
    if (!address) {
        return res.status(400).json({ success: false, error: "Address is required" });
    }
    try {
        await trackWallet(address);
        return res.json({ success: true });
    }
    catch (error) {
        console.error(`Error tracking wallet ${address}:`, error);
        return res.json({ success: true }); // Return success anyway for demo
    }
});
app.post("/api/wallets/untrack", async (req, res) => {
    const { address } = req.body;
    if (!address) {
        return res.status(400).json({ success: false, error: "Address is required" });
    }
    try {
        await untrackWallet(address);
        return res.json({ success: true });
    }
    catch (error) {
        console.error(`Error untracking wallet ${address}:`, error);
        return res.json({ success: true }); // Return success anyway for demo
    }
});
app.get("/api/wallets/:address", async (req, res) => {
    const { address } = req.params;
    try {
        // Try to get real data
        const [walletData, transactions, tokens] = await Promise.all([
            getWalletData(address),
            getWalletTransactions(address),
            getWalletTokens(address),
        ]);
        // If we have real data, use it
        if (walletData) {
            return res.json({
                success: true,
                data: {
                    wallet: walletData,
                    transactions,
                    tokens,
                },
            });
        }
        // Otherwise, use mock data
        return res.json({
            success: true,
            data: {
                wallet: { ...MOCK_WALLET_DATA, address },
                transactions: MOCK_TRANSACTIONS,
                tokens: MOCK_TOKENS,
            },
        });
    }
    catch (error) {
        console.error(`Error getting wallet data for ${address}:`, error);
        // Return mock data as fallback
        return res.json({
            success: true,
            data: {
                wallet: { ...MOCK_WALLET_DATA, address },
                transactions: MOCK_TRANSACTIONS,
                tokens: MOCK_TOKENS,
            },
        });
    }
});
// ===== X (TWITTER) POSTING ROUTES =====
app.post("/api/x/post", async (req, res) => {
    const { text, hashtags } = req.body;
    if (!text) {
        return res.status(400).json({ success: false, error: "Text is required" });
    }
    try {
        const result = await postToX({ text, hashtags });
        return res.json(result);
    }
    catch (error) {
        console.error("Error posting to X:", error);
        return res.status(500).json({ success: false, error: "Failed to post to X" });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
