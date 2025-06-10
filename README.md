# AI Banner Proofreader

A web application that uses Google's Gemini AI to automatically proofread HTML5 banners for spelling errors, grammatical mistakes, and typos.

## Description

The AI Banner Proofreader is a tool designed to help designers ensure their HTML5 banners are error-free. By simply providing a URL to your banner, the application will:

1. Capture a screenshot of the banner
2. Use Google's Gemini AI to analyze the text content
3. Provide a detailed report of any spelling errors, grammatical mistakes, or typos found

Try it out: (link coming soon)

## Features

- Simple web interface for easy banner URL submission
- Automated screenshot capture of HTML5 banners
- AI-powered text analysis using Google's Gemini model
- Detailed proofreading reports
- Real-time error highlighting
- Support for publicly accessible banner URLs

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
- Frontend: HTML, CSS (Tailwind), JavaScript
- Backend: Node.js, Express
- AI: Google Gemini API
- Browser Automation: Puppeteer

## Environment Variables

- `GOOGLE_AI_API_KEY`: Your Google AI API key for Gemini access
- `PORT`: (Optional) Port number for the development server (defaults to 3000)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License

Copyright (c) 2025 Gresham Tembo

