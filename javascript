
let coins = 0;
let totalEarned = 0;
let coinsPerClick = 1;
let coinsPerSecond = 0;
let owned = {};
let achievements = [];

const buildings = [
    {id:"baby", name:"Baby Duck", icon:"🐣", base:15, cps:0.2, desc:"A tiny duck that makes coins."},
    {id:"pond", name:"Duck Pond", icon:"🏞️", base:100, cps:1, desc:"A pond full of happy ducks."},
    {id:"farm", name:"Duck Farm", icon:"🌾", base:500, cps:5, desc:"Raises hundreds of ducks."},
    {id:"factory", name:"Duck Factory", icon:"🏭", base:2500, cps:20, desc:"Industrial duck production!"},
    {id:"army", name:"Duck Army", icon:"🪖", base:12000, cps:75, desc:"An army of coin-making ducks."},
    {id:"scientist", name:"Duck Scientists", icon:"🔬", base:60000, cps:300, desc:"Science makes more ducks!"},
    {id:"golden", name:"Golden Duck", icon:"🌟", base:300000, cps:1500, desc:"A legendary golden duck."},
    {id:"dimension", name:"Duck Dimension", icon:"🌀", base:1500000, cps:8000, desc:"Ducks from another universe."}
];

function format(number) {
    if (number >= 1e12) return (number / 1e12).toFixed(2) + "T";
    if (number >= 1e9) return (number / 1e9).toFixed(2) + "B";
    if (number >= 1e6) return (number / 1e6).toFixed(2) + "M";
    if (number >= 1000) return (number / 1000).toFixed(2) + "K";
    return Math.floor(number).toLocaleString();
}

function getCost(building) {
    return Math.floor(building.base * Math.pow(1.15, owned[building.id] || 0));
}

function updateStats() {
    document.getElementById("coins").textContent = format(coins);
    document.getElementById("perSecond").textContent = format(coinsPerSecond);
    document.getElementById("perClick").textContent = format(coinsPerClick);
}

function calculateProduction() {
    coinsPerSecond = 0;

    buildings.forEach(building => {
        coinsPerSecond += (owned[building.id] || 0) * building.cps;
    });

    updateStats();
}

function clickDuck() {
    coins += coinsPerClick;
    totalEarned += coinsPerClick;

    showFloatingText("+" + format(coinsPerClick) + " 🪙");
    checkAchievements();
    updateStats();
    updateShop();
}

function showFloatingText(message) {
    const element = document.getElementById("floatingText");
    element.textContent = message;

    element.animate([
        { transform: "translate(-50%, 0)", opacity: 1 },
        { transform: "translate(-50%, -65px)", opacity: 0 }
    ], {
        duration: 700
    });
}

function buyBuilding(id) {
    const building = buildings.find(item => item.id === id);
    const cost = getCost(building);

    if (coins < cost) return;

    coins -= cost;
    owned[id] = (owned[id] || 0) + 1;

    calculateProduction();
    updateShop();
    updateStats();
    checkAchievements();
}

function buyClickUpgrade() {
    const cost = Math.floor(50 * Math.pow(2, coinsPerClick - 1));

    if (coins < cost) return;

    coins -= cost;
    coinsPerClick *= 2;

    updateShop();
    updateStats();
    checkAchievements();
}

function updateShop() {
    const shop = document.getElementById("shopItems");

    let html = `
        <div class="shop-item">
            <div class="shop-icon">👆</div>
            <div class="shop-info">
                <strong>Stronger Clicking</strong>
                <span>Double your coins per click!</span>
                <span>Owned level: ${Math.log2(coinsPerClick)}</span>
            </div>
            <button class="buy-button" onclick="buyClickUpgrade()" ${coins < Math.floor(50 * Math.pow(2, coinsPerClick - 1)) ? "disabled" : ""}>
                ${format(Math.floor(50 * Math.pow(2, coinsPerClick - 1)))} 🪙
            </button>
        </div>
    `;

    buildings.forEach(building => {
        const cost = getCost(building);
        const count = owned[building.id] || 0;

        html += `
            <div class="shop-item">
                <div class="shop-icon">${building.icon}</div>
                <div class="shop-info">
                    <strong>${building.name}</strong>
                    <span>${building.desc}</span>
                    <span>Owned: ${count} | +${building.cps} coins/sec each</span>
                </div>
                <button class="buy-button"
                    onclick="buyBuilding('${building.id}')"
                    ${coins < cost ? "disabled" : ""}>
                    ${format(cost)} 🪙
                </button>
            </div>
        `;
    });

    shop.innerHTML = html;
}

