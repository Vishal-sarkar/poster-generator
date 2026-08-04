# Cloudflare R2 Upload Worker Setup Instructions

Follow these step-by-step instructions to deploy your secure certificate hosting worker to Cloudflare.

## Step 1: Create R2 Buckets in Cloudflare
1. Log in to your **Cloudflare Dashboard**.
2. Navigate to **R2 Object Storage** in the sidebar.
3. Click **Create Bucket**.
4. Set the bucket name to `pedals-power-certificates` and click **Create Bucket**.
5. Optionally, create a preview bucket named `pedals-power-certificates-preview` for local development.

---

## Step 2: Install Wrangler and Deploy the Worker
Open your terminal inside the `r2-worker` folder:

1. **Login to Cloudflare**:
   ```bash
   npx wrangler login
   ```
   *This opens a browser tab. Approve the wrangler request to log in to your Cloudflare account.*

2. **Deploy the Worker**:
   ```bash
   npx wrangler deploy
   ```
   *This packages and uploads your typescript code to Cloudflare Workers and binds the `MY_BUCKET` variable automatically.*

3. **Get the Endpoint URL**:
   After a successful deploy, the terminal will print a worker address, for example:
   `https://pedals-power-r2-upload.<your-subdomain>.workers.dev`

---

## Step 3: Configure the Frontend Environment
1. Open the `.env` file at the root of your poster generator project.
2. Add your deployed worker URL as the `VITE_R2_UPLOAD_API` environment variable:
   ```env
   VITE_R2_UPLOAD_API=https://pedals-power-r2-upload.<your-subdomain>.workers.dev/upload
   ```
3. Restart your local development server (`npm run dev`) or rebuild the application for production!

---

## Technical Details: How It Works
- **CORS Handling**: The worker automatically handles preflight `OPTIONS` requests from your frontend site.
- **Secure Retrieval**: The bucket itself is private. Files are served securely via a custom GET endpoint (`/file/<key>`) inside the worker, eliminating the need to expose the bucket to the public internet or purchase a custom domain.
