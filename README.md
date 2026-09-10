# CampusFlow 🎓📱

> A modern, full-stack campus issue reporting and infrastructure management system built with **React Native (Expo)**, **Node.js**, **Express**, and **MongoDB**.

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

## 📌 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
  - [Student & General Users](#1-student--general-users)
  - [Support Desk Team](#2-support-desk-team)
  - [Campus Administration](#3-campus-administration)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Mobile App Setup](#2-mobile-app-setup)
- [Environment Variables](#-environment-variables)
- [Building for Production (EAS)](#-building-for-production-eas)
- [License](#-license)

---

## 📖 Overview

**CampusFlow** bridges the gap between campus residents (students, faculty, and staff) and campus maintenance teams. Whether it's an electrical breakdown, plumbing issue, Wi-Fi outage, or broken furniture, students can snap a picture, automatically tag their live GPS location, and submit an issue in seconds.

The platform includes dedicated dashboards for **Support Staff** to manage work orders, update ticket statuses, and provide resolution notes, as well as a centralized **Admin Console** for university executives to monitor resolution KPIs and manage team roles.

---

## ✨ Key Features

### 1. Student & General Users
* **One-Tap Issue Reporting**: Submit tickets with categories (Electricity, Wi-Fi, Water/Plumbing, Cleanliness, Labs, Furniture, etc.), priority flags (Low, Medium, High), and detailed notes.
* **Camera & Photo Picker**: Capture live photos or upload images from gallery showing the exact problem.
* **Live GPS Location Pinning**: Automatically embeds real-time campus coordinates and address for technician navigation.
* **My Reports Tracking**: Real-time tracking of personal reports across lifecycle states (`Pending` ➔ `In Progress` ➔ `Resolved`).
* **Public Campus Feed**: Browse community issues to avoid duplicate reports and stay informed on campus infrastructure work.
* **User Profiles**: Manage academic information including roll number, department, academic year, contact details, and avatar.

### 2. Support Desk Team
* **Dedicated Support Dashboard**: Dedicated queue view of active campus service tickets.
* **Filter & Search**: Filter issues by category, status, priority, or search keywords.
* **Ticket Assignment**: Assign tickets to specialized technicians or maintenance crew members.
* **Status Updates & Resolution Notes**: Mark tickets in-progress, record technician resolution comments, and transition tickets to resolved.

### 3. Campus Administration
* **Platform KPI Analytics**: Real-time stats on total reported issues, active/pending requests, resolution velocity, and user counts.
* **User & Role Management**: Search all registered campus users and elevate or modify roles (`User`, `Support`, `Admin`).
* **Master Ticket Governance**: Administrative override and master deletion for obsolete or duplicate tickets.

---

## 🔐 Role-Based Access Control (RBAC)

| Capability / Route | General User | Support Team | Administrator |
| :--- | :---: | :---: | :---: |
| Browse Campus Feed | ✅ | ✅ | ✅ |
| Report New Issue | ✅ | ✅ | ✅ |
| Track Personal Reports | ✅ | ✅ | ✅ |
| Access Support Desk Queue | ❌ | ✅ | ✅ |
| Assign Tickets & Add Resolution Notes | ❌ | ✅ | ✅ |
| View System KPI Analytics | ❌ | ❌ | ✅ |
| Manage User Roles & Permissions | ❌ | ❌ | ✅ |
| Master Delete Issues | ❌ | ❌ | ✅ |

---

## 🛠 Tech Stack

### Mobile Client (`CampusFlow`)
* **Framework**: React Native `0.81.5` with Expo SDK `54` (New Architecture enabled)
* **Routing**: Expo Router `v6` (File-based routing with Drawer and Bottom Tabs)
* **Navigation**: `@react-navigation/drawer`, `@react-navigation/bottom-tabs`
* **Device APIs**:
  * `expo-location` (Real-time GPS coordinate acquisition)
  * `expo-image-picker` & `expo-camera` (Photo capture & gallery picking)
  * `expo-secure-store` (Encrypted local storage for auth tokens)
* **Authentication**: Clerk Expo SDK (`@clerk/expo`) + Local JWT Auth
* **Styling & UI**: React Native StyleSheet, Lucide/Ionicons (`@expo/vector-icons`), Safe Area Context, Reanimated animations

### Backend API (`CampusFlow-Backend`)
* **Runtime**: Node.js (v18+)
* **Framework**: Express.js `5.x`
* **Database**: MongoDB Atlas with Mongoose `9.x`
* **Security & Auth**: JSON Web Tokens (`jsonwebtoken`), password hashing with `bcryptjs`, CORS protection
* **Deployment**: Render

---

## 🏗 System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    CampusFlow Mobile App                    │
│            (React Native / Expo SDK 54 / Expo Router)       │
├───────────────────┬───────────────────┬─────────────────────┤
│   General Users   │   Support Team    │    Administrator    │
│  - Report Issues  │  - Ticket Queue   │  - Analytics & KPIs │
│  - GPS & Photos   │  - Status Updates │  - Role Management  │
│  - Track Reports  │  - Assignees      │  - Ticket Control   │
└─────────┬─────────┴─────────┬─────────┴──────────┬──────────┘
          │                   │                    │
          └───────────────────┼────────────────────┘
                              │ HTTP REST / Bearer JWT
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  CampusFlow Express API                     │
│    (Node.js / Express 5 / JWT Auth / Role Middlewares)      │
├─────────────────────┬─────────────────────┬─────────────────┤
│   /api/auth         │   /api/issues       │  /api/admin     │
│   /api/user/issues  │   /api/support      │                 │
└─────────────────────┴──────────┬──────────┴─────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas Database                   │
│          Collections: Users  •  Issues  •  Sessions         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```text
reactnativeFullStack/
├── CampusFlow/                     # Frontend Expo Application
│   ├── app/                        # Expo Router file-based pages
│   │   ├── (drawer)/               # Main app drawer navigation
│   │   │   ├── (tabs)/             # Tab bar screens (Home, Issues, Report, Profile)
│   │   │   ├── admin/              # Admin Console screens
│   │   │   ├── support/            # Support Desk screens
│   │   │   ├── allIssues.jsx       # Public issues directory
│   │   │   ├── my-reports.jsx      # User report tracking
│   │   │   ├── notifications.jsx   # Notification center
│   │   │   └── settings.jsx        # Account settings
│   │   ├── login.jsx               # Authentication screen
│   │   ├── register.jsx            # Account registration screen
│   │   └── _layout.tsx             # Root layout & providers
│   ├── components/                 # Reusable UI components
│   ├── context/
│   │   └── AuthContext.jsx         # Global Auth & Role State
│   ├── services/
│   │   └── api.jsx                 # API clients & fetch handlers
│   ├── app.json                    # Expo & EAS configuration
│   └── package.json
│
├── CampusFlow-Backend/             # Node.js & Express REST Backend
│   ├── server.js                   # Express application entrypoint
│   └── src/
│       ├── config/
│       │   └── db.js               # MongoDB Mongoose connection
│       ├── controllers/
│       │   ├── authController.js   # Auth & profile operations
│       │   ├── issueController.js  # Core issue actions
│       │   ├── admin/              # Admin-specific logic
│       │   ├── support/            # Support-desk ticket handlers
│       │   └── user/               # User issue queries
│       ├── middlewares/
│       │   └── authMiddleware.js   # JWT protect & role guards
│       ├── models/
│       │   ├── Issue.js            # Issue MongoDB schema
│       │   └── User.js             # User & RBAC MongoDB schema
│       └── routes/                 # Express route handlers
│           ├── authRoutes.js
│           ├── issueRoutes.js
│           ├── admin/adminRoutes.js
│           ├── support/supportRoutes.js
│           └── user/userIssueRoutes.js
│
└── README.md
```

---

## 📡 API Endpoints

### Authentication & Profile (`/api/auth`)
* `POST /api/auth/register` - Register a new campus user
* `POST /api/auth/login` - Authenticate user & issue JWT
* `POST /api/auth/google` - Google OAuth sign-in / registration
* `GET  /api/auth/me` - Fetch current user profile *(Protected)*
* `PUT  /api/auth/profile` - Update profile information *(Protected)*

### Issues (`/api/issues` & `/api/user/issues`)
* `GET  /api/issues` - Retrieve all public campus issues
* `GET  /api/issues/:id` - Retrieve specific issue details
* `POST /api/issues` - Report a new issue *(Protected)*
* `GET  /api/user/issues/my` - Get logged-in user's submitted reports *(Protected)*

### Support Desk (`/api/support`) *(Requires Support or Admin role)*
* `GET   /api/support/tickets` - List support queue with filters (status, category, priority, search)
* `PATCH /api/support/tickets/:id/status` - Update ticket status & resolution comments
* `PATCH /api/support/tickets/:id/assign` - Assign ticket to support staff member

### Admin Console (`/api/admin`) *(Requires Admin role)*
* `GET    /api/admin/stats` - Platform KPIs & aggregated metrics
* `GET    /api/admin/users` - Search & list registered campus users
* `PATCH  /api/admin/users/:id/role` - Update user authorization role
* `DELETE /api/admin/issues/:id` - Permanent deletion of issue record

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or later recommended)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [Expo Go](https://expo.dev/go) app on your physical mobile device, or Android Studio / Xcode Simulator

---

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd CampusFlow-Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your `.env` file in `CampusFlow-Backend/`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The server will start at `http://localhost:5000`.

---

### 2. Mobile App Setup

1. Open a new terminal and navigate to the mobile app directory:
   ```bash
   cd CampusFlow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify the API base URL in `services/api.jsx`:
   * For local testing on an Android emulator: `http://10.0.2.2:5000/api`
   * For local testing on iOS simulator: `http://localhost:5000/api`
   * For a physical device on your local Wi-Fi: `http://YOUR_LOCAL_IP:5000/api`
   * For cloud deployment: `https://your-production-backend.com/api`

4. Start the Expo development server:
   ```bash
   npx expo start
   ```

5. Scan the QR code using:
   * **Android**: Expo Go app
   * **iOS**: Camera app (redirecting to Expo Go)

---

## ⚙️ Environment Variables

### Backend (`CampusFlow-Backend/.env`)
| Variable | Description |
| :--- | :--- |
| `PORT` | Port number the Express server listens on (default: `5000`) |
| `NODE_ENV` | Environment mode (`development` or `production`) |
| `MONGO_URI` | MongoDB Atlas / local MongoDB connection string |
| `JWT_SECRET` | Secret key used for signing and verifying JWT tokens |

### Mobile App (`CampusFlow/.env.local`)
| Variable | Description |
| :--- | :--- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key for Google OAuth & user management |
| `CLERK_SECRET_KEY` | Clerk Secret Key for secure operations |

---

## 📦 Building for Production (EAS)

CampusFlow is configured with EAS (Expo Application Services) for automated Android and iOS builds.

1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```

2. Log in to your Expo account:
   ```bash
   eas login
   ```

3. Build an Android APK for testing:
   ```bash
   eas build -p android --profile preview
   ```

4. Build production bundles:
   ```bash
   eas build --platform all
   ```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).