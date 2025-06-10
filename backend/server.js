const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require("dotenv").config();
const path = require("path");

// Import puppeteer
const puppeteer = require("puppeteer");

const app = express();
const port = process.env.PORT || 8000;

// Parse allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGIN
    ? process.env.ALLOWED_ORIGIN.split(',').map(origin => origin.trim())
    : [];

// Add Railway domain if in production
if (process.env.RAILWAY_ENVIRONMENT === 'production' && process.env.RAILWAY_PUBLIC_DOMAIN) {
    allowedOrigins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
}

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Handle wildcard
        if (process.env.ALLOWED_ORIGIN === '*') {
            return callback(null, true);
        }
        
        const whitelist = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8080",
            ...allowedOrigins
        ].filter(Boolean);
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // In production on Railway, also allow the app's own domain
        if (process.env.RAILWAY_ENVIRONMENT === 'production') {
            const appUrl = process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN;
            if (appUrl && (origin.includes(appUrl) || origin === `https://${appUrl}`)) {
                return callback(null, true);
            }
        }
        
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Accept"],
    credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Function to get browser instance
async function getBrowser() {
    // Check if we're running on Railway
    const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production';
    
    console.log('Environment:', isRailway ? 'Railway' : 'Local');

    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
    ];

    if (isRailway) {
        console.log('Launching browser in Railway environment');
        return await puppeteer.launch({
            headless: 'new',
            args: args
        });
    }

    // For local development
    const os = require("os");
    const platform = os.platform();

    if (platform === "darwin") {
        const findChrome = () => {
            const chromeLocations = [
                "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
                "/Applications/Chromium.app/Contents/MacOS/Chromium",
            ];

            for (const path of chromeLocations) {
                try {
                    if (require("fs").existsSync(path)) {
                        console.log(`Found Chrome at: ${path}`);
                        return path;
                    }
                } catch (e) {
                    // Ignore errors
                }
            }
            return null;
        };

        const chromePath = findChrome();
        console.log('Launching browser in local macOS environment');

        return await puppeteer.launch({
            executablePath: chromePath,
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
    } else {
        console.log('Launching browser in local non-macOS environment');
        return await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
    }
}

// Function to capture screenshots over a specified duration
async function captureTimelapseScreenshots(
    url,
    durationSeconds = 15,
    frameCount = 8
) {
    let browser = null;
    const screenshots = [];

    try {
        browser = await getBrowser();
        const intervalMs = Math.floor(
            (durationSeconds * 1000) / (frameCount - 1)
        );

        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 30000,
        });

        // Take first screenshot immediately
        const initialScreenshot = await page.screenshot({
            type: "jpeg",
            quality: 75,
        });
        screenshots.push(initialScreenshot);

        // Take remaining screenshots at calculated intervals
        for (let i = 1; i < frameCount; i++) {
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
            const screenshot = await page.screenshot({
                type: "jpeg",
                quality: 75,
            });
            screenshots.push(screenshot);
        }

        return screenshots;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Function to get a single screenshot
async function getScreenshot(url) {
    let browser = null;

    try {
        browser = await getBrowser();
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 30000,
        });

        return await page.screenshot({
            type: "jpeg",
            quality: 80,
        });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Function to proofread multiple screenshots
async function proofreadMultipleScreenshots(screenshots) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const batchSize = 6;

    if (screenshots.length <= batchSize) {
        const imageParts = screenshots.map((screenshot) => ({
            inlineData: {
                data: screenshot.toString("base64"),
                mimeType: "image/jpeg",
            },
        }));

        const prompt =
            "Spellcheck this banner for any spelling errors, grammatical mistakes, or typos. Provide only a brief summary of issues found with suggested corrections. If no issues, just state that the banner is error-free.";

        const contents = [prompt, ...imageParts];
        const result = await model.generateContent(contents);
        const response = await result.response;

        return response.text();
    } else {
        let allErrors = [];

        for (let i = 0; i < screenshots.length; i += batchSize) {
            const batch = screenshots.slice(i, i + batchSize);
            const imageParts = batch.map((screenshot) => ({
                inlineData: {
                    data: screenshot.toString("base64"),
                    mimeType: "image/jpeg",
                },
            }));

            const batchPrompt =
                "Spellcheck this banner for any spelling errors, grammatical mistakes, or typos. List only the errors found, if any.";

            const contents = [batchPrompt, ...imageParts];
            const result = await model.generateContent(contents);
            const response = await result.response;

            allErrors.push(response.text());
        }

        const summaryPrompt = `Based on the analysis of this banner, provide only a concise list of spelling errors, grammatical mistakes, or typos found, with correct versions. If no issues were found, simply state the banner is error-free. Previous analyses: ${allErrors.join(
            " "
        )}`;

        const summaryResult = await model.generateContent(summaryPrompt);
        const summaryResponse = await summaryResult.response;

        return summaryResponse.text();
    }
}

