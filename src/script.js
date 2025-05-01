import {
  missions,
  shopItems,
  achievements,
  levelUpRewards,
  uiMessages,
} from "./misi.js";

// Game variables
let currentMission = "";
let currentCategory = "";
let xp = parseInt(localStorage.getItem("xp")) || 0;
let level = parseInt(localStorage.getItem("level")) || 1;
let streak = parseInt(localStorage.getItem("streak")) || 0;
let points = parseInt(localStorage.getItem("points")) || 0;
let totalMissions = parseInt(localStorage.getItem("totalMissions")) || 0;
let weeklyMissions = parseInt(localStorage.getItem("weeklyMissions")) || 0;
let highestStreak = parseInt(localStorage.getItem("highestStreak")) || 0;
let lastLogin = localStorage.getItem("lastLogin") || new Date().toDateString();
let lastWeekReset =
  localStorage.getItem("lastWeekReset") || new Date().toDateString();
let dailyMissions = parseInt(localStorage.getItem("dailyMissions")) || 0;
let lastDayReset =
  localStorage.getItem("lastDayReset") || new Date().toDateString();
let completedCategories =
  JSON.parse(localStorage.getItem("completedCategories")) || [];
let activeItems = JSON.parse(localStorage.getItem("activeItems")) || [];
let unlockedAchievements =
  JSON.parse(localStorage.getItem("unlockedAchievements")) || [];

// UI Functions
function updateStats() {
  document.getElementById("points").innerText = points;
  document.getElementById("level").innerText = level;
  document.getElementById("xp").innerText = xp;
  document.getElementById("nextXP").innerText = level * 100;
  document.getElementById("streakCount").innerText = streak;
  document.getElementById("totalMissions").innerText = totalMissions;
  document.getElementById("highestStreak").innerText = highestStreak;
  document.getElementById("totalPoints").innerText = points;

  // Update XP bar
  const nextLevelXP = level * 100;
  const progress = (xp / nextLevelXP) * 100;
  document.getElementById("xpBar").style.width = `${progress}%`;

  // Update streak bar
  const streakProgress = ((streak % 7) / 7) * 100;
  document.getElementById("streakBar").style.width = `${streakProgress}%`;

  // Update weekly progress
  updateWeeklyProgress();
}

function updateWeeklyProgress() {
  const weeklyTarget = 5;
  const progress = (weeklyMissions / weeklyTarget) * 100;
  document.getElementById("weeklyCount").innerText = weeklyMissions;
  document.getElementById("weeklyTarget").innerText = weeklyTarget;
  document.getElementById("weeklyBar").style.width = `${progress}%`;
}

// Mission Functions
function generateMission() {
  const categories = Object.keys(missions);
  let category;

  if (level < 3) {
    const starterCategories = ["health", "social"];
    category =
      starterCategories[Math.floor(Math.random() * starterCategories.length)];
  } else {
    category = categories[Math.floor(Math.random() * categories.length)];
  }

  const missionsList = missions[category];
  const mission = missionsList[Math.floor(Math.random() * missionsList.length)];

  document.getElementById("missionText").innerText = mission;
  currentMission = mission;
  currentCategory = category;

  // Add animation
  const missionBox = document.getElementById("missionBox");
  missionBox.classList.remove("bounce-in");
  void missionBox.offsetWidth;
  missionBox.classList.add("bounce-in");
}

function completeMission() {
  // Calculate rewards
  let earnedXP = 10;
  let earnedPoints = 5;

  if (hasActiveEffect("doubleXP")) {
    earnedXP *= 2;
    earnedPoints *= 1.5;
  }

  // Apply streak bonus
  if (streak >= 3) {
    const streakBonus = Math.min((streak - 2) * 0.1, 0.5);
    earnedXP = Math.round(earnedXP * (1 + streakBonus));
    earnedPoints = Math.round(earnedPoints * (1 + streakBonus));
  }

  // Update stats
  xp += earnedXP;
  points += earnedPoints;
  totalMissions++;
  weeklyMissions++;
  dailyMissions++;

  // Check level up
  const nextLevelXP = level * 100;
  if (xp >= nextLevelXP) {
    levelUp();
  }

  // Save progress
  saveProgress();

  // Update UI
  updateStats();
  generateMission();
  createConfetti();

  // Check achievements
  checkAchievements();
}

