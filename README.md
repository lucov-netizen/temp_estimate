# Estimate 308 E F St — Email Submission Version

## What this version does
- Client selects options.
- Client can click **Accept Selection & Request Invoice**.
- You receive an email at `lucov.gutierrez@gmail.com` with:
  - accepted or not accepted yet
  - whether to send invoice
  - preparation level
  - optional services selected
  - upgrades selected
  - total labor price
  - 40/30/30 payment schedule
- Client is redirected to a green confirmation screen.

## Run locally
```bash
npm install
npm run dev
```

## Deploy on Vercel / v0
Build command:
```bash
npm run build
```

Output folder:
```bash
dist
```

## Important
This uses FormSubmit through:
```js
https://formsubmit.co/ajax/lucov.gutierrez@gmail.com
```

The first submission may require you to confirm/activate the email address from FormSubmit. After that, the emails should come in automatically.

## Change receiving email
Open `src/App.jsx` and update:
```js
const OWNER_EMAIL = "lucov.gutierrez@gmail.com";
```
