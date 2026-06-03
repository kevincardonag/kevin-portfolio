// =============================================================================
// GitHub Integration — API fetching, caching, and UI rendering
// Exposed as window.GitHubIntegration
// =============================================================================

(function () {
  'use strict';

  // ── Language Colors ────────────────────────────────────────────────────────
  const LANGUAGE_COLORS = {
    Python:      '#3572A5',
    JavaScript:  '#f1e05a',
    TypeScript:  '#2b7489',
    HTML:        '#e34c26',
    CSS:         '#563d7c',
    Vue:         '#41b883',
    Shell:       '#89e051',
    Dockerfile:  '#384d54',
    Java:        '#b07219',
    Ruby:        '#701516',
    Go:          '#00ADD8',
    Rust:        '#dea584',
    PHP:         '#4F5D95',
    C:           '#555555',
    'C++':       '#f34b7d',
    'C#':        '#178600',
    Swift:       '#ffac45',
    Kotlin:      '#A97BFF',
    Dart:        '#00B4AB',
    Jupyter:     '#DA5B0B',
    Makefile:    '#427819',
    HCL:         '#844FBA',
    Nix:         '#7e7eff',
    Lua:         '#000080',
    Sass:        '#a53b70',
    SCSS:        '#c6538c',
  };

  // ── SVG Icons ──────────────────────────────────────────────────────────────
  const ICONS = {
    repo: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>',
    star: '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>',
    fork: '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>',
  };

  // ── Main Module ────────────────────────────────────────────────────────────
  window.GitHubIntegration = {
    username: 'kevincardonag',
    cacheKey: 'github_cache',
    cacheTTL: 3600000, // 1 hour in ms

    // ── Init ───────────────────────────────────────────────────────────────
    async init() {
      this.showLoading();

      try {
        const data = await this.fetchData();
        if (data) {
          this.renderStats(data);
          this.renderRepos(data.repos || []);
          this.renderContributionGraph(data);
        }
      } catch (err) {
        console.error('[GitHub] Init failed:', err);
        this.showError('Unable to load GitHub data. Please try again later.');
      } finally {
        this.hideLoading();
      }
    },

    // ── Data Fetching Strategy ─────────────────────────────────────────────
    async fetchData() {
      // 1. Check cache
      const cached = this.getCache();
      if (cached) {
        console.log('[GitHub] Using cached data');
        return cached;
      }

      // 2. Try static file
      try {
        const res = await fetch('data/github-data.json');
        if (res.ok) {
          const data = await res.json();
          console.log('[GitHub] Using static snapshot');
          this.setCache(data);
          return data;
        }
      } catch {
        // Static file not available, continue
      }

      // 3. Check for personal access token
      const token = localStorage.getItem('github_pat');
      let data;

      if (token) {
        try {
          data = await this.fetchWithToken(token);
          console.log('[GitHub] Fetched via GraphQL (with token)');
        } catch (err) {
          console.warn('[GitHub] Token fetch failed, falling back to public API:', err);
          data = await this.fetchFromAPI();
        }
      } else {
        data = await this.fetchFromAPI();
        console.log('[GitHub] Fetched via public REST API');
      }

      if (data) {
        this.setCache(data);
      }

      return data;
    },

    // ── Public REST API ────────────────────────────────────────────────────
    async fetchFromAPI() {
      const headers = { Accept: 'application/vnd.github.v3+json' };

      const [profileRes, reposRes, eventsRes] = await Promise.all([
        fetch(`https://api.github.com/users/${this.username}`, { headers }),
        fetch(`https://api.github.com/users/${this.username}/repos?sort=updated&per_page=12&type=all`, { headers }),
        fetch(`https://api.github.com/users/${this.username}/events/public?per_page=100`, { headers }),
      ]);

      if (!profileRes.ok) {
        throw new Error(`GitHub API error: ${profileRes.status}`);
      }

      const profile = await profileRes.json();
      const repos = reposRes.ok ? await reposRes.json() : [];
      const events = eventsRes.ok ? await eventsRes.json() : [];

      // Estimate contributions from events (rough approximation)
      const pushEvents = events.filter((e) => e.type === 'PushEvent');
      const totalCommitsFromEvents = pushEvents.reduce(
        (sum, e) => sum + (e.payload?.commits?.length || 0),
        0
      );

      // Calculate years on GitHub
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
            ? { name: r.language, color: LANGUAGE_COLORS[r.language] || '#8b949e' }
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
          privateRepos: null, // Not available without token
          totalContributions: null,
          totalCommits: totalCommitsFromEvents,
          followers: profile.followers,
          following: profile.following,
          yearsOnGitHub,
        },
      };
    },

    // ── GraphQL API (with token) ───────────────────────────────────────────
    async fetchWithToken(token) {
      const query = `
        query {
          user(login: "${this.username}") {
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

      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error(`GraphQL error: ${res.status}`);
      }

      const json = await res.json();
      if (json.errors) {
        throw new Error(json.errors[0].message);
      }

      const user = json.data.user;
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
    },

    // ── Render Stats ───────────────────────────────────────────────────────
    renderStats(data) {
      const container = document.getElementById('github-stats');
      if (!container || !data.stats) return;

      const stats = data.stats;
      const items = [
        {
          label: 'Public Repos',
          value: stats.publicRepos ?? '—',
          extra: stats.privateRepos ? `+${stats.privateRepos} private` : null,
        },
        {
          label: 'Contributions',
          value: stats.totalContributions ?? stats.totalCommits ?? '—',
          extra: stats.totalContributions ? 'this year' : 'recent',
        },
        {
          label: 'Followers',
          value: stats.followers ?? '—',
          extra: null,
        },
        {
          label: 'Years on GitHub',
          value: stats.yearsOnGitHub ?? '—',
          extra: null,
        },
      ];

      container.innerHTML = items
        .map(
          (item) => `
        <div class="github-stat-card glass-card">
          <div class="github-stat-value">${this.formatNumber(item.value)}</div>
          <div class="github-stat-label">${item.label}</div>
          ${item.extra ? `<div class="github-stat-extra">${item.extra}</div>` : ''}
        </div>
      `
        )
        .join('');
    },

    // ── Render Repos ───────────────────────────────────────────────────────
    renderRepos(repos) {
      const container = document.getElementById('github-repos');
      if (!container) return;

      // Filter out forks, show up to 6
      const displayRepos = repos
        .filter((r) => !r.isFork)
        .slice(0, 6);

      if (displayRepos.length === 0) {
        container.innerHTML = '<p class="no-data">No repositories to display.</p>';
        return;
      }

      container.innerHTML = displayRepos
        .map(
          (repo) => `
        <div class="repo-card glass-card">
          <div class="repo-header">
            <span class="repo-icon">${ICONS.repo}</span>
            <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="repo-name">
              ${this.escapeHtml(repo.name)}
            </a>
          </div>
          <p class="repo-description">
            ${repo.description ? this.escapeHtml(repo.description) : '<span class="text-muted">No description provided</span>'}
          </p>
          <div class="repo-footer">
            ${
              repo.primaryLanguage
                ? `<span class="repo-language">
                    <span class="repo-language-dot" style="background: ${repo.primaryLanguage.color || '#8b949e'}"></span>
                    ${this.escapeHtml(repo.primaryLanguage.name)}
                  </span>`
                : ''
            }
            ${
              repo.stargazerCount > 0
                ? `<span class="repo-stat">${ICONS.star} ${this.formatNumber(repo.stargazerCount)}</span>`
                : ''
            }
            ${
              repo.forkCount > 0
                ? `<span class="repo-stat">${ICONS.fork} ${this.formatNumber(repo.forkCount)}</span>`
                : ''
            }
          </div>
        </div>
      `
        )
        .join('');
    },

    // ── Render Contribution Graph ──────────────────────────────────────────
    renderContributionGraph(data) {
      const container = document.getElementById('contribution-graph');
      if (!container) return;

      const calendar = data.contributions?.contributionCalendar;

      if (!calendar || !calendar.weeks) {
        // Generate a mock contribution graph for visual appeal
        this.renderMockContributionGraph(container);
        return;
      }

      // Use real data
      const weeks = calendar.weeks;
      const totalWeeks = Math.min(weeks.length, 52);
      const displayWeeks = weeks.slice(-totalWeeks);

      container.innerHTML = `
        <div class="contribution-graph">
          <div class="contribution-grid" id="contribution-grid"></div>
          <div class="contribution-legend">
            <span class="contribution-legend-label">Less</span>
            <span class="contribution-cell" style="opacity: 0.1"></span>
            <span class="contribution-cell" style="opacity: 0.3"></span>
            <span class="contribution-cell" style="opacity: 0.55"></span>
            <span class="contribution-cell" style="opacity: 0.8"></span>
            <span class="contribution-cell" style="opacity: 1"></span>
            <span class="contribution-legend-label">More</span>
          </div>
          <p class="contribution-total">${this.formatNumber(calendar.totalContributions)} contributions in the last year</p>
        </div>
      `;

      const grid = document.getElementById('contribution-grid');
      if (!grid) return;

      displayWeeks.forEach((week) => {
        const weekCol = document.createElement('div');
        weekCol.className = 'contribution-week';

        week.contributionDays.forEach((day) => {
          const cell = document.createElement('div');
          cell.className = 'contribution-cell';
          cell.title = `${day.date}: ${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''}`;

          // Map contribution count to opacity level
          const level = this.getContributionLevel(day.contributionCount);
          cell.style.opacity = level;

          weekCol.appendChild(cell);
        });

        grid.appendChild(weekCol);
      });
    },

    renderMockContributionGraph(container) {
      container.innerHTML = `
        <div class="contribution-graph">
          <div class="contribution-grid" id="contribution-grid"></div>
          <div class="contribution-legend">
            <span class="contribution-legend-label">Less</span>
            <span class="contribution-cell" style="opacity: 0.1"></span>
            <span class="contribution-cell" style="opacity: 0.3"></span>
            <span class="contribution-cell" style="opacity: 0.55"></span>
            <span class="contribution-cell" style="opacity: 0.8"></span>
            <span class="contribution-cell" style="opacity: 1"></span>
            <span class="contribution-legend-label">More</span>
          </div>
          <p class="contribution-note">Add a GitHub token to see your real contribution graph</p>
        </div>
      `;

      const grid = document.getElementById('contribution-grid');
      if (!grid) return;

      // Generate 52 weeks × 7 days of mock data
      const weeksToShow = window.innerWidth < 768 ? 26 : 52;

      for (let w = 0; w < weeksToShow; w++) {
        const weekCol = document.createElement('div');
        weekCol.className = 'contribution-week';

        for (let d = 0; d < 7; d++) {
          const cell = document.createElement('div');
          cell.className = 'contribution-cell';

          // Generate plausible-looking mock data
          const rand = Math.random();
          let level;
          if (rand < 0.3) level = 0.05;        // empty
          else if (rand < 0.55) level = 0.25;   // low
          else if (rand < 0.75) level = 0.5;    // medium
          else if (rand < 0.9) level = 0.75;    // high
          else level = 1.0;                      // very high

          // Weekends are usually lighter
          if (d === 0 || d === 6) level *= 0.6;

          cell.style.opacity = Math.max(level, 0.05);
          weekCol.appendChild(cell);
        }

        grid.appendChild(weekCol);
      }
    },

    getContributionLevel(count) {
      if (count === 0) return 0.05;
      if (count <= 3) return 0.25;
      if (count <= 6) return 0.5;
      if (count <= 9) return 0.75;
      return 1.0;
    },

    // ── Loading / Error States ─────────────────────────────────────────────
    showLoading() {
      const loading = document.getElementById('github-loading');
      if (loading) loading.style.display = '';

      // Hide content containers
      ['github-stats', 'github-repos', 'contribution-graph'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
    },

    hideLoading() {
      const loading = document.getElementById('github-loading');
      if (loading) loading.style.display = 'none';

      // Show content containers
      ['github-stats', 'github-repos', 'contribution-graph'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = '';
      });
    },

    showError(message) {
      const errorEl = document.getElementById('github-error');
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.innerHTML = `
          <p>${this.escapeHtml(message)} <a href="https://github.com/kevincardonag" target="_blank">Visit my profile →</a></p>
          <button class="btn btn-secondary btn-sm" onclick="window.GitHubIntegration.init()">Retry</button>
        `;
      }
    },

    // ── Utilities ──────────────────────────────────────────────────────────
    getLanguageColor(language) {
      return LANGUAGE_COLORS[language] || '#8b949e';
    },

    formatNumber(num) {
      if (num === null || num === undefined || num === '—') return '—';
      const n = Number(num);
      if (isNaN(n)) return num;
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
      return n.toString();
    },

    escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },

    // ── Cache Management ───────────────────────────────────────────────────
    getCache() {
      try {
        const raw = localStorage.getItem(this.cacheKey);
        if (!raw) return null;

        const cached = JSON.parse(raw);
        const age = Date.now() - (cached._cachedAt || 0);

        if (age > this.cacheTTL) {
          localStorage.removeItem(this.cacheKey);
          return null;
        }

        return cached;
      } catch {
        localStorage.removeItem(this.cacheKey);
        return null;
      }
    },

    setCache(data) {
      try {
        const toStore = { ...data, _cachedAt: Date.now() };
        localStorage.setItem(this.cacheKey, JSON.stringify(toStore));
      } catch (err) {
        console.warn('[GitHub] Cache write failed:', err);
      }
    },
  };
})();
