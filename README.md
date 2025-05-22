# Project Title (To Be Defined)

## Overview

[Brief description of the project, its purpose, and target users.]

This project is an influencer marketing platform connecting brands with influencers. It will feature user authentication, separate dashboards for staff/admins, influencers, and brands, campaign management, and image hosting using blob storage.

## Tech Stack

*   **Framework:** Next.js 15 (App Router, Server Components)
*   **Hosting:** Vercel (Frontend, API Routes, Image Blob Storage)
*   **Styling:** TailwindCSS 3.4
*   **UI Components:** shadcn/ui
*   **Animation:** Framer Motion
*   **Database:** Neon (PostgreSQL)
*   **Authentication:** Clerk
*   **Primary API Layer:** Next.js API Routes
*   **External API Integrations:**
    *   Modash API (Influencer Discovery & Data)
    *   OpenAI API (AI Suggestions)
*   **Image Hosting:** Vercel Blob (serving WebP)

## Project Structure

(Refer to `sprint_plan.md` for the detailed initial project folder structure. Note: The `frontend` directory will house the unified Next.js 15 application, including API routes.)

```
/project-root
├── .git/
├── .github/              # CI/CD workflows, issue templates
├── backend/              # Backend application
├── frontend/             # Frontend application
├── docs/                 # Project documentation
├── scripts/              # Utility scripts
├── .env.example          # Example environment variables
├── .gitignore
├── LICENSE
├── README.md             # This file
└── sprint_plan.md        # Detailed sprint plan
```

## Getting Started

### Prerequisites

*   Node.js (latest LTS version recommended, compatible with Next.js 15)
*   npm or yarn or pnpm
*   Git

### Setup

1.  Clone the repository:
    ```bash
    git clone [repository-url]
    cd [project-folder]
    ```
2.  Application Setup (Frontend & API Routes):
    ```bash
    cd frontend
    # Instructions for installing dependencies (e.g., npm install or yarn install)
    # Instructions for setting up .env.local file from .env.example (for Clerk, Neon, Modash, OpenAI keys)
    ```
3.  Database Setup:
    *   Set up a Neon PostgreSQL database.
    *   Add connection details to the environment variables.

### Running the Application

*   **Development Server (Frontend & API):**
    ```bash
    cd frontend
    npm run dev  # or yarn dev / pnpm dev
    ```

Access the application at `http://localhost:3000` (default Next.js port).

## Sprint Plan

Refer to `sprint_plan.md` for the detailed development sprints and tasks.

## Contributing

[Guidelines for contributing to the project, if applicable. E.g., branching strategy, pull request process.]

## License

This project is licensed under the [Your License Name] License - see the `LICENSE` file for details.
