const FLOW_TRIGGER_URL = "https://642eb97da122e36e9c01670a443957.13.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/29c9386f7800422a93e8a48b42bc969f/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=9JeCsFPtZYP8D2DQk6VozW9KXuzUuD6T7M_EkPtPxjA";

async function loadDashboardFromFlow() {
  const response = await fetch(FLOW_TRIGGER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      requestedAt: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Flow trigger failed: ${response.status}`);
  }

  const data = await response.json();

  renderSummary(data);
  renderLeaderboard(data.leaderboard || []);
  renderPicks(data.leaderboard || []);
}

function renderSummary(data) {
  const updatedEl = document.getElementById("updated");
  const totalPlayersEl = document.getElementById("totalPlayers");
  const winningTeamsCountEl = document.getElementById("winningTeamsCount");
  const winningTeamsEl = document.getElementById("winningTeams");

  if (updatedEl) {
    updatedEl.textContent = `Last updated: ${formatDateTime(data.generatedAt)}`;
  }

  if (totalPlayersEl) {
    totalPlayersEl.textContent = String(data.summary?.totalPlayers ?? 0);
  }

  if (winningTeamsCountEl) {
    winningTeamsCountEl.textContent = String(data.summary?.winningTeamsCount ?? 0);
  }

  if (winningTeamsEl) {
    const winningTeams = data.summary?.winningTeams || [];
    winningTeamsEl.innerHTML = winningTeams.length
      ? winningTeams.map(team => `<span class="pill">${escapeHtml(team)}</span>`).join("")
      : `<span class="muted">No winning teams marked yet</span>`;
  }
}

function renderLeaderboard(players) {
  const tbody = document.querySelector("#leaderboard tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  for (const player of players) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${player.rank ?? ""}</td>
      <td>${escapeHtml(player.name ?? "")}</td>
      <td>${player.points ?? 0}</td>
      <td>${player.correctPicks ?? 0}</td>
      <td>${player.tiebreakerGuess ?? ""}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderPicks(players) {
  const picksGrid = document.getElementById("picksGrid");
  if (!picksGrid) return;

  picksGrid.innerHTML = "";

  for (const player of players) {
    const card = document.createElement("div");
    card.className = "pick-card";

    const picksHtml = (player.picks || [])
      .map(pick => {
        const resultClass = pick.won ? "won" : "lost";
        const resultLabel = pick.won ? "W" : "L";

        return `
          <li class="${resultClass}">
            <span class="pick-team">${escapeHtml(pick.team ?? "")}</span>
            <span class="pick-meta">
              <span class="result-badge ${resultClass}">${resultLabel}</span>
              <span class="pick-points">${pick.points ?? 0} pts</span>
            </span>
          </li>
        `;
      })
      .join("");

    card.innerHTML = `
      <div class="pick-card-header">
        <div>
          <h3>${escapeHtml(player.name ?? "")}</h3>
          <p class="pick-card-subtitle">
            Rank #${player.rank ?? "-"} • ${player.points ?? 0} pts • ${player.correctPicks ?? 0} correct
          </p>
        </div>
      </div>

      <div class="pick-card-stats">
        <div class="stat">
          <span class="stat-label">Tiebreaker</span>
          <span class="stat-value">${player.tiebreakerGuess ?? "-"}</span>
        </div>
      </div>

      <ul class="pick-list">
        ${picksHtml}
      </ul>
    `;

    picksGrid.appendChild(card);
  }
}

function formatDateTime(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

document.addEventListener("DOMContentLoaded", async () => {
  const refreshButton = document.getElementById("refreshButton");

  async function runLoad() {
    try {
      if (refreshButton) {
        refreshButton.disabled = true;
        refreshButton.textContent = "Refreshing...";
      }

      await loadDashboardFromFlow();
    } catch (error) {
      console.error(error);
      const updatedEl = document.getElementById("updated");
      if (updatedEl) {
        updatedEl.textContent = "Failed to load dashboard data.";
      }
    } finally {
      if (refreshButton) {
        refreshButton.disabled = false;
        refreshButton.textContent = "Refresh Results";
      }
    }
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", runLoad);
  }

  await runLoad();
});