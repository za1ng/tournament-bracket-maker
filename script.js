const form = document.getElementById("playerForm");
const bracketContainer = document.getElementById("bracketContainer");
const generateBtn = document.getElementById("generateBracket");

let players = [];
let rounds = [];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("playerName").value;
  const file = document.getElementById("playerImage").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    players.push({ id: Date.now(), name, image: reader.result });
    form.reset();
  };
  reader.readAsDataURL(file);
});

generateBtn.addEventListener("click", () => {
  if (players.length < 2) {
    alert("Add at least two players!");
    return;
  }
  rounds = [createMatches(players)];
  while (rounds[rounds.length - 1].length > 1) {
    rounds.push(rounds[rounds.length - 1].map(() => ({ p1: null, p2: null, winner: null })));
  }
  renderBracket();
});

function createMatches(arr) {
  const matches = [];
  for (let i = 0; i < arr.length; i += 2) {
    matches.push({ p1: arr[i], p2: arr[i + 1] || null, winner: null });
  }
  return matches;
}

function renderBracket() {
  bracketContainer.innerHTML = "";
  rounds.forEach((round, rIndex) => {
    const roundDiv = document.createElement("div");
    roundDiv.className = "round";
    round.forEach((match, mIndex) => {
      const matchDiv = document.createElement("div");
      matchDiv.className = "match";
      matchDiv.appendChild(createPlayer(match.p1, rIndex, mIndex, "p1", match.winner));
      matchDiv.appendChild(createPlayer(match.p2, rIndex, mIndex, "p2", match.winner));
      roundDiv.appendChild(matchDiv);
    });
    bracketContainer.appendChild(roundDiv);
  });
}

function createPlayer(player, rIndex, mIndex, key, winner) {
  const div = document.createElement("div");
  div.className = "player";
  if (!player) {
    div.textContent = "BYE";
    return div;
  }

  if (winner && winner.id === player.id) div.classList.add("winner");
  else if (winner && winner.id !== player.id) div.classList.add("loser");

  const img = document.createElement("img");
  img.src = player.image;
  const name = document.createElement("span");
  name.textContent = player.name;

  div.appendChild(img);
  div.appendChild(name);

  div.addEventListener("click", () => {
    handleWinner(rIndex, mIndex, key);
  });

  return div;
}

function handleWinner(rIndex, mIndex, key) {
  const match = rounds[rIndex][mIndex];
  const selected = match[key];
  if (!selected) return;
  match.winner = selected;

  const nextRound = rounds[rIndex + 1];
  if (nextRound) {
    const nextMatch = nextRound[Math.floor(mIndex / 2)];
    if (mIndex % 2 === 0) nextMatch.p1 = selected;
    else nextMatch.p2 = selected;
  }
  renderBracket();
}