const achievementList = [
    {id:"first", name:"First Duck!", test:() => totalEarned >= 1},
    {id:"hundred", name:"Duck Collector", test:() => totalEarned >= 100},
    {id:"thousand", name:"Duck Millionaire (Almost)", test:() => totalEarned >= 1000},
    {id:"farm", name:"Farmer Duck", test:() => (owned.farm || 0) >= 1},
    {id:"army", name:"Duck Commander", test:() => (owned.army || 0) >= 1},
    {id:"factory", name:"Industrial Ducks", test:() => (owned.factory || 0) >= 1},
    {id:"golden", name:"Golden Glory", test:() => (owned.golden || 0) >= 1},
    {id:"rich", name:"Duck Tycoon", test:() => totalEarned >= 1000000}
];

function checkAchievements() {
    achievementList.forEach(achievement => {
        if (!achievements.includes(achievement.id) && achievement.test()) {
            achievements.push(achievement.id);
            showFloatingText("🏆 " + achievement.name);
        }
    });

    updateAchievements();
}

function updateAchievements() {
    const element = document.getElementById("achievements");

    if (achievements.length === 0) {
        element.textContent = "No achievements yet!";
        return;
    }

    element.innerHTML = achievements.map(id => {
        const achievement = achievementList.find(a => a.id === id);
        return `<span class="achievement">🏆 ${achievement.name}</span>`;
    }).join("");
}

// Golden duck bonus
let goldenDuck = null;

function spawnGoldenDuck() {
    if (goldenDuck) return;

    const pond = document.querySelector(".pond");
    goldenDuck = document.createElement("button");

    goldenDuck.textContent = "🌟🦆";
    goldenDuck.style.position = "absolute";
    goldenDuck.style.zIndex = "6";
    goldenDuck.style.fontSize = "45px";
    goldenDuck.style.background = "transparent";
    goldenDuck.style.border = "none";
    goldenDuck.style.cursor = "pointer";
    goldenDuck.style.left = (15 + Math.random() * 65) + "%";
    goldenDuck.style.top = (15 + Math.random() * 45) + "%";

    goldenDuck.onclick = function() {
        const bonus = Math.max(100, coinsPerSecond * 60 + coinsPerClick * 100);

        coins += bonus;
        totalEarned += bonus;

        goldenDuck.remove();
        goldenDuck = null;

        showFloatingText("GOLDEN BONUS! +" + format(bonus));
        checkAchievements();
        updateStats();
        updateShop();
    };

    pond.appendChild(goldenDuck);

    setTimeout(() => {
        if (goldenDuck) {
            goldenDuck.remove();
            goldenDuck = null;
        }
    }, 10000);
}

function saveGame() {
    const data = {
        coins,
        totalEarned,
        coinsPerClick,
        owned,
        achievements,
        lastSaved: Date.now()
    };

    localStorage.setItem("duckClickerSave", JSON.stringify(data));
}

function loadGame() {
    const saved = localStorage.getItem("duckClickerSave");

    if (!saved) return;

    try {
        const data = JSON.parse(saved);

        coins = Math.max(0, Number(data.coins) || 0);
        totalEarned = Math.max(0, Number(data.totalEarned) || 0);
        coinsPerClick = Math.max(1, Number(data.coinsPerClick) || 1);
        owned = data.owned || {};
        achievements = data.achievements || [];

        const elapsed = Math.min(
            8 * 60 * 60,
            Math.max(0, (Date.now() - (data.lastSaved || Date.now())) / 1000)
        );

        calculateProduction();
        const offlineCoins = coinsPerSecond * elapsed;

        coins += offlineCoins;
        totalEarned += offlineCoins;

        if (offlineCoins > 0) {
            alert("Welcome back! Your ducks earned " + format(offlineCoins) + " coins while you were away!");
        }
    } catch (error) {
        console.warn("Could not load Duck Clicker save.", error);
    }
}

document.getElementById("bigDuck").addEventListener("click", clickDuck);

document.getElementById("saveButton").addEventListener("click", () => {
    saveGame();
    alert("🦆 Game saved!");
});

document.getElementById("resetButton").addEventListener("click", () => {
    if (!confirm("Are you sure you want to reset your entire Duck Empire?")) return;

    localStorage.removeItem("duckClickerSave");

    coins = 0;
    totalEarned = 0;
    coinsPerClick = 1;
    coinsPerSecond = 0;
    owned = {};
    achievements = [];

    calculateProduction();
    updateStats();
    updateShop();
    updateAchievements();
});

loadGame();
calculateProduction();
updateStats();
updateShop();
updateAchievements();

// Automatic production
setInterval(() => {
    coins += coinsPerSecond;
    totalEarned += coinsPerSecond;

    updateStats();
    updateShop();
    checkAchievements();
}, 1000);

// Automatic saving
setInterval(saveGame, 5000);

// Golden duck appears randomly
setInterval(() => {
    if (Math.random() < 0.45) {
        spawnGoldenDuck();
    }
}, 15000);
