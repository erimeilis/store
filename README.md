# Store CRUD API

A modern TypeScript-based CRUD application built with Hono framework and designed for Cloudflare infrastructure deployment.

## 🚀 Overview

This project provides a complete REST API for managing store items with file upload capabilities, built specifically for the Cloudflare ecosystem. It features a robust backend API with comprehensive testing, file processing, and integration with Cloudflare's edge services.

## 🛠 Tech Stack

- **Backend**: [Hono](https://hono.dev/) - Ultra-fast web framework for Cloudflare Workers
- **Runtime**: Cloudflare Workers (V8 JavaScript engine)
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Storage**: Cloudflare R2 for file uploads
- **Cache**: Cloudflare KV for sessions and caching
- **Language**: TypeScript with strict type checking
- **Testing**: Vitest with comprehensive test suite
- **Deployment**: Wrangler CLI

## ✨ Features

- **Complete REST API**: Full CRUD operations for store items
- **File Upload & Processing**: CSV/Excel file parsing with bulk data operations
- **Type Safety**: Full TypeScript implementation with strict typing
- **Comprehensive Testing**: 20+ test cases covering all endpoints and edge cases
- **Edge Deployment**: Optimized for Cloudflare Workers edge runtime
- **CORS Support**: Ready for frontend integration
- **Error Handling**: Structured error responses with proper HTTP status codes
- **Database Integration**: SQLite-compatible schema with D1 bindings

## 🚦 Quick Start

### Prerequisites

- Node.js 18+ with npm
- Cloudflare account (for deployment)
- Wrangler CLI: `npm install -g wrangler`

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd Store
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Run tests**:
   ```bash
   # Run tests once
   npm run test:run
   
   # Run tests in watch mode
   npm test
   ```

### API Endpoints

- `GET /health` - Health check with version info
- `GET /api/items` - List all items
- `GET /api/items/:id` - Get specific item
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update existing item
- `DELETE /api/items/:id` - Delete item
- `POST /api/upload` - Upload and process files

## 📚 Documentation

For detailed information, please refer to our comprehensive documentation:

- **[Project Structure & Architecture](docs/project-structure.md)** - Complete tech stack overview, implementation roadmap, and architectural decisions
- **[Deployment Instructions](docs/deploy-instructions.md)** - Step-by-step guide for Cloudflare deployment and resource setup
- **[Authentication Guide](docs/authentication.md)** - Authentication implementation and security considerations

## 🧪 Testing

The project includes a comprehensive test suite with:

- Health check endpoint validation
- All CRUD operations testing
- Error handling and edge cases
- File upload and processing scenarios
- Mock Cloudflare bindings for isolated testing

```bash
# Run all tests
npm run test:run

# Run specific test file
npx vitest run test/api.test.ts

# Build validation
npm run build
```

## 🚀 Deployment

Deploy to Cloudflare Workers:

```bash
# Deploy to production
npm run deploy

# View deployment logs
wrangler tail
```

For detailed deployment instructions including D1, R2, and KV setup, see [docs/deploy-instructions.md](docs/deploy-instructions.md).

## 📊 Project Status

**Phase 1: Backend API Development** ✅ **COMPLETED**
- Complete REST API implementation
- Comprehensive test suite (355 lines)
- File upload and processing capabilities
- Production-ready TypeScript codebase (422 lines)
- Advanced mock bindings for testing

**Phase 2: Frontend Development** 🚧 **IN PROGRESS**
- Next.js with OpenNext.js Cloudflare adapter
- React components for CRUD interface
- Authentication integration
- File upload UI

## 🤝 Development

### Project Structure

```
├── src/
│   └── index.ts          # Main Hono application (422 lines)
├── test/
│   ├── api.test.ts       # API endpoint tests (355 lines)
│   └── test-bindings.ts  # Mock Cloudflare bindings (188 lines)
├── docs/                 # Comprehensive documentation
├── frontend/             # Next.js frontend (in progress)
└── schema.sql           # Database schema
```

### Development Commands

```bash
npm run dev      # Start development server
npm run build    # TypeScript validation
npm run test     # Run tests in watch mode
npm run deploy   # Deploy to Cloudflare
```

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions about implementation details, deployment, or architecture decisions, please refer to the documentation in the `docs/` directory or create an issue.

---

*Last updated: August 25, 2024*