function skipMission() {
  if (hasActiveEffect("streakFreeze")) {
    removeEffect("streakFreeze");
  } else {
    streak = 0;
  }

  generateMission();
  updateStats();
  saveProgress();
}

// Level & Achievement Functions
function levelUp() {
  level++;
  xp = xp - (level - 1) * 100;

  // Show level up modal
  document.getElementById("popUpLevel").innerText = level;
  document.getElementById("popUpLevelText").innerText = level;

  // Update rewards
  if (levelUpRewards[level]) {
    document.getElementById("levelReward1").innerText =
      levelUpRewards[level][0];
    document.getElementById("levelReward2").innerText =
      levelUpRewards[level][1];
    points += parseInt(levelUpRewards[level][1].match(/\d+/)[0]);
  }

  document.getElementById("levelUpModal").classList.remove("hidden");
  createConfetti();
}

function checkAchievements() {
  // First mission
  if (totalMissions === 1) {
    unlockAchievement("firstMission");
  }

  // Streak achievements
  if (streak >= 7 && !hasAchievement("streak7")) {
    unlockAchievement("streak7");
  }

  // Points achievements
  if (points >= 100 && !hasAchievement("points100")) {
    unlockAchievement("points100");
  }
}

function unlockAchievement(id) {
  const achievement = achievements.find((a) => a.id === id);
  if (!achievement || hasAchievement(id)) return;

  unlockedAchievements.push(id);
  points += achievement.coins || 0;
  xp += achievement.xp || 0;

  document.getElementById("achievementName").innerText = achievement.name;
  document.getElementById("achievementDesc").innerText = achievement.desc;
  document.getElementById("achievementModal").classList.remove("hidden");

  saveProgress();
  updateAchievementsList();
}

// Shop Functions
function initializeShop() {
  const container = document.getElementById("shopItems");
  container.innerHTML = "";

  shopItems.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className =
      "bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer";
    itemElement.onclick = () => buyItem(item.id);

    itemElement.innerHTML = `
      <div class="text-lg mb-1">${item.name}</div>
      <p class="text-xs text-gray-300 mb-2">${item.desc}</p>
      <p class="text-sm"><i class="fas fa-gem text-violet-400 mr-1"></i>${item.cost}</p>
    `;

    container.appendChild(itemElement);
  });
}

function buyItem(itemId) {
  const item = shopItems.find((i) => i.id === itemId);
  if (!item) return;

  if (points >= item.cost) {
    points -= item.cost;

    if (item.effect === "instantUse") {
      handleInstantEffect(item);
    } else {
      activeItems.push({
        id: item.id,
        effect: item.effect,
        duration: item.duration || 1,
      });
    }

    document.getElementById("purchaseSuccess").classList.remove("hidden");
    document.getElementById("purchaseFailed").classList.add("hidden");
  } else {
    document.getElementById("purchaseSuccess").classList.add("hidden");
    document.getElementById("purchaseFailed").classList.remove("hidden");
  }

  document.getElementById("purchaseModal").classList.remove("hidden");
  saveProgress();
  updateStats();
}

// Helper Functions
function handleInstantEffect(item) {
  switch (item.id) {
    case "mission_reroll":
      generateMission();
      break;
    case "bonus_xp":
      xp += 50;
      break;
  }
}

function hasActiveEffect(effect) {
  return activeItems.some((item) => item.effect === effect);
}

function removeEffect(effect) {
  activeItems = activeItems.filter((item) => item.effect !== effect);
  saveProgress();
}

function hasAchievement(id) {
  return unlockedAchievements.includes(id);
}

function saveProgress() {
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
  localStorage.setItem("streak", streak);
  localStorage.setItem("points", points);
  localStorage.setItem("totalMissions", totalMissions);
  localStorage.setItem("weeklyMissions", weeklyMissions);
  localStorage.setItem("highestStreak", highestStreak);
  localStorage.setItem("dailyMissions", dailyMissions);
  localStorage.setItem("lastLogin", lastLogin);
  localStorage.setItem("lastWeekReset", lastWeekReset);
  localStorage.setItem("lastDayReset", lastDayReset);
  localStorage.setItem(
    "completedCategories",
    JSON.stringify(completedCategories)
  );
  localStorage.setItem("activeItems", JSON.stringify(activeItems));
  localStorage.setItem(
    "unlockedAchievements",
    JSON.stringify(unlockedAchievements)
  );
}

