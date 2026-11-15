# Inkwell – Full Stack Blog Application

Inkwell is a full stack blog platform where users can register, log in, and write, edit and delete their own posts. Built as the final project of the Codomax Digital Solutions Full Stack Web Development Internship.

**Live website:** https://sehalahmed2005-ops.github.io/codomax-blog-frontend/
**Backend API:** https://codomax-blog-backend-j0fa.onrender.com
**Backend repo:** https://github.com/sehalahmed2005-ops/codomax-blog-backend

> The backend runs on Render's free tier, so the first load can take up to a minute while the server wakes up.

## Features

- User registration and login with JWT authentication
- Passwords hashed with bcrypt
- Create, read, update and delete blog posts (CRUD)
- Only the author can edit or delete their own posts
- Protected dashboard with profile details and "My posts"
- Search and category filter
- Responsive layout for desktop and mobile

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | MongoDB Atlas with Mongoose |
| Auth | JSON Web Tokens, bcryptjs |
| Hosting | GitHub Pages (frontend), Render (backend) |

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Log in and get a token |
| GET | `/api/auth/me` | Logged in | Current user profile |
| GET | `/api/blogs` | Public | All posts |
| GET | `/api/blogs/mine` | Logged in | Your posts |
| GET | `/api/blogs/:id` | Public | One post |
| POST | `/api/blogs` | Logged in | Create a post |
| PUT | `/api/blogs/:id` | Owner | Edit a post |
| DELETE | `/api/blogs/:id` | Owner | Delete a post |

## Run Locally

1. Clone both repositories.
2. In the backend folder, create a `.env` file:
   ```
   PORT=5000
   JWT_SECRET=your_secret_here
   MONGO_URI=your_mongodb_connection_string
   ```
3. Run `npm install` then `npm run dev` in the backend folder.
4. Open `index.html` in the frontend folder (for example with Live Server). On localhost, the frontend automatically uses `http://localhost:5000/api`.

## Project Structure

```
codomax-blog-frontend/
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── create-blog.html
├── app.js
└── style.css
```

## Author

T Sehal Ahmed
B.Sc. Computer Science, Mazharul Uloom College, Ambur
[GitHub](https://github.com/sehalahmed2005-ops) · [LinkedIn](https://linkedin.com/in/sehalahmed46)
