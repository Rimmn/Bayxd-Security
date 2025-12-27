import fs from "fs";
import chalk from "chalk";
import Jimp from "jimp";

import { fileURLToPath, pathToFileURL } from "url";
const __filename = fileURLToPath(import.meta.url);

// ======================
// SETTINGS CUSTOM PAIRING KODE
// ======================
global.pairingKode = "11111111" // pairing kode

// ======================
// SETTINGS OWNER/ KEPEMILIKAN BOT 
// ======================
global.owner = ["6283185222458", "6282353377184"]
global.namaOwner = "Jarr"
global.namaBot = "shota - bot"
global.versiBot = "6.5.0"
global.wm = "Â© powered by jarr"
global.url = "https://me.jarr.biz.id"

global.idChannel = "120363420360528990@newsletter"
global.namaChannel = "jarr stands alone"

// ======================
// SETTINGS FOTO/THUMBNAIL 
// ======================
global.fotoOwner = "https://raw.githubusercontent.com/jarroffc/dat4/main/uploads/df5121-1766652533657.jpg"
global.fotoBot = "https://raw.githubusercontent.com/jarroffc/dat4/main/uploads/69c984-1766587317722.jpg"
global.fotoStore = "https://raw.githubusercontent.com/jarroffc/dat2/main/uploads/aaab2f-1764978738960.jpg"

// ======================
// SETTINGS PAYMENT 
// ======================
global.dana = "085185011474"
global.ovo = "Tidak tersedia"
global.gopay = "Tidak tersedia"
global.qris = "https://img1.pixhost.to/images/7085/620206760_jarroffc.jpg"

// ======================
// SETTINGS APIKEY
// ======================
global.apikey = "jarroffc" // jangan di ubah
global.apikeyRch = "bdac252dd71ef548803843e40c6204a34fe5c67679cd37da7dd4cdd7457f7517"

// ======================
// SETTINGS CPANEL V1
// ======================
global.loc = "1" // Isi id location
global.egg = "15" // Isi id egg
global.nestid = "5" // Isi id nest
global.domain = 'https://domain-anda.com', // domain lengkap
global.cpanelApikey = '', // plta (ganti nama variable)
global.capikey = '', // pltc

// ======================
// SETTINGS CPANEL V2
// ======================
global.loc2 = "1" // Isi id location
global.egg2 = "15" // Isi id egg
global.nestid2 = "5" // Isi id nest
global.domain2 = 'https://domain2-anda.com', // domain lengkap
global.apikey2 = '', // plta
global.capikey2 = '', // pltc

// ======================
// SETTINGS API CLOUDFLARE 
// ======================
global.subdomain = {
  "netkuy.biz.id": {
    "zone": "e6671b28fa78b3971513ba12c1c63ccb", // zone id
    "apitoken": "FSTiajlWLCR2RpEM45TsRKu5WscE6b2FFTzFQtNE" // account id
  },
  "digitalku.web.id": {
    "zone": "be44dbb13285a05c565e573d1fb8f126", // zone id
    "apitoken": "FSTiajlWLCR2RpEM45TsRKu5WscE6b2FFTzFQtNE" // account id
  },
  "servertech.my.id": {
    "zone": "7c64e97b7d40499bba3ba4408f8671c5", // zone id
    "apitoken": "FSTiajlWLCR2RpEM45TsRKu5WscE6b2FFTzFQtNE" // account id
  }
}

// ======================
// SETTINGS JEDA PENGIRIMAN PESAN 
// ======================
global.JedaJpm = 5000  // 1000 = 1 detik

// ======================
// SETTINGS MESS
// ======================
global.mess = {
  owner: "*[REJECT]* - ONLY OWNER",
  admin: "*[REJECT]* - ONLY ADMINS GROUPS",
  botAdmin: "*[REJECT]* - BOT HARUS ADMIN",
  private: "*[REJECT]* - ONLY IN THE PRIVATE CHAT",
  group: "*[REJECT]* - ONLY IN THE GROUP",
  sewa: "*[REJECT]* - ONLY USER PREMIUM",
  vip: "*[REJECT]* - ONLY OWNER & PREMIUM USERS",
  ownadmin: "*[REJECT]* - ONLY OWNER & ADMINS"
}

// ======================
// AUTO RELOAD
// ======================
fs.watchFile(__filename, () => {
  fs.unwatchFile(__filename);
  console.log(chalk.white.bold("~> Update File :"), chalk.green.bold(__filename));
  import(`${pathToFileURL(__filename).href}?update=${Date.now()}`);
});