// Function to proofread a single screenshot
async function proofreadWithGemini(screenshot) {
    const screenshotBase64 = screenshot.toString("base64");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt =
        "Spellcheck this banner for any spelling errors, grammatical mistakes, or typos. Provide only a brief summary of issues found with suggested corrections. If no issues, just state that the banner is error-free.";

    const imagePart = {
        inlineData: {
            data: screenshotBase64,
            mimeType: "image/jpeg",
        },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;

    return response.text();
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// API endpoint for proofreading
app.post("/api/proofread", async (req, res) => {
    try {
        const {
            bannerUrl,
            multiScreenshot = true,
            durationSeconds = 15,
        } = req.body;

        if (!bannerUrl) {
            return res.status(400).json({ error: "Banner URL is required" });
        }

        // Validate URL format
        try {
            new URL(bannerUrl);
        } catch (e) {
            return res.status(400).json({ error: "Invalid URL format" });
        }

        // Check if URL is accessible
        try {
            await axios.get(bannerUrl, { timeout: 5000 });
        } catch (accessError) {
            return res.status(400).json({
                error: `The URL could not be accessed: ${accessError.message}`,
                details:
                    "Make sure the URL is publicly accessible and does not require authentication.",
            });
        }

        if (multiScreenshot) {
            try {
                const screenshots = await captureTimelapseScreenshots(
                    bannerUrl,
                    durationSeconds,
                    8
                );

                if (!screenshots || screenshots.length === 0) {
                    return res.status(500).json({
                        error: "Failed to capture screenshots",
                        details: "The banner may not be loading correctly.",
                    });
                }

                const proofreadingResults = await proofreadMultipleScreenshots(
                    screenshots
                );

                return res.json({
                    results: proofreadingResults,
                    screenshotCount: screenshots.length,
                    durationSeconds: durationSeconds,
                });
            } catch (error) {
                console.error("Error in multi-screenshot mode:", error);
                // Fall back to single-screenshot mode
            }
        }

        // Single-screenshot approach (fallback)
        try {
            const screenshot = await getScreenshot(bannerUrl);

            if (!screenshot || screenshot.length < 1000) {
                return res.status(500).json({
                    error: "Screenshot appears to be empty or too small",
                    details:
                        "The captured screenshot is unusually small, suggesting the page might not have loaded properly.",
                });
            }

            const proofreadingResults = await proofreadWithGemini(screenshot);

            return res.json({
                results: proofreadingResults,
                screenshotCount: 1,
                durationSeconds: 0,
            });
        } catch (screenshotError) {
            return res.status(500).json({
                error: `Error capturing or proofreading screenshot: ${screenshotError.message}`,
                details: `This might be due to the page taking too long to load or API limits.`,
            });
        }
    } catch (error) {
        console.error("General error:", error);
        return res.status(500).json({
            error: `Error proofreading banner: ${error.message}`,
            details: error.message,
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});