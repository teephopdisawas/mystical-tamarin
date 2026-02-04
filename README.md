# Portal App

A modern, full-stack web application built with **Vue.js 3** and **Supabase**. This portal features multiple mini-apps including Notes, Gallery, Messaging, Calculator, and To-Do List functionality.

## Demo Screenshots

### Login Page
Clean and intuitive authentication interface with email/password login and signup functionality.

![Login Page](https://github.com/user-attachments/assets/38831b9b-2ca2-4c30-923c-a317e6392085)

### Calculator
A scientific calculator with support for multiple number bases (Decimal, Binary, Hexadecimal, Octal) and trigonometric functions.

![Calculator](https://github.com/user-attachments/assets/7ce869d5-dfe5-4728-b3a0-0002043483c1)

## Features

- 🔐 **Authentication** - Secure login/signup with Supabase Auth
- 📝 **Notes** - Create, edit, and delete personal notes
- 🖼️ **Gallery** - Upload and manage images with Supabase Storage
- 💬 **Messaging** - Real-time public chat with other users
- 🧮 **Calculator** - Scientific calculator with base conversion (DEC/BIN/HEX/OCT)
- ✅ **To-Do List** - Task management with due dates and completion tracking
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Language**: TypeScript
- **Router**: Vue Router
- **Icons**: Lucide Vue Next

## Getting Started

### Prerequisites

- Node.js 18+ or pnpm
- A Supabase project (for backend functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/teephopdisawas/mystical-tamarin.git
   cd mystical-tamarin
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:8080](http://localhost:8080) in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── assets/          # Global styles
├── components/      # Reusable Vue components
│   └── ui/          # UI component library
├── integrations/    # External service integrations
│   └── supabase/    # Supabase client configuration
├── lib/             # Utility functions
├── pages/           # Page components
├── router/          # Vue Router configuration
└── utils/           # Helper utilities
```

## License

MIT
