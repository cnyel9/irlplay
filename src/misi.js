// Data misi untuk setiap kategori
export const missions = {
  health: [
    "Jogging 15 menit pagi ini",
    "Minum 2 liter air hari ini", 
    "Stretching 10 menit sebelum tidur",
    "Makan buah setidaknya 2 porsi",
    "Skip junk food seharian",
    "Tidur 7+ jam malam ini",
    "Lakukan 20 push-up",
    "Makan sayur 2 porsi hari ini",
    "Jalan kaki 30 menit",
    "Meditasi 5 menit"
  ],
  social: [
    "DM temen lama yang udah lost contact",
    "Hubungi ortu/keluarga hari ini",
    "Buat plan hangout minggu depan",
    "Bantuin temen di suatu hal kecil",
    "Ajak makan bareng orang baru",
    "Bagi appreciation ke 3 orang di medsos",
    "Ikut komunitas baru",
    "Bikin grup chat seru",
    "Kasih hadiah ke temen",
    "Dengerin cerita orang lain"
  ],
  productivity: [
    "Beresin to-do list prioritas utama",
    "Bikin jadwal mingguan yang terstruktur",
    "Declutter workspace/kamar",
    "Belajar skill baru 30 menit",
    "No procrastination challenge 1 hari",
    "Bikin progress di projek yang tertunda",
    "Rapiin file di laptop/hp",
    "Selesaikan 1 tugas yang ditunda",
    "Bikin planning bulanan",
    "Baca buku 30 menit"
  ],
  mindfulness: [
    "Journaling 5 menit pagi/malam",
    "Meditasi fokus napas 10 menit",
    "Digital detox 2 jam (no gadget)",
    "List 5 hal yang bikin grateful hari ini",
    "Nature time: jalan di taman/outdoor",
    "Me-time: lakukan aktivitas yang bikin happy",
    "Tulis 3 affirmasi positif",
    "Praktek mindful eating",
    "Stretching sambil napas dalam",
    "Refleksi pencapaian minggu ini"
  ]
};

// Item-item yang bisa dibeli di shop
export const shopItems = [
  {
    id: "streak_freeze",
    name: "🧊 Shield Streak",
    cost: 100,
    desc: "Anti streak ilang 1x skip",
    effect: "streakFreeze",
    duration: 1
  },
  {
    id: "double_xp",
    name: "⚡ Double XP",
    cost: 150,
    desc: "XP 2x lipat 24 jam cuy",
    effect: "doubleXP",
    duration: 24
  },
  {
    id: "mission_reroll",
    name: "🎲 Reroll Misi",
    cost: 50,
    desc: "Ganti misi langsung",
    effect: "instantUse"
  },
  {
    id: "bonus_xp",
    name: "✨ Boost XP",
    cost: 120,
    desc: "Auto +50 XP cuy",
    effect: "instantUse"
  },
  {
    id: "mega_points",
    name: "💰 Mega Points",
    cost: 200,
    desc: "Dapet 100 points langsung",
    effect: "instantUse"
  }
];

// Daftar achievements yang bisa didapat
export const achievements = [
  {
    id: "firstMission",
    name: "🌱 Pemula cuy",
    desc: "Selesain misi pertama bestie!",
    xp: 50,
    coins: 100
  },
  {
    id: "streak7",
    name: "🔥 Konsisten",
    desc: "Capai streak 7 hari",
    xp: 100,
    coins: 150
  },
  {
    id: "points100",
    name: "💰 Kolektor",
    desc: "Kumpulkan 100 koin",
    xp: 75,
    coins: 50
  },
  {
    id: "missions50",
    name: "⭐ Petualang Pro",
    desc: "Selesaikan 50 misi",
    xp: 150,
    coins: 200
  },
  {
    id: "allCategories",
    name: "🌈 Master Quest",
    desc: "Selesaikan misi dari semua kategori",
    xp: 200,
    coins: 300
  }
];

// Reward untuk setiap level up
export const levelUpRewards = {
  2: ["🎁 Misi baru unlock cuy", "💎 +20 bonus koin"],
  3: ["🌟 Power-up shop dibuka", "💎 +30 bonus koin"],
  4: ["🏆 Achievement baru", "💎 +40 bonus koin"],
  5: ["⭐ VIP misi unlock", "💎 +50 bonus koin"],
  10: ["🎮 Custom misi feature", "💎 +100 bonus koin"],
  15: ["🌈 Rare background unlock", "💎 +150 bonus koin"],
  20: ["👑 Legend title unlock", "💎 +200 bonus koin"]
};

