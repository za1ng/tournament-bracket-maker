let roster = [];
let stagedImg = null;
let activeMatchNode = null;
let isLive = false;

// Image Reader File Encoding
document.getElementById('playerImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            stagedImg = ev.target.result;
            document.getElementById('imagePreview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// Add Competitor Click Event
document.getElementById('addPlayerBtn').addEventListener('click', () => {
    const nameField = document.getElementById('playerName');
    const name = nameField.value.trim();
    if(!name) return;

    roster.push({
        name: name,
        image: stagedImg || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80"
    });

    nameField.value = "";
    stagedImg = null;
    document.getElementById('imagePreview').classList.add('hidden');
    renderSeedingInterface();
});

// Render Sortable Seeding View Inside Sidebar 
function renderSeedingInterface() {
    const zone = document.getElementById('seedZone');
    zone.innerHTML = "";
    roster.forEach((player, idx) => {
        const div = document.createElement('div');
        div.className = "flex items-center justify-between bg-[#1e1e24] p-2 border border-gray-800 rounded select-none";
        div.innerHTML = `
            <div class="flex items-center gap-2 truncate">
                <span class="text-xs text-gray-500 font-bold w-4">${idx + 1}</span>
                <img src="${player.image}" class="w-5 h-5 rounded object-cover">
                <span class="truncate text-xs">${player.name}</span>
            </div>
            <div class="flex gap-1">
                <button onclick="moveSeed(${idx}, -1)" class="text-gray-400 hover:text-white px-1 font-bold">▲</button>
                <button onclick="moveSeed(${idx}, 1)" class="text-gray-400 hover:text-white px-1 font-bold">▼</button>
            </div>
        `;
        zone.appendChild(div);
    });
}

window.moveSeed = function(index, direction) {
    let target = index + direction;
    if(target < 0 || target >= roster.length) return;
    let temporary = roster[index];
    roster[index] = roster[target];
    roster[target] = temporary;
    renderSeedingInterface();
};

// Lock Seeds & Calculate Bracket Architecture Structure 
document.getElementById('lockBracketBtn').addEventListener('click', () => {
    if(roster.length < 2) return alert("Add at least 2 competitors!");
    isLive = true;
    document.getElementById('statusBadge').className = "text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded";
    document.getElementById('statusBadge').innerText = "Live Tournament";
    document.getElementById('sidebarPanel').classList.add('opacity-50', 'pointer-events-none');

    buildBracketGraph();
});

function buildBracketGraph() {
    const N = roster.length;
    let nextPow2 = 1;
    while(nextPow2 < N) nextPow2 *= 2;

    const totalByes = nextPow2 - N;
    
    let pool = [...roster];
    let prelimCompetitors = pool.splice(totalByes);

    let r0Matches = [];
    for(let i = 0; i < prelimCompetitors.length; i += 2) {
        r0Matches.push({ p1: prelimCompetitors[i], p2: prelimCompetitors[i+1] || null });
    }

    const container = document.getElementById('bracketDisplay');
    container.innerHTML = "";

    // Column Round 0 (Prelims)
    if(r0Matches.length > 0) {
        const col0 = document.createElement('div');
        col0.className = "round-column";
        r0Matches.forEach((m, idx) => {
            col0.appendChild(createMatchNode(m.p1, m.p2, `r0-m${idx}`, "r1-slot-" + idx));
        });
        container.appendChild(col0);
    }

    // Column Round 1
    const col1 = document.createElement('div');
    col1.className = "round-column";
    const mainRoundMatches = nextPow2 / 2;
    let byePointer = 0;
    let prelimPointer = 0;

    for(let i = 0; i < mainRoundMatches; i++) {
        let p1 = null;
        let p2 = null;
        let isWaitingSlot = false;

        if(byePointer < pool.length) {
            p1 = pool[byePointer++];
        } else {
            isWaitingSlot = true;
        }

        const node = createMatchNode(p1, p2, `r1-m${i}`, `r2-slot-${Math.floor(i/2)}`);
        if(isWaitingSlot) {
            node.setAttribute('data-target-prelim-id', `r1-slot-${prelimPointer++}`);
        }
        col1.appendChild(node);
    }
    container.appendChild(col1);

    // Dynamic Extra Round Generation
    let currentColumnSlotsCount = mainRoundMatches;
    let roundCounter = 2;

    while(currentColumnSlotsCount > 1) {
        currentColumnSlotsCount /= 2;
        const nextCol = document.createElement('div');
        nextCol.className = "round-column";
        
        for(let i = 0; i < currentColumnSlotsCount; i++) {
            const isFinalNode = (currentColumnSlotsCount === 1);
            const node = createMatchNode(null, null, `r${roundCounter}-m${i}`, `r${roundCounter+1}-slot-${Math.floor(i/2)}`);
            
            if(isFinalNode) {
                node.classList.add('final-champ-node');
            }
            nextCol.appendChild(node);
        }
        container.appendChild(nextCol);
        roundCounter++;
    }
}

function createMatchNode(p1, p2, matchId, targetSlotCode) {
    const wrapper = document.createElement('div');
    wrapper.className = "match-box my-4 select-none duration-150 hover:scale-[1.02]";
    wrapper.id = matchId;
    wrapper.setAttribute('data-target-slot', targetSlotCode);

    wrapper.innerHTML = `
        <div class="team-slot p-2 flex items-center justify-between border-b border-gray-800 cursor-pointer hover:bg-gray-800 rounded-t" onclick="openScoreReporting(this, 1)">
            <div class="flex items-center gap-2 truncate">
                <img src="${p1 ? p1.image : 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%234b5563\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><rect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\' ry=\'2\'/><circle cx=\'8.5\' cy=\'8.5\' r=\'1.5\'/><polyline points=\'21 15 16 10 5 21\'/></svg>'}" class="w-6 h-6 rounded object-cover bg-gray-800">
                <span class="text-xs font-medium tracking-wide ${p1 ? 'text-white' : 'text-gray-500 italic'}">${p1 ? p1.name : 'TBD'}</span>
            </div>
            <span class="score-display text-xs font-bold text-blue-400 px-1"></span>
        </div>
        <div class="team-slot p-2 flex items-center justify-between cursor-pointer hover:bg-gray-800 rounded-b" onclick="openScoreReporting(this, 2)">
            <div class="flex items-center gap-2 truncate">
                <img src="${p2 ? p2.image : 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%234b5563\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><rect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\' ry=\'2\'/><circle cx=\'8.5\' cy=\'8.5\' r=\'1.5\'/><polyline points=\'21 15 16 10 5 21\'/></svg>'}" class="w-6 h-6 rounded object-cover bg-gray-800">
                <span class="text-xs font-medium tracking-wide ${p2 ? 'text-white' : 'text-gray-500 italic'}">${p2 ? p2.name : 'TBD'}</span>
            </div>
            <span class="score-display text-xs font-bold text-blue-400 px-1"></span>
        </div>
    `;
    return wrapper;
}

window.openScoreReporting = function(element, slotNumber) {
    if(!isLive) return;
    activeMatchNode = element.closest('.match-box');
    
    const rows = activeMatchNode.querySelectorAll('.team-slot');
    const name1 = rows[0].querySelector('span').innerText;
    const img1 = rows[0].querySelector('img').src;
    const name2 = rows[1].querySelector('span').innerText;
    const img2 = rows[1].querySelector('img').src;

    if(name1 === 'TBD' && name2 === 'TBD') return;

    document.getElementById('modalName1').innerText = name1;
    document.getElementById('modalImg1').src = img1;
    document.getElementById('modalName2').innerText = name2;
    document.getElementById('modalImg2').src = img2;

    document.getElementById('score1').value = "0";
    document.getElementById('score2').value = "0";

    document.getElementById('scoreModal').style.display = 'flex';
};

window.closeModal = function() {
    document.getElementById('scoreModal').style.display = 'none';
};

document.getElementById('submitScoresBtn').addEventListener('click', () => {
    const s1 = parseInt(document.getElementById('score1').value) || 0;
    const s2 = parseInt(document.getElementById('score2').value) || 0;

    if(s1 === s2) return alert("Matches cannot end in a draw! Declare a winner.");

    const rows = activeMatchNode.querySelectorAll('.team-slot');
    rows[0].querySelector('.score-display').innerText = s1;
    rows[1].querySelector('.score-display').innerText = s2;

    const winningSlot = (s1 > s2) ? rows[0] : rows[1];
    const winnerName = winningSlot.querySelector('span').innerText;
    const winnerImg = winningSlot.querySelector('img').src;

    rows[0].querySelector('span').className = (s1 > s2) ? "text-emerald-400 font-bold text-xs" : "text-gray-600 line-through text-xs";
    rows[1].querySelector('span').className = (s2 > s1) ? "text-emerald-400 font-bold text-xs" : "text-gray-600 line-through text-xs";

    advanceWinnerToNextTarget(activeMatchNode, winnerName, winnerImg);
    closeModal();
});

function advanceWinnerToNextTarget(matchNode, name, img) {
    const targetSlotCode = matchNode.getAttribute('data-target-slot');
    const parentContainer = matchNode.parentElement.parentElement;
    
    const isPrelimRound = matchNode.id.startsWith('r0-');
    let targetNode = null;

    if(isPrelimRound) {
        const prelimIdMarker = matchNode.id.replace('r0-m', 'r1-slot-');
        targetNode = parentContainer.querySelector(`[data-target-prelim-id="${prelimIdMarker}"]`);
        if(targetNode) {
            const slots = targetNode.querySelectorAll('.team-slot');
            slots[1].querySelector('img').src = img;
            slots[1].querySelector('span').innerText = name;
            slots[1].querySelector('span').className = "text-white text-xs font-medium";
            return;
        }
    }

    const matchIndexNumber = parseInt(matchNode.id.split('-m')[1]);
    const targetMatchId = matchNode.id.replace(/r(\d+)-m\d+/, (m, round) => `r${parseInt(round)+1}-m${Math.floor(matchIndexNumber/2)}`);
    
    targetNode = parentContainer.querySelector(`#${targetMatchId}`);

    if(targetNode) {
        const slots = targetNode.querySelectorAll('.team-slot');
        const targetSlotPosition = (matchIndexNumber % 2 === 0) ? 0 : 1;
        
        slots[targetSlotPosition].querySelector('img').src = img;
        slots[targetSlotPosition].querySelector('span').innerText = name;
        slots[targetSlotPosition].querySelector('span').className = "text-white text-xs font-medium";
    } else {
        alert(`🎉 Tournament Over! ${name} is the champion!`);
    }
}
