
# HN-PB-Next: Modern Hacker News Reader

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

[English](README.md) | [Русский](README_ru.md)

**HN-PB-Next** is a modern, high-performance web application that serves as a Reader for Hacker News with personal "Favorites" functionality. It demonstrates a powerful, lightweight architecture using **Next.js 16** (App Router) for the full-stack frontend and **PocketBase** for authentication and data storage.

## 🚀 Features

*   **Real-time Feed**: Browse the latest top stories from Hacker News (via Algolia API).
*   **Auto-Refresh**: Usage of a client-component to keep the feed fresh every 30 seconds.
*   **Personal Favorites**: Save stories to your personal collection (requires login).
*   **Deferred / Read Later**: Save stories to read later (requires login).
*   **Authentication**: Secure user registration and login powered by PocketBase.
*   **Modern UI**: Built with Tailwind CSS and daisyUI for a clean, responsive, and theme-able interface.
*   **Localization (i18n)**: Full support for English and Russian languages.
*   **Pagination**: Smooth navigation through stories and favorites.

## 🛠 Tech Stack

*   **Frontend**: Next.js 16, React 19, TypeScript
*   **Backend / Auth**: PocketBase (v0.22+)
*   **Styling**: Tailwind CSS, daisyUI
*   **Icons**: Lucide React
*   **Localization**: i18next

## 📦 Getting Started

### Prerequisites

*   Node.js 20+
*   pnpm (recommended) or npm
*   PocketBase executable

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/lavren1974/HN-PB-Next.git
    cd HN-PB-Next
    ```

2.  **Setup PocketBase:**
    *   Download PocketBase and place `pocketbase.exe` (or binary) in the project root or a `/backend` folder.
    *   Run PocketBase:
        ```bash
        ./pocketbase serve
        ```
    *   Go to `http://127.0.0.1:8090/_/` and create your admin account.
    *   Import the schema from `data/favorites_schema.json` and `data/deferred_schema.json` (if not done automatically, create `favorites` and `deferred` collections manually or via the import tool).

3.  **Setup Frontend:**
    *   Navigate to the web directory:
        ```bash
        cd web
        ```
    *   Install dependencies:
        ```bash
        pnpm install
        ```
    *   Create a `.env` file based on `.env.example` (ensure `NEXT_PUBLIC_POCKETBASE_URL` is set).

4.  **Run Development Server:**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📸 Screenshots

*(Add screenshots here)*

## 📄 License

This project is licensed under the MIT License.
