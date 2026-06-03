#!/usr/bin/env node
// =============================================================================
// fetch-github-data.js
// Node.js script to generate a static snapshot of GitHub data.
// Usage: GITHUB_TOKEN=ghp_xxx node scripts/fetch-github-data.js
// Uses only built-in modules — no npm dependencies required.
// =============================================================================

'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Configuration ────────────────────────────────────────────────────────────
const USERNAME = 'kevincardonag';
const TOKEN = process.env.GITHUB_TOKEN || '';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'github-data.json');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Make an HTTPS request and return parsed JSON.
 */
function httpsRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
            return;
          }
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`JSON parse error: ${err.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (body) req.write(body);
    req.end();
  });
}

/**
 * Fetch from GitHub REST API.
 */
function fetchREST(endpoint) {
  const headers = {
    'User-Agent': 'kevin-portfolio-fetcher',
    Accept: 'application/vnd.github.v3+json',
  };

  if (TOKEN) {
    headers.Authorization = `token ${TOKEN}`;
  }

  return httpsRequest({
    hostname: 'api.github.com',
    path: endpoint,
    method: 'GET',
    headers,
  });
}

/**
 * Fetch from GitHub GraphQL API (requires token).
 */
function fetchGraphQL(query) {
  const body = JSON.stringify({ query });

  return httpsRequest(
    {
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'User-Agent': 'kevin-portfolio-fetcher',
        Authorization: `bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    },
    body
  );
}

// ── Fetchers ─────────────────────────────────────────────────────────────────

/**
 * Fetch full data via GraphQL API (token required).
 */
async function fetchWithGraphQL() {
  console.log('📡 Fetching via GraphQL API (with token)...');

  const query = `
    query {
      user(login: "${USERNAME}") {
        login
        name
        avatarUrl
        bio
        location
        websiteUrl
        createdAt
        repositories(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}, privacy: PUBLIC) {
          totalCount
          nodes {
            name
            description
            url
            primaryLanguage { name color }
            stargazerCount
            forkCount
            updatedAt
            isPrivate
            isFork
          }
        }
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          totalIssueContributions
          restrictedContributionsCount
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
        followers { totalCount }
        following { totalCount }
        privateRepos: repositories(privacy: PRIVATE) { totalCount }
      }
    }
  `;

  const result = await fetchGraphQL(query);

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  const user = result.data.user;
  const contrib = user.contributionsCollection;
  const calendar = contrib.contributionCalendar;
  const createdAt = new Date(user.createdAt);
  const yearsOnGitHub = new Date().getFullYear() - createdAt.getFullYear();

  return {
    timestamp: new Date().toISOString(),
    profile: {
      login: user.login,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      location: user.location,
      blog: user.websiteUrl,
      createdAt: user.createdAt,
    },
    repos: user.repositories.nodes.map((r) => ({
      name: r.name,
      description: r.description,
      url: r.url,
      primaryLanguage: r.primaryLanguage,
      stargazerCount: r.stargazerCount,
      forkCount: r.forkCount,
      updatedAt: r.updatedAt,
      isPrivate: r.isPrivate,
      isFork: r.isFork,
    })),
    contributions: {
      totalCommitContributions: contrib.totalCommitContributions,
      totalPullRequestContributions: contrib.totalPullRequestContributions,
      totalPullRequestReviewContributions: contrib.totalPullRequestReviewContributions,
      totalIssueContributions: contrib.totalIssueContributions,
      restrictedContributionsCount: contrib.restrictedContributionsCount,
      contributionCalendar: calendar,
    },
    stats: {
      publicRepos: user.repositories.totalCount,
      privateRepos: user.privateRepos.totalCount,
      totalContributions: calendar.totalContributions,
      totalCommits: contrib.totalCommitContributions,
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      yearsOnGitHub,
    },
  };
}

/**
 * Fetch data via public REST API (no token needed).
 */
