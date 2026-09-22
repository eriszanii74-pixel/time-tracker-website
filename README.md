# Vercel Time Tracker & Posts

This is a Node.js (Express) application ready to be deployed to Vercel.

## Features
- Generates tokens
- Submit posts (Text, Photo, Video) using tokens
- Shows exactly what time someone posted something

## Deploying to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository (`time-tracker-website`).
3. Vercel will automatically detect the `api` folder and `vercel.json` config and deploy it as serverless functions.

**Note about Vercel:** Vercel uses Serverless functions. This means the memory (where tokens and posts are currently saved) will reset occasionally when the server spins down. For a production app, you would swap out the in-memory arrays in `api/index.js` with a database like Vercel Postgres or MongoDB, and use Vercel Blob for storing images permanently. Currently, it saves images as Base64 data to get around the read-only file system of Vercel!
