# ⚡ Kevin Cardona Portfolio — Deployment & Maintenance Guide

This guide documents the steps required to update your GitHub stats snapshot and deploy the latest version of your portfolio to **GitHub Pages**.

---

## 🚀 1. How to Update GitHub Data (Local Snapshot)

To optimize page loading speed and keep your credentials secure, the website consumes repository statistics and contribution data from a local JSON snapshot file located at `data/github-data.json`. This avoids direct API requests from the browser which would expose your personal token and trigger rate limiting.

### Step 1: Configure Your GitHub Token
1. Generate a **Personal Access Token (Classic)** in your GitHub account:
   - Go to **Settings** > **Developer Settings** > **Personal Access Tokens** > **Tokens (classic)**.
   - Create a new token with minimal scopes (`read:user` and `repo` to retrieve both public and private repository details).
2. Create a file named `.token` (no extension) in the root directory of your project.
3. Paste your GitHub token inside this file. Example content:
   ```text
   ghp_YourPersonalGitHubTokenGoesHere
   ```
   > 🔒 **Security Note**: The `.token` file is already added to `.gitignore`, meaning it will never be committed or exposed publicly on GitHub.

### Step 2: Run the Sync Script
Run the Node.js script (which uses built-in modules only and requires no `npm install`):
```bash
node scripts/fetch-github-data.js
```
The script will read the token from your `.token` file, call the GitHub GraphQL API, and update the static snapshot in `data/github-data.json`. You should see console output similar to:
```text
🔑 Loaded token from local .token file.
📡 Fetching via GraphQL API (with token)...
✅ Data saved successfully!
   📂 Repos fetched:  30
   📊 Public repos:   20
   🔒 Private repos:  10
```

---

## 🌐 2. How to Deploy & Update on GitHub Pages

Since this portfolio is a static site (composed of vanilla HTML, CSS, and JS), hosting it on GitHub Pages is straightforward.

### Initial Setup on GitHub (One-Time Setup)
1. Push your code to your GitHub repository (e.g., `kevincardonag/kevin-portfolio`).
2. Go to the **Settings** tab of your repository on GitHub.
3. In the left-hand sidebar menu, click on **Pages**.
4. In the **Build and deployment** > **Source** dropdown, select **"Deploy from a branch"**.
5. Under **Branch**, select your primary branch (usually `main` or `master`) and select the `/ (root)` folder. Click **Save**.
6. GitHub Pages will automatically compile and deploy your site to the URL (e.g., `https://kevincardonag.github.io/kevin-portfolio/`).

### How to Publish Updates
Whenever you update your HTML/CSS/JS files or regenerate your GitHub snapshot (`github-data.json`), follow these commands in your terminal to publish the updates to production:

```bash
# 1. Stage all changes
git add .

# 2. Commit the changes with a descriptive message
git commit -m "feat: update github activity data and featured projects"

# 3. Push changes to the remote branch
git push origin main
```

Once the push completes, GitHub Actions will automatically rebuild and redeploy your site in a few seconds.

---

## 💻 3. Local Preview

To test your changes locally before pushing them to production, start a local HTTP server in the root of the project:

```bash
# Using Python 3
python3 -m http.server 8888
```

Then open your browser and navigate to [http://localhost:8888](http://localhost:8888).
