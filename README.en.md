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
npm test
```

Tests live under `tests/` and cover utilities:

- `utils/dateUtils.js` – date helpers
- `utils/statsUtils.js` – statistics helpers
- `utils/textUtils.js` – text processing helpers
- `utils/stopWords.js` – stop words filtering
- `utils/dataProcessor.js` – chat data processing
- `public/js/charts/colorScheme.js` – chart color schemes
- `public/js/theme.js` – theme management
- `public/js/utils/themeUtils.js` – theme utilities

If you add new utilities, create corresponding `*.test.js` files under `tests/`.

## 💻 Development

### Code Quality

```bash
# Lint
npm run lint

# Format with Prettier
npm run format
```

### Module Structure

- All modules use ES6 import/export
- Client modules are organized by feature
- Server utilities are isolated and easy to test
- Each module has a clear responsibility

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
│   │   │   ├── authorChart.js       # Author distribution chart
│   │   │   ├── colorScheme.js       # Color schemes
│   │   │   ├── dateChart.js         # Activity by date
│   │   │   ├── pairsChart.js        # Frequent bigrams chart
│   │   │   ├── timeOfDayChart.js    # Activity by time of day
│   │   │   ├── weekdayChart.js      # Activity by weekday
│   │   │   └── wordsChart.js        # Frequent words chart
│   │   ├── ui/               # UI modules
│   │   │   ├── statsView.js         # Statistics view
│   │   │   └── userList.js          # User list
│   │   ├── utils/            # Client utilities
│   │   │   └── themeUtils.js        # Theme utilities
│   │   ├── api.js            # Server API
│   │   ├── charts.js         # Charts orchestrator
│   │   ├── config.js         # App config
│   │   ├── main.js           # App entry point
│   │   ├── theme.js          # Theme management
│   │   └── uploader.js       # File upload & parsing
│   └── index.html            # Main page
├── utils/                    # Server utilities
│   ├── dataProcessor.js      # Chat data processing
│   ├── dateUtils.js          # Date helpers
│   ├── statsUtils.js         # Statistics helpers
│   ├── stopWords.js          # Stop words filtering
│   └── textUtils.js          # Text processing
├── tests/                    # Tests
│   ├── colorScheme.test.js
│   ├── dataProcessor.test.js
│   ├── dateUtils.test.js
│   ├── statsUtils.test.js
│   ├── stopWords.test.js
│   ├── textUtils.test.js
│   ├── theme.test.js
│   └── themeUtils.test.js
├── server.js                 # Express server
├── package.json              # Dependencies & scripts
├── eslint.config.js          # ESLint config
└── README.md                 # Documentation
```

## 🏗 Architecture

The project follows a modular architecture with clear separation of concerns.

### Frontend (ES6 modules)

- charts/ – specialized modules for each chart type
- ui/ – UI components
- utils/ – client-side helpers
- main.js – entry point that coordinates modules

### Backend

- utils/ – server-side utilities for data processing
- server.js – Express server with API endpoints

### Testing

- Extensive tests for all utilities
- ESM support in tests
- Separate tests for client and server components
