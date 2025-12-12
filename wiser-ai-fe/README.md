# WiserAi Frontend

This is the frontend application for WiserAi, built with [Next.js](https://nextjs.org/) and [Material UI](https://mui.com/).

## Requirements

- Node.js 20+
- npm

## Getting Started

First, install dependencies:

```bash
yarn install
```

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
    - `layout.tsx`: Root layout with ThemeRegistry.
    - `page.tsx`: Landing Page.
    - `career-plan/`: Career Plan feature.
    - `admin/`: Admin modules (Courses, Users, Master Data).
- `components/`: Reusable components.
    - `layout/`: Sidebar and implementations.
    - `ThemeRegistry/`: MUI v6/v7 integration with Next.js App Router.
    - `ui/`: Generic UI components.

## Docker

Build and run using Docker:

```bash
docker build -t wiser-ai-fe .
docker run -p 3001:3001 wiser-ai-fe
```

Or usage via root `docker-compose` (see root directory).

## Features

- **Responsive Sidebar**: Collapsible menu with Admin/User mode.
- **Career Plan**: Tabs for Profile, Skills, and Growth Map (ChatGPT Integration).
- **Admin**: Master Data, User Management, Course Creation.
