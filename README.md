# AI Banner Proofreader

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://gitlab.com/GreshamT/ai-banner-proofreader)
[![Status](https://img.shields.io/badge/status-active-success.svg)](https://banner-proofreader.onrender.com/)

A web application that uses Google's Gemini AI to automatically proofread HTML5 banners for spelling errors, grammatical mistakes, and typos.

## Table of Contents
- [Description](#description)
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Description

The AI Banner Proofreader is a tool designed to help designers ensure their HTML5 banners are error-free. By simply providing a URL to your banner, the application will:

1. Capture a screenshot of the banner
2. Use Google's Gemini AI to analyze the text content
3. Provide a detailed report of any spelling errors, grammatical mistakes, or typos found

## Features

- Simple web interface for easy banner URL submission
- Automated screenshot capture of HTML5 banners
- AI-powered text analysis using Google's Gemini model
- Detailed proofreading reports
- Real-time error highlighting
- Support for publicly accessible banner URLs
- Responsive design for all device sizes
- Secure API key handling

## Demo

Try it out: https://banner-proofreader.onrender.com/

Example banner to test: https://preview.adlicious.me/Test-Banner/2025/Test-1/EN/300x600/index.html

## Installation

1. Clone the repository:
```bash
git clone https://gitlab.com/GreshamT/ai-banner-proofreader.git
cd ai-banner-proofreader
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Google AI API key:
```
GOOGLE_AI_API_KEY=your_api_key_here
PORT=8000  # Optional, defaults to 8000
```

## Usage

1. Start the development server:
```bash
npm run dev:all
```

2. Open your browser and navigate to `http://localhost:3000`

3. Enter the URL of your HTML5 banner in the input field

4. Click "Proofread Banner" to start the analysis

5. Review the results in the results area

## Development

The project is built with:
- Frontend: 
  - HTML5
  - CSS (Tailwind CSS v3.x)
  - JavaScript (ES6+)
- Backend: 
  - Node.js (v18.x or higher)
  - Express.js (v4.x)
- AI: 
  - Google Gemini API (v1.x)
- Browser Automation: 
  - Puppeteer (v21.x)
- Deploymeny: 
  - Render

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GOOGLE_AI_API_KEY` | Your Google AI API key for Gemini access | Yes | - |
| `PORT` | Port number for the development server | No | 3000 |

## Troubleshooting

Common issues and their solutions:

1. **API Key Issues**
   - Ensure your Google AI API key is valid and has sufficient quota
   - Check if the API key is properly set in the `.env` file

2. **Screenshot Capture Failures**
   - Verify the banner URL is publicly accessible
   - Check if the banner loads properly in a browser
   - Ensure the banner doesn't have any CORS restrictions

3. **Server Connection Issues**
   - Verify the port isn't being used by another application
   - Check if all dependencies are properly installed
   - Ensure you have the correct Node.js version installed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License

Copyright (c) 2025 Gresham Tembo

