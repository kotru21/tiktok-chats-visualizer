# Tiktok Chats Visualizer

![App in dark theme](https://github.com/user-attachments/assets/f8ddb96b-2332-412a-893d-72cf20a82f3c)

[Русская версия README](./README.md)

## 📱 About

Tiktok Chats Visualizer is a web application for analyzing and visualizing chat history from exported TikTok data. Upload a JSON file with your conversation history and explore rich statistics about your messaging patterns.

## ✨ Features

- Upload and analyze JSON files with TikTok chat history
- View a list of users you’ve chatted with
- Detailed per-chat statistics:
  - Total message count
  - Average messages per day
  - Message distribution between participants
  - Most frequent words and bigrams
  - Activity over time (by date)
  - Analysis by weekday and time of day
- Automatic dark mode that respects the system preference
- Modular architecture with ES6 modules
- Interactive charts with customization options

![App in light theme](https://github.com/user-attachments/assets/40b53f56-eea8-499d-a132-c1fd4a5ebe94)

## 🛠 Tech Stack

- Frontend: HTML, CSS, JavaScript (ES6+ modules), Chart.js
- Backend: Node.js, Express
- Additional libraries: Moment.js
- Testing: Mocha with ES modules
- Code Quality: ESLint, Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher is recommended)
- npm (bundled with Node.js)
- Exported TikTok messages in JSON format (see “How to use”)
- For production hosting, set `{ secure: true }` for sessions

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/tiktok-chats-visualizer.git
cd tiktok-chats-visualizer
```

Or download the source archive from GitHub.

1. Install dependencies:

```bash
npm install
```

1. Start the server:

```bash
npm start
```

1. Open <http://localhost:3000> in your browser

## 🧪 Testing

This project uses Mocha with ESM. Run tests with:

```bash
npm test         # Run TypeScript tests
npm run test:js  # Run JavaScript tests (legacy)
```

Tests live under `tests/` and cover utilities:

- `utils/dateUtils` – date helpers
- `utils/statsUtils` – statistics helpers
- `utils/textUtils` – text processing helpers
- `utils/stopWords` – stop words filtering
- `utils/dataProcessor` – chat data processing
- `public/js/charts/colorScheme` – chart color schemes
- `public/js/theme` – theme management
- `public/js/utils/themeUtils` – theme utilities

If you add new utilities, create corresponding `*.test.ts` files under `tests/`.

## 💻 Development

### TypeScript

The project uses TypeScript with strict type checking:

```bash
# Type check
npm run typecheck

# Type check server
npm run typecheck:server

# Type check client
npm run typecheck:client
```

TypeScript configuration:

- `tsconfig.json` - IDE configuration
- `tsconfig.server.json` - Node.js server config
- `tsconfig.client.json` - Browser code config

Shared types are in `types/`:

- `chat.ts` - message and chat types
- `stats.ts` - statistics types
- `date.ts` - date types
- `ui.ts` - UI component types

### Code Quality

```bash
# Lint
npm run lint

# Auto-fix
npm run lint:fix

# Format with Prettier
npm run format
```

### Module Structure

- All modules use ES6+ import/export with TypeScript
- Client modules are organized by feature
- Server utilities are isolated and easy to test
- Each module has a clear responsibility
- Shared types are in `types/` directory

### TypeScript Conventions

When contributing, follow these rules:

1. **Avoid `any`** - use `unknown` where needed
2. **Explicit return types** - specify return type for functions
3. **Interfaces for objects** - create interfaces in `types/`
4. **Strict null checks** - always check nullable values
5. **Literal types** - use `as const` for constants

## 📖 How to use

1. Export your data from TikTok:
   - Open TikTok on your mobile device
   - Go to Settings → Account → Download your data
   - Select only Messages to download
   - Choose JSON as the export format
   - Wait until your data is ready for download

2. Use the app:
   - Upload the resulting JSON file via the form on the main page
   - Pick a user from the list on the left
   - Explore your conversation statistics

## 🧩 Project Structure

```text
├── public/                    # Client
│   ├── css/
│   │   └── style.css         # Main styles
│   ├── js/
│   │   ├── charts/           # Chart modules
│   │   │   ├── authorChart.ts       # Author distribution chart
│   │   │   ├── colorScheme.ts       # Color schemes
│   │   │   ├── dateChart.ts         # Activity by date
│   │   │   ├── pairsChart.ts        # Frequent bigrams chart
│   │   │   ├── timeOfDayChart.ts    # Activity by time of day
│   │   │   ├── weekdayChart.ts      # Activity by weekday
│   │   │   └── wordsChart.ts        # Frequent words chart
│   │   ├── ui/               # UI modules
│   │   │   ├── statsView.ts         # Statistics view
│   │   │   └── userList.ts          # User list
│   │   ├── utils/            # Client utilities
│   │   │   └── themeUtils.ts        # Theme utilities
│   │   ├── api.ts            # Server API
│   │   ├── charts.ts         # Charts orchestrator
│   │   ├── config.ts         # App config
│   │   ├── main.ts           # App entry point
│   │   ├── theme.ts          # Theme management
│   │   └── uploader.ts       # File upload & parsing
│   └── index.html            # Main page
├── types/                    # Shared TypeScript types
│   ├── chat.ts               # Message and chat types
│   ├── date.ts               # Date types
│   ├── stats.ts              # Statistics types
│   ├── ui.ts                 # UI component types
│   └── index.ts              # Re-export all types
├── utils/                    # Server utilities
│   ├── dataProcessor.ts      # Chat data processing
│   ├── dateUtils.ts          # Date helpers
│   ├── statsUtils.ts         # Statistics helpers
│   ├── stopWords.ts          # Stop words filtering
│   └── textUtils.ts          # Text processing
├── tests/                    # Tests
│   ├── colorScheme.test.ts
│   ├── dataProcessor.test.ts
│   ├── dateUtils.test.ts
│   ├── statsUtils.test.ts
│   ├── stopWords.test.ts
│   ├── textUtils.test.ts
│   ├── theme.test.ts
│   └── themeUtils.test.ts
├── dist/                     # Compiled code (gitignore)
│   ├── server/               # Server code
│   └── client/               # Client bundle
├── server.ts                 # Express server
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # Main TypeScript config
├── tsconfig.server.json      # Server TypeScript config
├── tsconfig.client.json      # Client TypeScript config
├── package.json              # Dependencies & scripts
├── eslint.config.js          # ESLint config
└── README.md                 # Documentation
```

## 🏗 Architecture

The project follows a modular architecture with clear separation of concerns.

### Frontend (TypeScript + Vite)

- **charts/** – specialized modules for each chart type
- **ui/** – UI components
- **utils/** – client-side helpers
- **main.ts** – entry point that coordinates modules
- Vite provides hot-reload and optimized builds

### Backend (TypeScript + Node.js)

- **utils/** – server-side utilities for data processing
- **server.ts** – Express server with API endpoints
- tsx for running TypeScript directly

### Types (Shared types)

- **types/** – interfaces and types used on server and client
- Strict typing with `strict: true`

### Testing

- Extensive tests for all utilities
- ESM support in tests
- Separate tests for client and server components