async function fetchWithREST() {
  console.log('📡 Fetching via public REST API...');

  const [profile, repos, events] = await Promise.all([
    fetchREST(`/users/${USERNAME}`),
    fetchREST(`/users/${USERNAME}/repos?sort=updated&per_page=20&type=all`),
    fetchREST(`/users/${USERNAME}/events/public?per_page=100`),
  ]);

  // Estimate contributions from recent push events
  const pushEvents = events.filter((e) => e.type === 'PushEvent');
  const totalCommitsFromEvents = pushEvents.reduce(
    (sum, e) => sum + (e.payload?.commits?.length || 0),
    0
  );

  const createdAt = new Date(profile.created_at);
  const yearsOnGitHub = new Date().getFullYear() - createdAt.getFullYear();

  return {
    timestamp: new Date().toISOString(),
    profile: {
      login: profile.login,
      name: profile.name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      location: profile.location,
      blog: profile.blog,
      createdAt: profile.created_at,
    },
    repos: repos.map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      primaryLanguage: r.language
        ? { name: r.language, color: null }
        : null,
      stargazerCount: r.stargazers_count,
      forkCount: r.forks_count,
      updatedAt: r.updated_at,
      isPrivate: r.private,
      isFork: r.fork,
    })),
    contributions: {
      totalCommitContributions: totalCommitsFromEvents,
      contributionCalendar: null, // Not available from REST API
    },
    stats: {
      publicRepos: profile.public_repos,
      privateRepos: null,
      totalContributions: null,
      totalCommits: totalCommitsFromEvents,
      followers: profile.followers,
      following: profile.following,
      yearsOnGitHub,
    },
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('🚀 GitHub Data Fetcher for Portfolio');
  console.log('━'.repeat(50));
  console.log(`   User:   ${USERNAME}`);
  console.log(`   Token:  ${TOKEN ? '✅ Provided' : '⚠️  Not provided (public API only)'}`);
  console.log(`   Output: ${OUTPUT_FILE}`);
  console.log('━'.repeat(50));
  console.log('');

  if (!TOKEN) {
    console.log('⚠️  No GITHUB_TOKEN found in environment.');
    console.log('   Private repo stats and contribution graph will not be available.');
    console.log('   Usage: GITHUB_TOKEN=ghp_xxx node scripts/fetch-github-data.js');
    console.log('');
  }

  let data;

  try {
    if (TOKEN) {
      data = await fetchWithGraphQL();
    } else {
      data = await fetchWithREST();
    }
  } catch (err) {
    console.error('❌ Fetch failed:', err.message);

    // If GraphQL fails, try REST as fallback
    if (TOKEN) {
      console.log('\n🔄 Falling back to REST API...');
      try {
        data = await fetchWithREST();
      } catch (restErr) {
        console.error('❌ REST API also failed:', restErr.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created directory: ${OUTPUT_DIR}`);
  }

  // Write JSON file
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(OUTPUT_FILE, json, 'utf-8');

  // Print summary
  console.log('');
  console.log('✅ Data saved successfully!');
  console.log('━'.repeat(50));
  console.log(`   📦 File size:      ${(Buffer.byteLength(json) / 1024).toFixed(1)} KB`);
  console.log(`   📂 Repos fetched:  ${data.repos.length}`);
  console.log(`   📊 Public repos:   ${data.stats.publicRepos ?? 'N/A'}`);
  console.log(`   🔒 Private repos:  ${data.stats.privateRepos ?? 'N/A (no token)'}`);
  console.log(`   💻 Total commits:  ${data.stats.totalCommits ?? 'N/A'}`);
  console.log(`   🌟 Contributions:  ${data.stats.totalContributions ?? 'N/A (no token)'}`);
  console.log(`   👥 Followers:      ${data.stats.followers ?? 'N/A'}`);
  console.log(`   📅 Years on GH:   ${data.stats.yearsOnGitHub ?? 'N/A'}`);
  console.log(`   🕐 Timestamp:      ${data.timestamp}`);
  console.log('━'.repeat(50));
  console.log('');
  console.log(`📝 Output: ${OUTPUT_FILE}`);
  console.log('');
}

main().catch((err) => {
  console.error('💥 Unexpected error:', err);
  process.exit(1);
});
