# Project Sprint Plan

This document outlines the sprint plan for the project, focusing on a phased development approach starting with login, then staff/admin dashboard, followed by influencer and brand functionalities. Key technical considerations include no scroll bounce, blob storage for image hosting, and a highly organized project folder structure.

## Core Principles & Considerations
*   **No Scroll Bounce:** Implement solutions to prevent scroll bouncing effects on all relevant views and platforms.
*   **Blob Storage for Images:** All user-uploaded images and potentially other static assets will be hosted using a blob storage service (e.g., AWS S3, Azure Blob Storage, Google Cloud Storage).
*   **Organized Project Folder:** Maintain a clear, scalable, and well-documented folder structure.
*   **Agile Methodology:** Sprints are indicative; duration can be adjusted (typically 2 weeks). Regular agile ceremonies (stand-ups, planning, reviews, retrospectives) are assumed.
*   **Testing:** Comprehensive testing (unit, integration, E2E) is crucial throughout.
*   **Documentation:** Ongoing documentation for APIs, architecture, and user guides.

## Suggested Project Folder Structure

A well-organized folder structure is key. Here's a proposed high-level structure:

```
/project-root
├── .git/
├── .github/              # CI/CD workflows, issue templates
│   └── workflows/
├── .vscode/              # VSCode specific settings (optional)
├── backend/              # Backend application
│   ├── src/
│   │   ├── api/          # API route definitions (e.g., v1/, v2/)
│   │   ├── config/       # Configuration files (db, secrets, env parsing)
│   │   ├── controllers/  # Request/response handlers
│   │   ├── services/     # Business logic, blob storage interactions
│   │   ├── models/       # Database schemas/models
│   │   ├── middleware/   # Auth, error handling, validation
│   │   ├── utils/        # Common utilities
│   │   └── app.js        # Main application entry point
│   ├── tests/            # Backend tests (unit, integration)
│   ├── package.json      # Or requirements.txt, pom.xml, etc.
│   └── Dockerfile        # (Optional)
├── frontend/             # Frontend application
│   ├── public/           # Static assets served directly
│   ├── src/
│   │   ├── assets/       # Images, fonts, global styles
│   │   ├── components/   # Reusable UI components (common, layout)
│   │   ├── features/     # Feature-specific modules (auth, admin, influencer, brand)
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   └── ... (other features)
│   │   ├── hooks/        # Custom React hooks (if applicable)
│   │   ├── pages/        # Top-level page components (if not using feature-based routing entirely)
│   │   ├── services/     # API service clients, state management integration
│   │   ├── store/        # Global state management (Redux, Zustand, Vuex)
│   │   ├── routes/       # Routing configuration
│   │   ├── utils/        # Frontend utilities
│   │   └── App.jsx       # Main frontend application component
│   │   └── index.js      # Entry point
│   ├── tests/            # Frontend tests (unit, e2e)
│   ├── package.json
│   └── Dockerfile        # (Optional)
├── docs/                 # Project documentation
│   ├── api/              # API specifications (OpenAPI/Swagger)
│   ├── design/           # UI/UX wireframes, mockups
│   └── architecture.md   # System architecture overview
├── scripts/              # Utility scripts (deployment, db migration, seeds)
├── .env.example          # Example environment variables
├── .gitignore
├── LICENSE
└── README.md             # Project overview, setup, run instructions
```

---

## Sprint Breakdown

### Sprint 0: Project Setup & Foundation (Discovery & Design)
*   **Goal:** Define detailed requirements, choose technology stack, set up project structure, design core UI/UX.
*   **Tasks:**
    *   **Project Initialization:**
        *   [X] Setup version control (Git repository, branching strategy).
        *   [X] Finalize and document project folder structure.
        *   [X] Choose and setup frontend framework (Next.js 15).
        *   [X] Choose and setup backend framework (Next.js API Routes).
        *   [X] Choose database (Neon - PostgreSQL).
        *   [ ] Setup basic CI/CD pipeline *(Planned: Vercel integration with Git)*.
    *   **Requirements Gathering & Analysis:**
        *   [ ] Detailed user stories and acceptance criteria for Login & Registration (standard, OAuth, MFA considerations).
        *   [ ] Detailed user stories for Staff/Admin Dashboard (user management, content moderation, analytics overview).
        *   [ ] Initial user stories for Influencer module (profile, campaign discovery).
        *   [ ] Initial user stories for Brand module (profile, campaign creation).
    *   **API Design (Initial):**
        *   [ ] Define core API endpoints for Authentication, User Management.
        *   [ ] Outline API strategy for image uploads integrating with Blob storage.
    *   **UI/UX Design (High-level):**
        *   [ ] Wireframes & mockups for Login/Registration pages.
        *   [ ] Wireframes for Admin Dashboard layout and key sections.
        *   [ ] Initial wireframes for Influencer and Brand core flows.
        *   [ ] Plan a basic design system/component library.
    *   **Technical Research:**
        *   [X] Select Blob storage provider (Vercel Blob) and corresponding SDKs/libraries.
        *   [ ] Research and document specific techniques for disabling scroll bounce across target browsers/devices.
    *   **Documentation:**
        *   [X] Create `README.md` with project overview, tech stack, setup instructions.
        *   [X] Initialize `docs/` folder with design documents, API spec stubs.
        *   [X] Created `frontend/.env.example`.

