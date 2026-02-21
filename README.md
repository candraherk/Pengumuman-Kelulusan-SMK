# Pengumuman Kelulusan

## Environment Configuration
Copy `.env.example` to `.env` and fill in the values:
- `DATABASE_URL`: Your PostgreSQL connection string (e.g., `postgres://user:pass@localhost:5432/db`)
- `SESSION_SECRET`: A long random string for session encryption
- `PORT`: The port the server will run on (default: 5000)

## Prerequisites
- Node.js 20.x or higher
- PostgreSQL 13 or higher (Can be adapted for MySQL by changing the Drizzle driver)

## cPanel Deployment Steps
1. **Prepare the Files**:
   - Run `npm run build` to generate the production frontend.
   - Compress the following files/folders into a ZIP: `dist/`, `server/`, `shared/`, `package.json`, `package-lock.json`, `.env.example`.

2. **Setup on cPanel**:
   - Go to "Setup Node.js App".
   - Create a new application (Node.js version 20+, Application mode: production).
   - Set "Application root" to your project directory.
   - Set "Application startup file" to `server/index.ts` (Note: In a standard cPanel Node.js setup, you might need to point this to a compiled JS file if not using `tsx`. For best compatibility, compile the server using `esbuild` or similar).

3. **Database Setup**:
   - Create a PostgreSQL database and user in cPanel.
   - Update the `DATABASE_URL` in your Node.js app's environment variables.

4. **Run Migrations**:
   - Use the cPanel Terminal or SSH to run: `npm run db:push`.

5. **Start the App**:
   - Restart the Node.js application from the cPanel interface.

## Local Development
```bash
npm install
npm run dev
```