// Pesan-pesan UI
export const uiMessages = {
  levelUp: "NAIK LEVEL cuy! 🎉",
  misiComplete: "Misi done! Mantap cuy! ✨",
  misiSkip: "Skip dulu, gaskeun yang lain! 💪",
  lowCoins: "Duh koin kurang cuy 😭",
  purchaseSuccess: "Berhasil dibeli! Gas! 🎉",
  streakLost: "Waduh streak ilang! Ayo mulai lagi! 🔥",
  weeklyComplete: "Target minggu ini tercapai! Keren! 🎯",
  newAchievement: "Achievement baru kebuka! 🏆",
  dailyLimit: "Udah capai limit misi harian nih! 🌙",
  itemActivated: "Item berhasil diaktifkan! 🎮",
  itemExpired: "Item udah abis durasinya! ⏰"
};


// Fungsi untuk mengecek batasan misi harian
function checkDailyLimit() {
  const today = new Date().toDateString();
  const dailyMissions = JSON.parse(localStorage.getItem('dailyMissions') || '[]');
  const todayMissions = dailyMissions.filter(m => new Date(m.date).toDateString() === today);
  return todayMissions.length >= 3;
}

// Fungsi untuk mengecek cooldown
function checkCooldown() {
  const lastMissionTime = localStorage.getItem('lastMissionTime');
  if (!lastMissionTime) return true;

  const cooldownTime = 4 * 60 * 60 * 1000; // 4 jam dalam milidetik
  const timeDiff = Date.now() - parseInt(lastMissionTime);
  return timeDiff >= cooldownTime;
}

// Fungsi untuk mengecek deadline misi
function checkMissionDeadline() {
  const activeMission = JSON.parse(localStorage.getItem('activeMission'));
  if (!activeMission) return true;

  const deadline = activeMission.deadline;
  return Date.now() <= deadline;
}

// Fungsi untuk generate misi baru
export function generateMission() {
  // Cek batasan harian
  if (checkDailyLimit()) {
    alert('Kamu sudah mencapai batas 3 misi hari ini! Coba lagi besok ya 😊');
    return null;
  }

  // Cek cooldown
  if (!checkCooldown()) {
    const timeLeft = Math.ceil((4 * 60 * 60 * 1000 - (Date.now() - parseInt(localStorage.getItem('lastMissionTime')))) / (60 * 60 * 1000));
    alert(`Tunggu ${timeLeft} jam lagi untuk misi baru ya! 🕒`);
    return null;
  }

  // Pilih misi random yang sesuai level
  const playerLevel = parseInt(localStorage.getItem('level') || '1');
  const availableMissions = missions.filter(m => {
    if (playerLevel === 1) {
      return m.category === 'home' || m.category === 'health';
    }
    return true;
  });

  const randomMission = availableMissions[Math.floor(Math.random() * availableMissions.length)];
  return randomMission;
}

// Fungsi untuk memulai misi
export function startMission(mission) {
  if (!mission) return false;

  const missionData = {
    ...mission,
    startTime: Date.now(),
    deadline: Date.now() + (24 * 60 * 60 * 1000) // 24 jam deadline
  };

  // Simpan misi aktif
  localStorage.setItem('activeMission', JSON.stringify(missionData));
  localStorage.setItem('lastMissionTime', Date.now().toString());

  // Update data misi harian
  const dailyMissions = JSON.parse(localStorage.getItem('dailyMissions') || '[]');
  dailyMissions.push({
    missionId: mission.id,
    date: new Date().toISOString()
  });
  localStorage.setItem('dailyMissions', JSON.stringify(dailyMissions));

  return true;
}

// Fungsi untuk menyelesaikan misi
export function completeMission() {
  const activeMission = JSON.parse(localStorage.getItem('activeMission'));
  if (!activeMission) return false;

  // Cek deadline
  if (!checkMissionDeadline()) {
    alert('Waktu misi sudah habis! 😔');
    localStorage.removeItem('activeMission');
    return false;
  }

  // Update XP dan koin
  const currentXP = parseInt(localStorage.getItem('xp') || '0');
  const currentCoins = parseInt(localStorage.getItem('points') || '0');
  
  localStorage.setItem('xp', (currentXP + activeMission.xp).toString());
  localStorage.setItem('points', (currentCoins + activeMission.coins).toString());

  // Hapus misi aktif
  localStorage.removeItem('activeMission');

  // Update total misi
  const totalMissions = parseInt(localStorage.getItem('totalMissions') || '0');
  localStorage.setItem('totalMissions', (totalMissions + 1).toString());

  return true;
}

// Fungsi untuk skip misi
export function skipMission() {
  localStorage.removeItem('activeMission');
  return true;
}