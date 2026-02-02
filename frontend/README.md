# Frontend

This folder contains the client-side application built with **Next.js 15**, **TypeScript**, and **TailwindCSS**.
The frontend communicates with the backend API (Node.js + Express + Prisma) to provide a full-stack project & task management app.

## Structure

- `src/app/` – Next.js app router (pages, layouts, routing)
- `src/components/` – Reusable UI components (Button, Input, Loading, etc.)
- `src/utils/` – API helpers, error mappers, and utility functions
- `src/hooks/` – Custom React hooks
- `public/` – Static assets (images, icons, logos)
- `e2e/` – End-to-end tests with Playwright

## Getting Started

Install dependencies and start development server:

npm install
npm run dev

The app runs by default on:
http://localhost:3001

## Environment Variables

Create .env.local based on .env.example:

NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
This value must point to your backend API.

## Features

### Authentication

- Register and login using backend API
- Access token and refresh token stored in localStorage
- Protected routes check for valid access token

### Projects

- List, create, update, delete projects
- Each project displays tasks

### Tasks

- List, create, update, delete tasks
- Linked to projects
- Done/Pending status

### Error Handling

- API errors mapped to user-friendly messages
- Loading states and validation feedback
