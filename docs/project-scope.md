# Project Scope

## Overview

This project involves designing and developing a custom influencer dashboard platform for **Stride Social**, a UK-based influencer marketing and talent management agency. The dashboard will enable seamless management of influencer data, campaign execution, and brand collaboration. It integrates the **Modash Discovery API** for influencer analytics and uses a **custom OAuth-based system** to access real-time social media data from influencers — separate from the platform's login authentication.

---

## 🧾 Data Access & Modash Integration

The dashboard integrates with the **Modash Discovery API** to:

- Discover and search public influencer profiles
- Generate audience and engagement reports using Modash report credits
- Enrich the internal influencer database with verified metrics and demographics

> All real-time performance data shown to clients is sourced from **connected influencer accounts**, not direct raw API outputs.

---

## 🧑‍💼 Brand Portal (Stride Social Clients)

Brand users will access a secure, intuitive dashboard to:

- View real-time influencer analytics
- Filter influencers by:
  - Follower count
  - Engagement rate
  - Platform
  - Location
  - Niche/category
- Receive AI-powered influencer suggestions based on past campaign data
- Save influencer picks with notes and forward them to talent managers
- Track campaign participation and performance

---

## 👤 Influencer Portal

Influencers will access a dedicated portal for onboarding and campaign visibility:

- OAuth-based connection to Instagram, TikTok, and YouTube (for analytics sync)
- Encrypted form to submit payment details (PayPal, bank transfer)
- Dashboard views for:
  - Performance metrics (read-only)
  - Assigned campaigns and seeding status
  - Payment progress and history
  - Audience breakdown and engagement rates

---

## 🛠️ Admin Panel (Stride Social Internal Team)

Internal team members will manage and operate the full system through a robust admin panel:

- Full control over all users and roles (brands, influencers, managers)
- Add/edit influencer metadata and niche tags
- View, refresh, and manage OAuth token statuses
- Monitor influencer readiness and campaign participation
- Review saved picks and generate summary exports (PDF/email)
- System-level control of data, users, and integrations

---

## 📦 Campaign & Seeding Module

A dedicated campaign module supports full influencer collaboration management:

- Create campaigns and assign influencers (connected or imported)
- Track campaign stages:
  - Product sent
  - Content posted
  - Payment status
- Monitor influencer opt-in and consent statuses
- Integrate link tracking tools (e.g., Short.io, Bitly) for content validation

---

## 🧲 Internal Influencer Management & Scraping

The system provides tools to enrich and manage the internal influencer database:

- Use Modash API to manually or automatically import influencers
- Auto-tag influencers by:
  - Niche
  - Engagement tier
  - Platform
- Organize Partnered influencers for outreach or campaign consideration
- Track OAuth connection status and readiness for activation

---

## Technical Infrastructure

The platform uses a modern, scalable tech stack built for performance, security, and extensibility:

- **Frontend & Hosting**: Vercel  
  Serverless deployment with global CDN, CI/CD, and developer-friendly preview environments.

- **Database**: Neon (PostgreSQL)  
  Serverless PostgreSQL optimized for branching, scalability, and collaborative workflows.

- **Authentication**: Clerk  
  Email/password-based user authentication for brands, influencers, and admins.  
  Social media OAuth is used **only for influencer data sync**, not for login.

- **Influencer Analytics**: Modash Discovery API  
  For influencer discovery, audience data, and report generation.

- **AI Engine**: OpenAI API  
  Powers an AI-based recommendation system for influencer matching and scoring.

- **Access Control**: Role-based permissions  
  All components and data are gated by secure user roles (brands, influencers, admins).

---

## Success Criteria

- Brands can log in, filter, and shortlist influencers in under 5 minutes
- Influencers submit secure financial data in under 2 minutes
- Talent managers can review and send summaries with 1–2 clicks
- Admins oversee campaigns, approvals, and scraping in real-time
- 90%+ uptime with no critical bugs post-launch
- Professional visual and functional upgrade from previous spreadsheet workflows

---

## Timeline & Delivery

- **Development Duration**: 4–6 weeks
- **Post-launch Warranty**: 2 months for bug fixes and refinements
- **Deployment**: Fully hosted and configured for production usage



---

## Final Notes

This scope represents the full set of deliverables, responsibilities, and expectations agreed upon. Any work or features beyond this scope will require a formal change request and revised terms.

---

© 2025 MŌLYNKA x Stride Social 