### Sprint 1: Authentication & Core User Management
*   **Goal:** Implement secure login, registration, and basic user profile management.
*   **Tasks:**
    *   **Backend:**
        *   Implement user registration API (with password hashing).
        *   Implement user login API (JWT/session management).
        *   Implement "Forgot Password" API (token generation, email sending).
        *   Implement basic user profile management API (view/update own profile).
        *   Database schema for users, roles, tokens.
        *   Integrate email service for account verification and password resets.
    *   **Frontend:**
        *   Implement Registration page UI and form handling.
        *   Implement Login page UI and form handling.
        *   Implement "Forgot Password" and "Reset Password" pages UI.
        *   Implement authenticated routes and route guards.
        *   Implement user profile page (view/edit basic info).
        *   Setup global state management for user session.
    *   **Image Handling (Profile Pictures):**
        *   Backend: Service/endpoint for uploading profile pictures to Blob storage.
        *   Frontend: Component for uploading profile pictures on the profile page.
    *   **Styling & UX:**
        *   Implement global styles, basic layout components (header, footer).
        *   Apply styles/logic to disable scroll bounce on initial views.
    *   **Testing:**
        *   Unit tests for authentication logic (backend: services, controllers).
        *   Unit tests for critical UI components (frontend: login form, registration form).
        *   Integration tests for registration and login flows.
    *   **Documentation:**
        *   Update API documentation for auth and user endpoints.

### Sprint 2: Staff/Admin Dashboard - Phase 1 (Core Functionality)
*   **Goal:** Develop the basic structure and core user management features of the Staff/Admin dashboard.
*   **Tasks:**
    *   **Backend:**
        *   Implement Role-Based Access Control (RBAC) middleware and decorators.
        *   Define `Admin` and `Staff` roles with initial permissions.
        *   API endpoints for admin to list all users (with pagination, basic search/filter).
        *   API endpoints for admin to view a specific user's details.
        *   API endpoints for admin to manage user roles/status (activate/deactivate, assign roles).
    *   **Frontend:**
        *   Implement Admin Dashboard layout (sidebar navigation, header, content area).
        *   Implement User Management table/list view (display users, sorting, actions).
        *   Implement UI for admin to view user details.
        *   Implement UI for admin to modify user status/roles.
        *   Secure admin routes using RBAC.
    *   **Testing:**
        *   Unit/Integration tests for RBAC implementation.
        *   Unit tests for admin dashboard components (user table, detail views).
        *   E2E tests for admin login and user listing.
    *   **Documentation:**
        *   Document admin-specific APIs and RBAC model.
        *   User guide notes for admin functionalities.

### Sprint 3: Staff/Admin Dashboard - Phase 2 (Advanced Features & Content Management)
*   **Goal:** Add more advanced features to the Admin Dashboard like content moderation and basic analytics.
*   **Tasks:**
    *   **Backend:**
        *   API endpoints for content moderation (e.g., viewing reported content, flagging/approving content from influencers/brands).
        *   API endpoints for system settings management (if any configurable by admin).
        *   API for basic platform analytics (e.g., user sign-up trends, active users).
        *   Implement audit logging for critical admin actions.
    *   **Frontend:**
        *   UI for content moderation tools (listing reported items, actions).
        *   UI for managing basic system settings.
        *   Display basic analytics/reports on the admin dashboard.
        *   UI for viewing audit logs (if time permits, otherwise basic access).
    *   **Testing:**
        *   Unit/Integration tests for new admin features.
        *   E2E tests for key admin workflows (e.g., content moderation).
    *   **Documentation:**
        *   Update documentation for new admin features and APIs.

