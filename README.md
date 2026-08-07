# LibraryOS

[![Build status](https://github.com/chauhanabhishek72488-create/Library-Management-System/actions/workflows/ci.yml/badge.svg)](https://github.com/chauhanabhishek72488-create/Library-Management-System/actions/workflows/ci.yml)

A React + Vite library management system UI with features for books, members, issue/return management, reservations, notifications, and admin controls.

## Features

- Vite-powered React application using TypeScript
- Tailwind CSS styling with custom UI components
- Firebase integration support in `src/utils/firebase.ts`
- Library dashboard, issue/return, reservations, fines, and member management pages
- Admin reports and access control pages.

## Getting Started

```bash
npm install
npm run dev
```

Open the app at `http://localhost:4173`

## Available Scripts

- `npm run dev` — start the Vite development server
- `npm run build` — build the production bundle
- `npm run preview` — preview the production build locally

## Project structure

- `index.html` — app entry point
- `package.json` — dependencies and scripts
- `src/main.tsx` — application bootstrap
- `src/App.tsx` — root React component
- `src/styles/index.css` — global styles
- `src/features` — app feature pages and modules
- `src/components` — reusable UI components
- `src/utils` — helper utilities and Firebase setup

## Contributing

1. Fork the repo
2. Create a feature branch
3. Submit a pull request

## License

MIT
