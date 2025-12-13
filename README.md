# WiserAi - Career Planning Platform

WiserAi là một nền tảng hỗ trợ lập kế hoạch nghề nghiệp với tích hợp ChatGPT, quản lý kỹ năng người dùng, và các công cụ quản trị dành cho admin.

## 📋 Mục lục

- [Deployment to Render.com](#deployment-to-rendercom) (New)
- [Tổng quan](#tổng-quan)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
  - [1. Setup Backend (wiser-ai-be)](#1-setup-backend-wiser-ai-be)
  - [2. Setup Frontend (wiser-ai-fe)](#2-setup-frontend-wiser-ai-fe)
  - [3. Chạy với Docker Compose](#3-chạy-với-docker-compose)
- [API Documentation](#api-documentation)
- [Tính năng chính](#tính-năng-chính)

---

## 🚀 Deployment to Render.com

This project includes a `render.yaml` file for automated deployment.

1.  **Push to GitHub**: Ensure this repository is on GitHub.
2.  **New Blueprint**: Go to [Render](https://render.com), click **New +** -> **Blueprint**, and select this repo.
3.  **Auto-Discovery**: Render will detect `wiser-ai-be`, `wiser-ai-fe`, and `wiser-ai-db`.
4.  **Configuration**:
    *   The `NEXT_PUBLIC_API_URL` for the frontend might default to a placeholder. **After the backend is live**, copy its URL (e.g., `https://wiser-ai-be.onrender.com`) and update the `NEXT_PUBLIC_API_URL` environment variable in the Frontend Service settings on Render. Append `/api` if needed.

### Running Migrations & Seed on Render

After the backend service is deployed and "Healthy":

1.  Go to the **Shell** tab of the `wiser-ai-be` service on Render.
2.  Run the following commands:

    ```bash
    yarn prisma migrate deploy
    yarn seed
    ```

---

## 🎯 Tổng quan

WiserAi bao gồm 2 module chính:

- **Backend (wiser-ai-be)**: NestJS API server với Prisma ORM, PostgreSQL database, JWT authentication
- **Frontend (wiser-ai-fe)**: Next.js App Router với Material UI, responsive design, PWA support

## 🛠 Công nghệ sử dụng

### Backend
- **Framework**: NestJS 11.x
- **Database**: PostgreSQL 15
- **ORM**: Prisma 7.x
- **Authentication**: JWT (Access Token + Refresh Token)
- **API Documentation**: Swagger/OpenAPI
- **Language**: TypeScript 5.x

### Frontend
- **Framework**: Next.js 16.x (App Router)
- **UI Library**: Material UI (MUI) 7.x
- **State Management**: React Hooks
- **PWA**: next-pwa
- **Language**: TypeScript 5.x

## 💻 Yêu cầu hệ thống

- **Node.js**: 20.x hoặc cao hơn
- **npm**: 10.x hoặc cao hơn (hoặc yarn 1.22.x)
- **PostgreSQL**: 15.x (nếu chạy local không dùng Docker)
- **Docker & Docker Compose**: (tùy chọn, để chạy toàn bộ stack)

## 📁 Cấu trúc dự án

```
WiserAi/
├── wiser-ai-be/           # Backend NestJS
│   ├── prisma/            # Prisma schema & migrations
│   ├── src/               # Source code
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # User management
│   │   ├── skills/        # User skills management
│   │   ├── courses/       # Course management
│   │   ├── master-data/   # Master data CRUD
│   │   └── config/        # Configuration data
│   ├── .env.example       # Environment variables template
│   ├── Dockerfile         # Docker configuration
│   └── package.json       # Dependencies
│
├── wiser-ai-fe/           # Frontend Next.js
│   ├── app/               # Next.js App Router
│   │   ├── career-plan/   # Career planning features
│   │   └── admin/         # Admin dashboard
│   ├── components/        # Reusable components
│   │   ├── layout/        # Sidebar, navigation
│   │   ├── ThemeRegistry/ # MUI theme integration
│   │   └── ui/            # UI components
│   ├── Dockerfile         # Docker configuration
│   └── package.json       # Dependencies
│
├── wiser-ai-fe/public/    # Static assets (favicons, logos)
│   └── logo.svg           # Project Logo
│
└── docker-compose.yml     # Docker Compose configuration
```

---

## 🚀 Cài đặt và chạy dự án (Local)

### 1. Setup Backend (wiser-ai-be)

#### Bước 1.1: Di chuyển vào thư mục backend

```bash
cd wiser-ai-be
```

#### Bước 1.2: Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

#### Bước 1.3: Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin phù hợp:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wiser_ai?schema=public"

# JWT Secrets
JWT_SECRET=super-secret-key
JWT_REFRESH_SECRET=super-secret-refresh-key

# Server Port
PORT=3000

# OpenAI API Key (tùy chọn, cho tính năng ChatGPT)
OPENAI_API_KEY=your-openai-api-key-here
```

#### Bước 1.4: Setup Database

Đảm bảo PostgreSQL đang chạy, sau đó:

```bash
# Generate Prisma Client
npx prisma generate

# Chạy migrations để tạo database schema
npx prisma migrate dev --name init

# (Tùy chọn) Seed dữ liệu mẫu
npx prisma db seed
```

#### Bước 1.5: Chạy Backend

**Development mode:**

```bash
npm run start:dev
# hoặc
yarn start:dev
```

Backend sẽ chạy tại: `http://localhost:3000`

**Production mode:**

```bash
npm run build
npm run start:prod
```

#### Bước 1.6: Kiểm tra API Documentation

Truy cập Swagger UI tại: `http://localhost:3000/api`

---

### 2. Setup Frontend (wiser-ai-fe)

#### Bước 2.1: Di chuyển vào thư mục frontend

```bash
cd wiser-ai-fe
```

#### Bước 2.2: Cài đặt dependencies

```bash
yarn install
# hoặc
npm install
```

#### Bước 2.3: Cấu hình môi trường (tùy chọn)

Tạo file `.env.local` nếu cần override API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Bước 2.4: Chạy Frontend

**Development mode:**

```bash
yarn dev
# hoặc
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3001`

**Production mode:**

```bash
yarn build
yarn start
```

---

### 3. Chạy với Docker Compose

Cách đơn giản nhất để chạy toàn bộ stack (Backend + Frontend + PostgreSQL):

#### Bước 3.1: Tạo file `.env` ở thư mục root

Tạo file `.env` tại thư mục gốc `WiserAi/`:

```env
OPENAI_API_KEY=your-openai-api-key-here
```

#### Bước 3.2: Build và chạy tất cả services

```bash
# Từ thư mục gốc WiserAi/
docker-compose up --build
```

Hoặc chạy ở chế độ background:

```bash
docker-compose up -d --build
```

#### Bước 3.3: Truy cập ứng dụng

- **Frontend**: `http://localhost:3001`
- **Backend API**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/api/docs`
- **PostgreSQL**: `localhost:5432`

#### Bước 3.4: Dừng services

```bash
docker-compose down
```

Xóa cả volumes (database data):

```bash
docker-compose down -v
```

#### Bước 3.5: Chạy migrations & Seed trong Docker

Sau khi containers đã chạy:

```bash
# Chạy migrations
docker-compose exec wiser-ai-be yarn prisma migrate deploy

# Seed dữ liệu (Admin user)
docker-compose exec wiser-ai-be yarn seed
```

---

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/register` - Đăng ký user mới
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Đăng xuất

### User Management

- `GET /users` - Lấy danh sách users (Admin only)
- `GET /users/:id` - Lấy thông tin user
- `PATCH /users/:id` - Cập nhật user
- `DELETE /users/:id` - Xóa user (Admin only)

### Skills Management

- `GET /skills` - Lấy danh sách skills của user
- `POST /skills` - Thêm skill mới
- `PATCH /skills/:id` - Cập nhật skill
- `DELETE /skills/:id` - Xóa skill

### Courses Management

- `GET /courses` - Lấy danh sách courses
- `POST /courses` - Tạo course mới (Admin only)
- `PATCH /courses/:id` - Cập nhật course (Admin only)
- `DELETE /courses/:id` - Xóa course (Admin only)

### Master Data Management

- `GET /master-data` - Lấy danh sách master data
- `POST /master-data` - Thêm master data (Admin only)
- `POST /master-data/import` - Import từ Excel (Admin only)
- `PATCH /master-data/:id` - Cập nhật master data (Admin only)
- `DELETE /master-data/:id` - Xóa master data (Admin only)

Chi tiết đầy đủ xem tại Swagger: `http://localhost:3000/api`

---

## ✨ Tính năng chính

### Frontend Features

1. **Responsive Sidebar Navigation**
   - Collapsible menu
   - Admin/User mode switching
   - Material UI components

2. **Career Planning Tools**
   - Profile management
   - Skills tracking
   - Growth map visualization
   - ChatGPT integration for career advice

3. **Admin Dashboard**
   - Course creation and management
   - User management (CRUD)
   - Master data management (CRUD + Excel import)

4. **PWA Support**
   - Offline capability
   - Install as app
   - Service worker caching

### Backend Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Refresh token mechanism
   - Role-based access control (MEMBER, MANAGER, HR, ADMIN)

2. **User Skills Management**
   - CRUD operations for user skills
   - Experience tracking
   - Career goal setting

3. **Master Data Management**
   - Category-based data organization
   - Excel import functionality
   - Flexible key-value storage

4. **API Documentation**
   - Swagger/OpenAPI integration
   - Interactive API testing
   - Schema validation

---

## 🔧 Scripts hữu ích

### Backend Scripts

```bash
# Development
npm run start:dev          # Chạy dev server với hot-reload
npm run build              # Build production
npm run start:prod         # Chạy production build

# Database
npx prisma generate        # Generate Prisma Client
npx prisma migrate dev     # Chạy migrations
npx prisma studio          # Mở Prisma Studio GUI
npx prisma db push         # Push schema changes (không tạo migration)

# Testing
npm run test               # Unit tests
npm run test:e2e           # E2E tests
npm run test:cov           # Test coverage

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code với Prettier
```

### Frontend Scripts

```bash
# Development
yarn dev                   # Chạy dev server
yarn build                 # Build production
yarn start                 # Chạy production build

# Code Quality
yarn lint                  # Run ESLint
```

---

## 🐛 Troubleshooting

### Backend Issues

**Lỗi kết nối database:**
```bash
# Kiểm tra PostgreSQL đang chạy
# Windows:
services.msc

# Hoặc dùng Docker:
docker-compose up postgres
```

**Lỗi Prisma Client:**
```bash
# Regenerate Prisma Client
npx prisma generate
```

### Frontend Issues

**Lỗi build Next.js:**
```bash
# Xóa cache và rebuild
rm -rf .next
yarn build
```

**Lỗi kết nối API:**
- Kiểm tra `NEXT_PUBLIC_API_URL` trong `.env.local`
- Đảm bảo backend đang chạy

### Docker Issues

**Port đã được sử dụng:**
```bash
# Thay đổi port trong docker-compose.yml
# Hoặc stop service đang dùng port đó
```

**Lỗi permission:**
```bash
# Chạy với sudo (Linux/Mac)
sudo docker-compose up
```

---

## 📝 License

This project is private and proprietary.

## 👥 Contributors

- Development Team - WiserAi

---

## 📞 Support

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển.