---
*(Decision Point: Influencer or Brand module next. Plan proceeds with Influencer first, then Brand, as per user preference.)*

### Sprint 4: Influencer Module - Phase 1 (Profile & Onboarding)
*   **Goal:** Allow influencers to sign up (or convert existing user accounts), complete detailed profiles, and access a basic influencer dashboard.
*   **Tasks:**
    *   **Backend:**
        *   Extend user model or create Influencer-specific profile model (fields: niche, social media links, audience demographics, rates, portfolio links, etc.).
        *   API for influencers to create/update their detailed profile.
        *   API for influencers to upload portfolio items (images, videos - to Blob storage, link to external if large).
    *   **Frontend:**
        *   Influencer onboarding flow (potentially part of registration or a post-login setup).
        *   Influencer profile creation/editing form (multi-step if complex).
        *   Influencer dashboard landing page (basic layout, key stats/navigation).
        *   Public view (optional) or internal view of influencer profile.
        *   Component for managing/displaying portfolio items (with uploads to Blob via backend).
    *   **Image Handling:**
        *   Robust implementation for portfolio image/video uploads by influencers, linking to their profiles.
    *   **Testing:**
        *   Unit tests for influencer profile logic (backend and frontend).
        *   Integration tests for influencer profile creation/update.
    *   **Documentation:**
        *   Document influencer-specific APIs and profile data structure.

### Sprint 5: Influencer Module - Phase 2 (Campaign Discovery & Basic Management)
*   **Goal:** Allow influencers to discover campaigns posted by brands and manage their applications.
*   **Tasks:**
    *   **Backend:**
        *   Data model for Campaigns (to be created by Brands in later sprints).
        *   API for influencers to list/search/filter available campaigns (based on niche, platform, etc.).
        *   API for influencers to view campaign details.
        *   API for influencers to apply for campaigns.
        *   API for influencers to view their campaign applications (status: pending, accepted, rejected).
        *   API for influencers to view their active/past campaign participations.
    *   **Frontend:**
        *   UI to list/browse campaigns (card view, list view, search, filters).
        *   UI for campaign details modal/page.
        *   UI for influencers to submit applications to campaigns (e.g., with a cover note).
        *   UI for influencers to track their campaign applications and active collaborations.
    *   **Testing:**
        *   Unit tests for campaign listing/application components.
        *   Integration tests for influencer campaign application flow.
    *   **Documentation:**
        *   Update API documentation relevant to influencer campaign interactions.

### Sprint 6: Brand Module - Phase 1 (Profile & Onboarding)
*   **Goal:** Allow brands to sign up (or convert accounts), complete their company profiles.
*   **Tasks:**
    *   **Backend:**
        *   Extend user model or create Brand-specific profile model (fields: company name, industry, website, logo, contact info).
        *   API for brands to create/update their profile.
        *   API for brands to upload company logo (to Blob storage).
    *   **Frontend:**
        *   Brand onboarding flow.
        *   Brand profile creation/editing form.
        *   Brand dashboard landing page (basic layout, key stats/navigation).
        *   Component for brand logo upload and display.
    *   **Image Handling:**
        *   Implementation for brand logo uploads to Blob storage.
    *   **Testing:**
        *   Unit tests for brand profile logic.
        *   Integration tests for brand profile creation/update.
    *   **Documentation:**
        *   Document brand-specific APIs and profile data structure.

### Sprint 7: Brand Module - Phase 2 (Campaign Creation & Management)
*   **Goal:** Allow brands to create new campaigns and manage influencer applications.
*   **Tasks:**
    *   **Backend:**
        *   API for brands to create new campaigns (details: name, description, goals, target influencer criteria, deliverables, budget range, timeline).
        *   API for brands to manage their created campaigns (view list, edit, publish/unpublish, archive).
        *   API for brands to view applications from influencers for their campaigns (including influencer profiles).
        *   API for brands to accept/reject influencer applications.
        *   API to associate accepted influencers with a campaign.
    *   **Frontend:**
        *   UI for campaign creation form (detailed, potentially multi-step).
        *   UI for brands to list/manage their campaigns (drafts, active, completed).
        *   UI for brands to view influencer applications for a specific campaign (applicant list, profile preview).
        *   UI for brands to accept/reject applications, perhaps send a message.
    *   **Testing:**
        *   Unit tests for campaign creation/management components.
        *   Integration tests for brand campaign creation and influencer selection flow.
    *   **Documentation:**
        *   Update API documentation for campaign management by brands.