// Modal Functions
function closePopUp() {
  document.getElementById("levelUpModal").classList.add("hidden");
}

function closePurchaseModal() {
  document.getElementById("purchaseModal").classList.add("hidden");
}

function closeAchievementModal() {
  document.getElementById("achievementModal").classList.add("hidden");
}

// Share Functions
function shareToWhatsApp() {
  const text = `🎮 IRLPlay Stats:\n🌟 Level ${level}\n🔥 Streak: ${streak} hari\n✨ Total Misi: ${totalMissions}\n\nGas main bareng!`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

function shareToTelegram() {
  const text = `🎮 IRLPlay Stats:\n🌟 Level ${level}\n🔥 Streak: ${streak} hari\n✨ Total Misi: ${totalMissions}\n\nGas main bareng!`;
  window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(text)}`);
}

function shareToInstagram() {
  alert("Fitur share ke Instagram story akan segera hadir!");
}

// Initialize game
window.onload = function () {
  checkDailyReset();
  checkWeeklyReset();
  generateMission();
  updateStats();
  initializeShop();
  updateAchievementsList();

  // Make functions available globally
  window.completeMission = completeMission;
  window.skipMission = skipMission;
  window.generateMission = generateMission;
  window.closePopUp = closePopUp;
  window.closePurchaseModal = closePurchaseModal;
  window.closeAchievementModal = closeAchievementModal;
  window.shareToWhatsApp = shareToWhatsApp;
  window.shareToTelegram = shareToTelegram;
  window.shareToInstagram = shareToInstagram;
};

// Daily & Weekly Reset Functions
function checkDailyReset() {
  const today = new Date().toDateString();
  if (lastDayReset !== today) {
    dailyMissions = 0;
    lastDayReset = today;
    saveProgress();
  }
}

function checkWeeklyReset() {
  const today = new Date();
  const lastReset = new Date(lastWeekReset);
  const diffDays = Math.floor((today - lastReset) / (1000 * 60 * 60 * 24));

  if (diffDays >= 7) {
    weeklyMissions = 0;
    lastWeekReset = today.toDateString();
    saveProgress();
  }
}

// Confetti Animation
function createConfetti() {
  const container = document.getElementById("confettiContainer");
  container.innerHTML = "";

  const colors = [
    "#7c3aed",
    "#6d28d9",
    "#10b981",
    "#f59e0b",
    "#3b82f6",
    "#ec4899",
  ];

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDelay = Math.random() * 3 + "s";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    container.appendChild(confetti);
  }

  setTimeout(() => {
    container.innerHTML = "";
  }, 5000);
}

function updateAchievementsList() {
  const container = document.getElementById("achievementsList");
  container.innerHTML = "";

  achievements.forEach((achievement) => {
    const isUnlocked = hasAchievement(achievement.id);
    const element = document.createElement("div");
    element.className = `achievement-item bg-gray-800/50 rounded-lg p-3 ${
      isUnlocked ? "unlocked" : "locked"
    }`;

    element.innerHTML = `
      <div class="flex items-center">
        <div class="text-2xl mr-3">${isUnlocked ? "🏆" : "🔒"}</div>
        <div>
          <p class="font-bold ${
            isUnlocked ? "text-amber-300" : "text-gray-500"
          }">${achievement.name}</p>
          <p class="text-xs ${
            isUnlocked ? "text-gray-300" : "text-gray-600"
          }">${achievement.desc}</p>
        </div>
      </div>
    `;

    container.appendChild(element);
  });
  shop;
  // Data item shop
  const shopItems = [
    {
      id: 1,
      name: "Double XP (30 Menit)",
      description: "2x lipat XP selama 30 menit",
      price: 50,
      icon: "bolt-lightning",
    },
    {
      id: 2,
      name: "Streak Freeze",
      description: "Jaga streak 1 hari saat tidak main",
      price: 100,
      icon: "shield-halved",
    },
    {
      id: 3,
      name: "Skip Cooldown",
      description: "Langsung main misi baru",
      price: 75,
      icon: "forward",
    },
  ];

  // Fungsi untuk konfirmasi pembelian item
  function confirmBuyItem(itemId) {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return;

    const currentPoints = parseInt(localStorage.getItem("points") || "0");

    // Cek koin cukup
    if (currentPoints < item.price) {
      alert("Koin kamu tidak cukup! 😅");
      return;
    }

    // Tampilkan dialog konfirmasi
    const confirmDialog = document.createElement("div");
    confirmDialog.className =
      "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
    confirmDialog.innerHTML = `
    <div class="bg-white rounded-xl p-6 max-w-xs w-full mx-4">
      <h3 class="text-lg font-semibold mb-2">Konfirmasi Pembelian</h3>
      <p class="text-gray-600 mb-4">Yakin mau beli ${item.name} dengan ${item.price} koin?</p>
      <div class="flex gap-2">
        <button onclick="processBuyItem(${item.id})" class="flex-1 bg-[#EC4899] text-white rounded-lg py-2 px-4 hover:bg-[#FB7185] transition-colors">
          Beli
        </button>
        <button onclick="closeConfirmDialog()" class="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 px-4 hover:bg-gray-300 transition-colors">
          Batal
        </button>
      </div>
    </div>
  `;
    document.body.appendChild(confirmDialog);
  }

  // Fungsi untuk menutup dialog konfirmasi
  function closeConfirmDialog() {
    const dialog = document.querySelector(".fixed.inset-0");
    if (dialog) {
      dialog.remove();
    }
  }

  // Fungsi untuk memproses pembelian
  function processBuyItem(itemId) {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return;

    const currentPoints = parseInt(localStorage.getItem("points") || "0");

    // Kurangi koin
    localStorage.setItem("points", (currentPoints - item.price).toString());

    // Tambah item ke inventory
    const inventory = JSON.parse(localStorage.getItem("inventory") || "[]");
    inventory.push({
      itemId: item.id,
      purchaseDate: Date.now(),
      used: false,
    });
    localStorage.setItem("inventory", JSON.stringify(inventory));

    // Update tampilan
    displayShopItems();
    updatePoints();

    // Tutup dialog dan tampilkan pesan sukses
    closeConfirmDialog();
    alert(`Berhasil membeli ${item.name}! 🎉`);
  }

  // Update tampilan shop items
  function displayShopItems() {
    const shopContainer = document.getElementById("shopItems");
    if (!shopContainer) return;

    const currentPoints = parseInt(localStorage.getItem("points") || "0");

    shopContainer.innerHTML = shopItems
      .map(
        (item) => `
    <div class="bg-[#F8F9FA] rounded-lg p-3 relative group cursor-pointer" onclick="confirmBuyItem(${
      item.id
    })">
      <i class="fas fa-${item.icon} text-[#EC4899] text-xl mb-2"></i>
      <h3 class="font-medium text-sm">${item.name}</h3>
      <p class="text-xs text-gray-500 mb-2">${item.description}</p>
      <div class="w-full bg-[#EC4899] text-white text-xs rounded py-1.5 px-3 hover:bg-[#FB7185] transition-colors ${
        currentPoints < item.price ? "opacity-50" : ""
      }">
        <i class="fas fa-coins mr-1"></i>${item.price} Koin
      </div>
    </div>
  `
      )
      .join("");
  }

  // Fungsi untuk update points
  function updatePoints() {
    const pointsElement = document.getElementById("points");
    if (pointsElement) {
      pointsElement.textContent = localStorage.getItem("points") || "0";
    }
  }

  // Tambahkan ke event listener
  document.addEventListener("DOMContentLoaded", () => {
    displayShopItems();
    updateStats();
    saveProgress();
  });

  // Expose fungsi ke window untuk bisa dipanggil dari onclick
  window.buyItem = buyItem;
  window.useItem = useItem;
  window.confirmBuyItem = confirmBuyItem;
  window.closeConfirmDialog = closeConfirmDialog;
  window.processBuyItem = processBuyItem;
}
