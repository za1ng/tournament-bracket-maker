const playerForm = document.getElementById("player-form");
const playerNameInput = document.getElementById("player-name");
const playerImageInput = document.getElementById("player-image");
const playerListEl = document.getElementById("player-list");
const generateBtn = document.getElementById("generate-bracket");
const bracketContainer = document.getElementById("bracket-container");

let players = [];
let rounds = [];

// Add players
playerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = playerNameInput.value.trim();
  const image = playerImageInput.value.trim();

  if (!name || !image) return;

  players.push({ id: Date.now() + Math.random(), name, image });
  renderPlayerList();
  playerForm.reset();
});

function renderPlayerList() {
  playerListEl.innerHTML = "";
  players.forEach((p, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${p.name}`;
    playerListEl.appendChild(li);
  });
}

// Generate bracket
generateBtn.addEventListener("click", () => {
  if (players.length < 2) {
    alert("You need at least 2 players to generate a bracket.");
    return;
  }

  rounds = [];
  const firstRound = createInitialMatches(players);
  rounds.push(firstRound);

  // Pre-create empty rounds until we reach the final
  let currentRound = firstRound;
  while (currentRound.length > 1) {
    const nextRound = currentRound.map(() => ({
      player1: null,
      player2: null,
      winner: null,
    }));
    rounds.push(nextRound);
    currentRound = nextRound;
  }

  renderBracket();
});

// Create initial matches from players list
function createInitialMatches(playerArray) {
  const matches = [];
  const shuffled = [...playerArray]; // you can shuffle if you want

  for (let i = 0; i < shuffled.length; i += 2) {
    const p1 = shuffled[i];
    const p2 = shuffled[i + 1] || null; // bye if odd number

    matches.push({
      player1: p1,
      player2: p2,
      winner: null,
    });
  }

  return matches;
}

// Render the whole bracket
function renderBracket() {
  bracketContainer.innerHTML = "";

  if (!rounds.length) {
    const p = document.createElement("p");
    p.className = "empty-text";
    p.textContent = "No bracket generated yet.";
    bracketContainer.appendChild(p);
    return;
  }

  rounds.forEach((round, roundIndex) => {
    const roundCol = document.createElement("div");
    roundCol.className = "round-column";

    const title = document.createElement("div");
    title.className = "round-title";
    title.textContent =
      roundIndex === rounds.length - 1
        ? "Final"
        : `Round ${roundIndex + 1}`;
    roundCol.appendChild(title);

    round.forEach((match, matchIndex) => {
      const matchCard = document.createElement("div");
      matchCard.className = "match-card";

      const slot1 = createPlayerSlot(
        match.player1,
        roundIndex,
        matchIndex,
        "player1",
        match.winner
      );
      const slot2 = createPlayerSlot(
        match.player2,
        roundIndex,
        matchIndex,
        "player2",
        match.winner
      );

      matchCard.appendChild(slot1);
      matchCard.appendChild(slot2);

      roundCol.appendChild(matchCard);
    });

    bracketContainer.appendChild(roundCol);
  });
}

// Create a clickable player slot
function createPlayerSlot(player, roundIndex, matchIndex, positionKey, winner) {
  const slot = document.createElement("div");
  slot.className = "player-slot";

  if (!player) {
    slot.classList.add("empty-text");
    slot.textContent = "BYE";
    return slot;
  }

  if (winner && winner.id === player.id) {
    slot.classList.add("winner");
  } else if (winner && winner.id !== player.id) {
    slot.classList.add("loser");
  }

  const imgWrapper = document.createElement("div");
  imgWrapper.className = "player-image-wrapper";

  const img = document.createElement("img");
  img.src = player.image;
  img.alt = player.name;

  imgWrapper.appendChild(img);

  const nameEl = document.createElement("div");
  nameEl.className = "player-name";
  nameEl.textContent = player.name;

  slot.appendChild(imgWrapper);
  slot.appendChild(nameEl);

  slot.addEventListener("click", () => {
    handleWinnerSelection(roundIndex, matchIndex, positionKey);
  });

  return slot;
}

// Handle winner selection and propagate to next round
function handleWinnerSelection(roundIndex, matchIndex, positionKey) {
  const match = rounds[roundIndex][matchIndex];
  const selectedPlayer = match[positionKey];

  if (!selectedPlayer) return;

  match.winner = selectedPlayer;

  // Put winner into next round
  const nextRoundIndex = roundIndex + 1;
  if (nextRoundIndex < rounds.length) {
    const nextMatchIndex = Math.floor(matchIndex / 2);
    const nextMatch = rounds[nextRoundIndex][nextMatchIndex];

    if (matchIndex % 2 === 0) {
      nextMatch.player1 = selectedPlayer;
    } else {
      nextMatch.player2 = selectedPlayer;
    }
  }

  renderBracket();
}