### Sprint 8: Core Interaction Loop (Collaboration & Deliverables)
*   **Goal:** Enable the primary interaction: brands hire influencers, influencers submit work, brands review.
*   **Tasks:**
    *   **Backend:**
        *   API for managing campaign "contracts" or agreements (formalizing the collaboration).
        *   API for influencers to submit deliverables for an active campaign (e.g., links to posts, files uploaded to Blob storage).
        *   API for brands to review submitted deliverables, approve, or request revisions.
        *   Notification system (in-app, email) for key events: campaign application status changes, new messages, deliverable submissions, deliverable approvals/rejections.
    *   **Frontend:**
        *   Dedicated "Collaboration Space" or "Active Campaign" view for both brand and influencer.
        *   UI for influencers to submit deliverables (form with text fields, file uploads).
        *   UI for brands to view submitted deliverables, provide feedback, approve, or request changes.
        *   Basic in-app messaging or commenting system within a campaign collaboration context.
        *   Display notifications to users.
    *   **Image/File Handling:**
        *   Ensure robust handling of various deliverable types uploaded by influencers.
    *   **Testing:**
        *   E2E tests for the full campaign lifecycle (creation -> application -> hiring -> deliverables -> review -> completion).
    *   **Documentation:**
        *   Document new APIs for collaboration, deliverables, and notifications.

### Sprint 9: Advanced Features, Polish & Optimization
*   **Goal:** Add advanced features like enhanced search, payment integration scaffolding, analytics, and polish the overall user experience.
*   **Tasks:**
    *   **Search & Discovery:**
        *   Backend/Frontend: Advanced search for influencers (for brands - filters: niche, audience size, engagement, location, rates).
        *   Backend/Frontend: Advanced search for campaigns (for influencers - filters: platform, budget, industry).
    *   **Payments Integration (Scaffolding):**
        *   Backend: Research and design payment flow (e.g., Stripe Connect, PayPal). Scaffold API endpoints for initiating payments, tracking status. No full implementation yet.
        *   Frontend: Basic UI elements for payment information (influencer bank details, brand payment methods) - data not yet processed.
    *   **Analytics/Reporting:**
        *   Backend/Frontend: More detailed analytics for brands (campaign ROI metrics, influencer performance).
        *   Backend/Frontend: More detailed analytics for influencers (earnings, campaign history, engagement on platform).
    *   **User Experience Polish:**
        *   Review all user flows for clarity and ease of use.
        *   Improve UI consistency and aesthetics.
        *   Ensure responsiveness across devices.
        *   Address any lingering scroll bounce issues.
    *   **Performance Optimization:**
        *   Identify and address backend API response time bottlenecks.
        *   Optimize frontend rendering performance, bundle sizes.
    *   **Security Hardening:**
        *   Conduct a security review (common vulnerabilities like XSS, CSRF, SQLi).
        *   Implement security best practices (e.g., rate limiting, input validation).
    *   **Testing:**
        *   Performance testing for key APIs and frontend interactions.
        *   Basic security vulnerability scans.
    *   **Documentation:**
        *   Finalize all user guides and developer documentation.

### Sprint 10: User Acceptance Testing (UAT), Bug Fixing & Deployment Preparation
*   **Goal:** Conduct thorough UAT, fix remaining bugs, and prepare the application for production deployment.
*   **Tasks:**
    *   **UAT:**
        *   Prepare UAT plan and test cases.
        *   Conduct UAT sessions with representative users (admins, influencers, brands).
        *   Gather and prioritize feedback.
    *   **Bug Fixing:**
        *   Address all critical and high-priority bugs identified during UAT and previous testing phases.
    *   **Deployment Preparation:**
        *   Finalize production environment configuration (servers, database, blob storage, ENV variables).
        *   Create and test deployment scripts/CI-CD pipeline for production.
        *   Data migration strategy (if applicable).
        *   Backup and rollback plan.
    *   **Final Code Freeze:** No new features, only critical bug fixes.
    *   **Marketing/Launch Preparations:** Coordinate with marketing for launch activities.
    *   **Legal/Compliance:** Final review of terms of service, privacy policy.

---

This sprint plan provides a roadmap. Flexibility will be needed to adapt to challenges and new insights as the project progresses. Regular communication and stakeholder feedback will be vital for success. 