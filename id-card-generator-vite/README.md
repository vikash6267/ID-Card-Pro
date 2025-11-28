# ID Card Generator - Vite Rebuild

Modern, fully client-side ID card design and batch generation tool built with React 18, Vite, and React-Konva.

## Features

- Visual canvas editor for designing ID card templates
- CSV data import for batch generation
- Photo management and cropping
- QR code and barcode support
- Multiple export formats (PNG, PDF, ZIP)
- Project management with save/load
- Undo/redo functionality
- Dark/light theme support

## Tech Stack

- **React 18** - UI framework with concurrent features
- **Vite** - Fast build tool and dev server
- **React-Konva** - Canvas rendering library
- **Zustand** - State management
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **jsPDF** - PDF generation
- **JSZip** - ZIP archive creation
- **PapaParse** - CSV parsing
- **QRCode.js** - QR code generation
- **bwip-js** - Barcode generation

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

### Project Structure

```
src/
├── components/     # React components
├── stores/         # Zustand state stores
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── services/       # Business logic services
├── types/          # Type definitions
└── test/           # Test utilities and setup
```

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## License

MIT
