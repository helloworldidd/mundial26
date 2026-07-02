// app.js
const API_URL = "https://worldcup26.ir/get/games";

const gamesContainer = document.getElementById("gamesContainer");
const statusText = document.getElementById("status");
const searchInput = document.getElementById("searchInput");
const dateFilter = document.getElementById("dateFilter");

let allGames = data.games || [];

const countryFlags = {
  Argentina: "🇦🇷",
  Brazil: "🇧🇷",
  Chile: "🇨🇱",
  Uruguay: "🇺🇾",
  Colombia: "🇨🇴",
  Ecuador: "🇪🇨",
  Mexico: "🇲🇽",
  USA: "🇺🇸",
  "United States": "🇺🇸",
  Canada: "🇨🇦",
  Spain: "🇪🇸",
  France: "🇫🇷",
  Germany: "🇩🇪",
  England: "🏴",
  Portugal: "🇵🇹",
  Italy: "🇮🇹",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  Croatia: "🇭🇷",
  Japan: "🇯🇵",
  Korea: "🇰🇷",
  Morocco: "🇲🇦",
  Senegal: "🇸🇳",
  Ghana: "🇬🇭",
  Australia: "🇦🇺"
};

function getTeamName(team) {
  if (!team) return "Por definir";
  if (typeof team === "string") return team;
  return team.name || team.country || team.team || "Por definir";
}

function getFlag(teamName) {
  return countryFlags[teamName] || "🏳️";
}

function getDate(game) {
  return game.date || game.match_date || game.datetime || game.time || game.start_time;
}

function getStage(game) {
  return game.stage || game.round || game.group || "Partido";
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (isNaN(date)) return "Fecha por definir";

  return date.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

function formatTime(dateValue) {
  const date = new Date(dateValue);
  if (isNaN(date)) return "Hora por definir";

  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function normalizeGame(game) {
  return {
    home: game.home_team_name_en || "Por definir",
    away: game.away_team_name_en || "Por definir",
    homeScore: game.home_score,
    awayScore: game.away_score,
    date: game.local_date,
    group: game.group,
    matchday: game.matchday,
    stage: game.type,
    finished: game.finished === "TRUE"
  };
}

async function loadGames() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    allGames = Array.isArray(data) ? data : data.games || data.data || [];

    allGames = allGames.map(normalizeGame);

    fillDateFilter();
    renderGames();

    statusText.style.display = "none";
  } catch (error) {
    statusText.textContent = "No se pudieron cargar los partidos.";
    console.error(error);
  }
}

function fillDateFilter() {
  const dates = [...new Set(allGames.map(game => formatDate(game.date)))];

  dates.forEach(date => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    dateFilter.appendChild(option);
  });
}

function renderGames() {
  const search = searchInput.value.toLowerCase();
  const selectedDate = dateFilter.value;

  const filteredGames = allGames.filter(game => {
    const matchesSearch =
      game.home.toLowerCase().includes(search) ||
      game.away.toLowerCase().includes(search);

    const matchesDate =
      selectedDate === "" || formatDate(game.date) === selectedDate;

    return matchesSearch && matchesDate;
  });

  const grouped = {};

  filteredGames.forEach(game => {
    const day = formatDate(game.date);
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(game);
  });

  gamesContainer.innerHTML = "";

  if (filteredGames.length === 0) {
    gamesContainer.innerHTML = `<p class="status">No hay partidos para mostrar.</p>`;
    return;
  }

  Object.keys(grouped).forEach(day => {
    const dayBlock = document.createElement("article");
    dayBlock.className = "day-block";

    dayBlock.innerHTML = `
      <h2 class="day-title">${day}</h2>
      <div class="games-grid">
        ${grouped[day].map(game => `
          <div class="game-card">
            <div class="stage">${game.stage}</div>

            <div class="match">
              <div class="team">
                <span class="flag">${getFlag(game.home)}</span>
                <span>${game.home}</span>
              </div>

              <div class="vs">
                ${game.finished ? `${game.homeScore} - ${game.awayScore}` : "VS"}
                </div>

              <div class="team">
                <span>${game.away}</span>
                <span class="flag">${getFlag(game.away)}</span>
              </div>
            </div>

            <div class="time">🕒 ${formatTime(game.date)}</div>
          </div>
        `).join("")}
      </div>
    `;

    gamesContainer.appendChild(dayBlock);
  });
}

searchInput.addEventListener("input", renderGames);
dateFilter.addEventListener("change", renderGames);

loadGames();