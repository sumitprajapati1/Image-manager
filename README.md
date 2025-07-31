# 🗂️ Nested Image Folder Manager 

A full-stack web application where users can register, create  folders, upload images into folders, and search their images by name — similar to **Google Drive** functionality. Each user has isolated access to their own folders and uploaded content.

---

## 🔗 Live Demo

👉 [Live url ](https://image-manager-xi.vercel.app/login)  
👉 Backend: [backend url](https://your-backend-api-url)

> ℹ️ Demo Login Credentials:
Email: xyz@gmail.com   
Password: 123123


## Run Locally

Clone the project

```bash
https://github.com/sumitprajapati1/Image-manager
cd Image-manager
```



## Installation

Setup of backend 

```bash
  cd server
  npm install
  node server.js
```

Setup of frontend 

```bash
  cd client
  npm install
  npm start
```
    
## Environment Variables for backend

To run this project, you will need to add the following environment variables to your .env file of backend .

PORT=5000          
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key


## Deployment

Frontend is deployed on Vercel, and backend is hosted on Render or Railway.

