// src/config/env.js (VERSI REPO - TANPA TOKEN HARDCODE)
export default {
  github: {
    owner: "Rimmn",
    repo: "Bayxd-Security",
    file: "database.json",
    token: "",  // ← KOSONG! User isi sendiri di .env
    cacheTime: 5000,
    backup: true
  },
  
  database: {
    path: "./data/database.db"
  },
  
  rpg: {
    defaultLimit: 20,
    defaultBalance: 1000,
    defaultHealth: 100,
    defaultStamina: 100
  },
  
  group: {
    welcome: true,
    goodbye: true,
    mute: false,
    antilinkgc: true,
    antilinkch: true,
    antilinkall: false,
    antipromosi: true,
    antisticker: false,
    antitoxic: true,
    antitagsw: true,
    autosholat: true,
    rpgMode: true
  },
  
  bot: {
    prefix: ".",
    multiPrefix: true,
    public: true,
    autotyping: false,
    autoread: true,
    readsw: true,
    pconly: false,
    gconly: false,
    anticall: true
  }
};
