# Quickstart: FixYourPrompts.com

This guide provides the steps to set up and run the TypeScript + React + Vite application locally.

## Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- Git
- Modern web browser
- Code editor with TypeScript support (VS Code recommended)

## Setup

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd fixyourprompts
   ```

2. **Navigate to the frontend directory**

   ```bash
   cd frontend
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   This will start the Vite development server with hot module replacement at `http://localhost:5173`

5. **Access the Application**

   Open your web browser and navigate to `http://localhost:5173`

## Usage

1. **Enter Your Prompt**: Type your rough, vague prompt in the main text area
2. **Click "Analyze & Refine"**: The client-side analyzer will process your prompt
3. **Review Analysis**: See specific issues identified in your prompt
4. **View Refined Version**: Compare original vs. improved prompt side-by-side
5. **Learn Techniques**: Read contextual education tips about prompting best practices
6. **Copy & Use**: Copy the refined prompt for use in your AI tools

### Example Usage Flow

```
Original Prompt: "write code to analyze data"

Analysis Issues Identified:
• Vagueness: No specific programming language mentioned
• Missing Context: What type of data? What kind of analysis?
• Unclear Constraints: No output format or requirements specified
• Missing Examples: No sample use case provided

Refined Prompt: "Create a Python script that analyzes CSV data files containing 
numerical data (sales, metrics, etc.). The script should:

**Requirements:**
- Read data from a CSV file path provided by the user
- Calculate descriptive statistics (mean, median, std dev, percentiles)
- Generate visualizations (histogram, box plot, trend analysis if time-series)
- Export results to both console output and a formatted HTML report
- Handle missing/invalid data gracefully with clear error messages

**Technical specifications:**
- Use pandas for data manipulation and matplotlib/seaborn for visualizations
- Include comprehensive error handling and user input validation
- Provide clear documentation and example usage
- Support CSV files up to 10MB in size

**Example usage:**
python analyze_data.py --file sales_data.csv --output-dir ./reports

Please provide well-commented, production-ready code with type hints."

Education Tip: This demonstrates "Constraint Addition" - adding specific 
technical requirements, data formats, and success criteria transforms a 
vague request into actionable specifications that produce better AI results.
```

## Testing

### Run Unit Tests (Vitest)

```bash
# From the frontend directory
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Run E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Manual Testing Workflow

1. Visit `http://localhost:5173`
2. Enter a vague prompt: "help me learn JavaScript"
3. Click "Analyze & Refine"
4. Verify you see:
   - Analysis issues identified
   - A structured, detailed refined prompt
   - Educational tips about prompting techniques
   - Before/after comparison

### Performance Expectations

- **Analysis Time**: <500ms for rule-based processing
- **UI Response**: Instant feedback with TypeScript type safety
- **Bundle Size**: <2MB initial load with code splitting

## Troubleshooting

### TypeScript Compilation Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Restart TypeScript language server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Development Server Issues
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -ti:5173
```

### Test Failures
```bash
# Clear test cache
npm run test:clear

# Run specific test file
npm run test -- PromptAnalyzer.test.ts

# Debug test in browser
npm run test:ui
```

## Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

# Serve on custom port
npm run preview -- --port 3000
```

## Production Deployment

The application builds to static files and can be deployed to:

- **Netlify**: Connect GitHub repo for automatic deployments
- **Vercel**: Import project with zero configuration
- **GitHub Pages**: Use GitHub Actions for automated builds
- **AWS S3 + CloudFront**: Upload build files to S3 bucket

### Build Output
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── education-content.json
└── favicon.ico
```

## Development Benefits

- ⚡ **Fast HMR**: Instant updates with Vite
- 🔒 **Type Safety**: Catch errors at compile time
- 🧪 **Comprehensive Testing**: Unit tests + E2E coverage
- 📱 **Responsive**: Works on all device sizes
- 🎯 **No Dependencies**: Client-side only, no server costs
- 🔧 **Modern Tooling**: Latest React, TypeScript, and testing tools