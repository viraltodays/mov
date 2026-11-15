# Mov video site

A small Express app for a video library with an admin page and share URLs in the form `/?mov=VIDEO_CODE`.

## Run locally

Requires Node.js. From the project folder run `npm install` and `npm start`, then open `http://localhost:3000/` and `http://localhost:3000/admin`.

## Add a video

In `/admin`, enter a unique code, title, and HTTPS video URL hosted at `cdn2.videy.co` or `cdn.slicedrv.com`. The app creates a share link like `http://localhost:3000/?mov=TZXYAtgV1`. Replace `localhost:3000` with your deployed domain when hosted.

Video entries are stored in `data/videos.json`. The admin interface and write API currently do not have authentication; do not expose them on a public deployment until admin access is protected.
