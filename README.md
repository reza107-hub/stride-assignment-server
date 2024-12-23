# Stride E-commerce Application

## Overview

This project is a small-size e-commerce application built using the MERN (MongoDB, Express.js, React.js, Node.js) stack. It includes Firebase Authentication, JWT-based authorization, and user role management. The application is designed to be fully responsive and includes features for buyers, sellers, and admins.

## Features

### General

- **Responsive Design**: Fully responsive on both mobile and desktop/laptop.
- **User Authentication**: Firebase Authentication with password validation and Google login.
- **JWT Authorization**: Protects API routes and ensures role-based access.

### Buyer Features

- **Browse Products**: View all products with filtering and sorting options.
- **Product Details**: View detailed information about each product.
- **Wishlist**: Add products to a wishlist.
- **Cart**: Add products to a cart.

### Seller Features

- **Dashboard**: Manage products (add, edit, delete).
- **View Products**: View all listed products.

### Admin Features

- **Dashboard**: Manage users (view all users, change roles, delete users).
- **User Role Management**: Promote users to sellers, ban users.

## How to Run the Application Locally

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Firebase Project

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/reza107-hub/stride-assignment-client.git
   cd stride-assignment-client
   ```
2. Install dependencies:

```
   npm install
```

3. Create a .env file in the root directory and add your Firebase configuration:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4.Start the development server:

```bash
npm run dev
```

## Backend Setup

1.Clone the repository:

```bash
git clone https://github.com/reza107-hub/stride-assignment-server.git
cd stride-assignment-server
```

2.Install dependencies:

```bash
npm install
```

3.Create a .env file in the root directory and add your MongoDB URI and JWT secret:

```bash
PORT=port number
MONGODB_URI=your_mongodb_uri
SECRET_KEY==your_SECRET_KEY
TOKEN_EXP= enter a expiration time
```

4.Start the server:

```bash
npm run dev
```

## Running the Application

Ensure both the frontend and backend servers are running.
Open your browser and navigate to http://localhost:5173 to view the application.

## User Credentials

#### Admin

- Email: sabab54874@rabitex.com
- Password: Admin123@

### Seller

- Email: negikav435@mowline.com
- Password: Seller123@

### Buyer

- Email: xemoc43793@ronete.com
- Password: Buyer123@

## Live Link

https://stride-assignment-client.vercel.app/
