# PB-Next

```
npx @next/codemod@canary upgrade latest
```

# Pocketbase

```
cd pocketbase
go mod tidy

go build ./examples/base
./base superuser upsert admin@example.com admin@example.com

./base serve
// ./base serve --http="0.0.0.0:8091"

./base --dev serve


./base superuser upsert lavren1974@gmail.com 1234567890



`admin@example.com:admin@example.com`

http://127.0.0.1:8090
├─ REST API:  http://127.0.0.1:8090/api/
└─ Dashboard: http://127.0.0.1:8090/_/



A modern authentication system built with Next.js App Router and PocketBase, featuring multi-language support, theme switching, and a clean, responsive UI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PocketBase](https://img.shields.io/badge/PocketBase-latest-blue)

## Features

- 🔐 **Secure Authentication System**
  - User registration with email verification (in development)
  - Login with email and password
  - Password reset functionality (in development)
  - Protected routes and middleware
  - Session management

- 🌐 **Internationalization (i18n)**
  - Multi-language support (English, Spanish, French, German, Russian)
  - Language detection and switching
  - SEO-friendly URL structure with language prefixes (in development)

- 🎨 **Modern UI/UX**
  - Dark/Light theme switching
  - Responsive design
  - Clean and intuitive interface
  - Loading states and error handling
  - Interactive components

- ⚡ **Technical Features**
  - Next.js 15 App Router
  - TypeScript for type safety
  - Server and Client Components
  - Server Actions for form handling
  - PocketBase as backend database
  - Tailwind CSS for styling

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (v18 or later)
- PocketBase server
- Git

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/your-username/pb-next.git
cd pb-next
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
# Create a .env.local file and add:
NEXT_PUBLIC_POCKETBASE_URL=http://your-pocketbase-url:8090
```

4. Start PocketBase server:
```bash
./pocketbase serve
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
pb-next/
├── app/                    # Next.js App Router
│   ├── [lng]/             # Language-specific routes
│   │   ├── (auth)/        # Protected routes
│   │   ├── (public)/      # Public routes
│   │   └── layout.tsx     # Root layout
│   └── i18n/              # Internationalization setup
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── providers/        # Context providers
├── lib/                  # Utility functions and configurations
│   ├── actions/          # Server actions
│   └── pocketbase/       # PocketBase client setup
└── public/               # Static files
```

## Authentication Flow

1. **Registration**:
   - User submits registration form
   - Server validates input and checks for existing users
   - Creates new user in PocketBase
   - Automatically logs in the user
   - Redirects to dashboard

2. **Login**:
   - User submits login credentials
   - Server authenticates with PocketBase
   - Creates session and sets cookies
   - Redirects to dashboard or requested page

3. **Protected Routes**:
   - Middleware checks for valid session
   - Redirects to login if session is invalid
   - Maintains language preference

## Internationalization

The project uses i18next for translations. Add new languages in `app/i18n/settings.ts`:

```typescript
export const languages = ['en', 'es', 'fr', 'de', 'ru']
```

Translation files are located in `app/i18n/locales/[language]/`.

<!-- ## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request -->

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [PocketBase](https://pocketbase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [i18next](https://www.i18next.com/)

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Support the Project
This project is free and open-source. If you find it useful, you can support it with a voluntary donation:

- **Bitcoin (BTC)**: `bc1q4ye0nvx4z4gpr5lv7dut3hyu96m6dcvcpqqnj7`
- **Monero (XMR)**: `48aN8ABaA5fXdniA5gbRbeQYGg2mLaXUVVT8bZoS19uVbd6oC8GxRS83RzRkGwUuyTJu6Sb8gazLGBzgTJrwVuHcJFAv81e`

