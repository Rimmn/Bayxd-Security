process.on("uncaughtException", (err) => {
console.error("Caught exception:", err);
});

import "./settings.js"
import "./control/function.js"

import {
	makeWASocket,
	useMultiFileAuthState,
	DisconnectReason,
	downloadContentFromMessage,
	makeInMemoryStore,
	jidDecode,
	delay,
	Browsers
} from "@whiskeysockets/baileys"

import fs from "fs";
import chalk from "chalk";
import { fileURLToPath, pathToFileURL } from "url";
import pkg from "cfonts";
const { say } = pkg;
import pino from 'pino';
import { Boom } from'@hapi/boom';
import path from"path";
import readline from"readline"
import axios from"axios";
import qrcode from"qrcode-terminal";
import { fileTypeFromBuffer } from "file-type";
import os from 'os';
import nou from 'node-os-utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { caseHandler, owners } from "./handler.js"; 

const tio = nou.os.oos();
const tot = nou.drive.info();
const memInfo = nou.mem.info();
const totalGB = (memInfo.totalMemMb / 1024).toFixed(2);
const usedGB = (memInfo.usedMemMb / 1024).toFixed(2);
const freeGB = (memInfo.freeMemMb / 1024).toFixed(2);
const cpuCores = os.cpus().length;
const vpsUptime = runtime(os.uptime());

import { imageToWebp, videoToWebp, writeExifImg, writeExifVid } from './control/webp.js';
import WelcomeMessage from "./event/welcome.js";
import ConfigBaileys from "./control/config.js";
import { scurityDB } from "./control/scurity.js"; 
import checkGame from './control/game.js'
import { startAutoSholat } from './control/autosholat.js';
import { initDb, getSettings } from './control/database.js'; 

// ** sistem database ** //
console.log('Memuat database, tunggu. . .');
await initDb(); 
console.log('Succes, database berhasil dimuat!');

const botSet = await getSettings();
global.public = botSet.public === 1;
global.prefix = botSet.prefix;
global.multiprefix = botSet.multiprefix === 1;
global.autoread = botSet.autoread === 1;
global.readsw = botSet.readsw === 1;
global.anticall = botSet.anticall === 1;
global.autotyping = botSet.autotyping === 1; 
console.log('Settings Loaded âœ…');

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

async function InputNumber(promptText) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(promptText, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

const pairingCode = true
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('Auth');
    const jarr_devv = [ 2, 3000, 1027934701 ]
    const sock = makeWASocket({
        browser: Browsers.ubuntu("Firefox"),  
        generateHighQualityLinkPreview: true,  
        printQRInTerminal: !pairingCode,
        auth: state,        
        version: jarr_devv,
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id)
                return msg.message || undefined
            }
            return sock
        },
        logger: pino({ level: "silent" })
    });
    
    store?.bind(sock.ev)
    console.clear();
    if (pairingCode && !sock.authState.creds.registered) {
    const promptText =
        chalk.bgRed.bold(`\nRead Before Continuing âš ï¸\n`) +
        chalk.white.bold(`â€¢ Pastikan nomor yang akan dipake sudah terdaftar di database script\n`) +
        chalk.white.bold(`â€¢ Jika belum ada di database script akan menolak!\n`) +
        chalk.white.bold(`â€¢ Hubungi owner jika belum add database\n\n`) +
        chalk.cyan.bold('Enter Your Number, Example +628:\n');

    let phoneNumber = await InputNumber(promptText);
    phoneNumber = phoneNumber.replace(/[^0-9]/g, "");

    const db = await scurityDB();
    if (!db.nomor.includes(phoneNumber)) {
        console.log(chalk.red.bold("\n[REJECT] - Nomor tersebut tidak dalam database!\n#- Hubungi owner agar menambahkan ke database\n"));
        process.exit();
    }

    console.clear(); 
    console.log(chalk.green.bold("[SUCCESS] - Nomor telah terverifikasi oleh sistem\n#- Bila error atau bug segera lapor owner!!\n"));

    const code = await sock.requestPairingCode(phoneNumber, global.pairingKode);
    const pair = code.slice(0, 4) + "-" + code.slice(4, 8);

    console.log(chalk.green.bold("Silahkan hubungkan kode di bawah ke WhatsApp anda!"));
    console.log(`${chalk.white.bold('Pairing Code :')} ${chalk.bgGreen.bold(pair)}`);
}

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
      if (!connection) return;
      if (connection === "connecting") {                     
      if (qr && !pairingCode) {
      console.log("Scan QR ini di WhatsApp:");
      qrcode.generate(qr, { small: true }); 
         }
        }
      if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.error(lastDisconnect.error);

      switch (reason) {
       case DisconnectReason.badSession:
          console.log("Bad Session File, Please Delete Session and Scan Again");
          process.exit();
        case DisconnectReason.connectionClosed:
          console.log("[SYSTEM] Connection closed, reconnecting...");
          await startBot();
          break;
        case DisconnectReason.connectionLost:
          console.log("[SYSTEM] Connection lost, trying to reconnect...");
          await startBot();
          break; 
        case DisconnectReason.connectionReplaced:
          console.log("Connection Replaced, Another New Session Opened. Please Close Current Session First.");
          await sock.logout();
        break;
        case DisconnectReason.restartRequired:
          console.log("Restart Required...");
          await startBot();
          break; 
        case DisconnectReason.loggedOut:
          console.log("Device Logged Out, Please Scan Again And Run.");
          await sock.logout();
        break;
        case DisconnectReason.timedOut:
          console.log("Connection TimedOut, Reconnecting...");
          await startBot();
          break; 
        
        default:
        const errorMsg = lastDisconnect.error?.message;
        
        if (errorMsg === "Error: Stream Errored (unknown)" || errorMsg === "Stream Errored (unknown)") {
            console.log("[SYSTEM] Stream Errored (unknown) detected. Reconnecting...");
            await startBot(); 
        } else {
            console.error(`[SYSTEM] Disconnect Reason (Unhandled): ${reason} - ${lastDisconnect.error}`);
            await startBot(); 
        }
      }
    } else if (connection === "open") {
      console.clear()
      console.log(chalk.red.bold(`[SYSTEM INFO] - Tuggu 10 detik, loading data. . .!`));
      await delay(10000);
      console.clear()
      console.log(chalk.green.bold(`[SYSTEM SUCCES] - Data berhasil di muat!`));
      console.clear()
      
      await startCode(sock); 
      try {
      sock.newsletterFollow("120363420360528990@newsletter")
      } catch {}
      try {
      sock.newsletterFollow("120363403075886973@newsletter")
      } catch {}
      
nou.mem.info().then(memInfo => {
    const totalGB = (memInfo.totalMemMb / 1024).toFixed(2);
    const usedGB = (memInfo.usedMemMb / 1024).toFixed(2);
    const freeGB = (memInfo.freeMemMb / 1024).toFixed(2);

    nou.drive.info().then(tot => {
        const line = chalk.cyan('â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€');

        console.log(line);
        console.log(chalk.magenta.bold('ðŸ’¬ Informasi Script'));
        console.log(line);
        console.log(chalk.white(`â€º Name Script  : ${global.namaBot}`));
        console.log(chalk.white(`â€º Developer    : ${global.namaOwner}`));
        console.log(chalk.white(`â€º Version      : ${global.versiBot}`));
        console.log(chalk.white(`â€º Type Script  : Case X Plugins`));

        console.log(line);
        console.log(chalk.blue.bold('ðŸ’» Informasi Server'));
        console.log(line);
        console.log(chalk.white(`â€º OS Platform  : ${nou.os.type()}`));
        console.log(chalk.white(`â€º RAM VPS      : ${usedGB}/${totalGB} GB used (${freeGB} GB free)`));
        console.log(chalk.white(`â€º Disk Space   : ${tot.usedGb}/${tot.totalGb} GB used`));
        console.log(chalk.white(`â€º CPU Core     : ${cpuCores} core(s)`));
        console.log(chalk.white(`â€º VPS Uptime   : ${vpsUptime}`));
        console.log(chalk.white(`â€º CPU Type     : ${os.cpus()[0].model}`));

        console.log(line);
        console.log(chalk.green.bold('[âœ“] - Script telah terkoneksi di WhatsApp anda. Selamat menggunakan!\n'));
    });
});
 }
});

sock.ev.on("messages.upsert", async (chatUpdate) => {
  try {
    if (chatUpdate.type !== 'notify') return;
    
    const msg = chatUpdate.messages[0];
    if (!msg.message) return;
    if (msg.key.fromMe) return;
    const m = await ConfigBaileys(sock, msg);
    
    const globalOwners = global.owner.map(v => v.includes("@s.whatsapp.net") ? v : v + "@s.whatsapp.net");
    const localOwners = owners.map(v => v.includes("@s.whatsapp.net") ? v : v + "@s.whatsapp.net");
    const allOwners = [ ...globalOwners, ...localOwners];
    const isOwner = allOwners.includes(m.sender) || m.isDeveloper === true;

    if (msg.key.remoteJid === "status@broadcast") {
        if (global.readsw) {
            try {
                await sock.readMessages([msg.key]);
            } catch (e) {}
        }
        return; 
    }
    
    if (global.autoread && !m.key.fromMe) {
        await sock.readMessages([m.key]);
    }
    
    if (!global.public && !isOwner) return;
    
    await checkGame(m, sock);
    caseHandler(m, sock, chatUpdate);
    
  } catch (err) {
    console.error("Error on message:", err);
  }
});
 
    await startAutoSholat(sock);
    
    sock.ev.on("group-participants.update", async (update) => {
    await WelcomeMessage(sock, update)
    });
    
   sock.ev.on("call", async (celled) => {
  let anticall = global.anticall
  if (!anticall) return

  for (let data of celled) {
    if (!data.isGroup && data.status === "offer") {

      await sock.sendMessage(data.from, {
        text: `*${namaBot}* tidak bisa menerima panggilan ${data.isVideo ? `*video*` : `*suara*`}

- _Maaf @${data.from.split("@")[0]} kamu akan diblokir karena melakukan panggilan!_`,
        mentions: [data.from]
      })

      await sleep(5000)
      await sock.updateBlockStatus(data.from, "block")
    }
  }
})

    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };
    
sock.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
  try {
    const quoted = message.msg ? message.msg : message;
    const mime = (message.msg || message).mimetype || "";
    const messageType = message.mtype
      ? message.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];

    const Randoms = Date.now();
    const fil = Randoms;

    // pastikan folder ./data/trash ada
    if (!fs.existsSync("./data/trash")) {
      fs.mkdirSync("./data/trash", { recursive: true });
    }

    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    const type = (await fileTypeFromBuffer(buffer)) || { ext: "bin", mime: "application/octet-stream" };
    const trueFileName = attachExtension
      ? `./data/trash/${fil}.${type.ext}`
      : filename || `./data/trash/${fil}.${type.ext}`;

    fs.writeFileSync(trueFileName, buffer);

    return trueFileName;
  } catch (err) {
    console.error("Error saat download media:", err);
    return null;
  }
};

   sock.downloadM = async (m, type, filename = '') => {
        if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
        const stream = await downloadContentFromMessage(m, type)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
        }
        if (filename) await fs.promises.writeFile(filename, buffer)
        return filename && fs.existsSync(filename) ? filename : buffer
   }
   
   
   sock.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`, `[1], 'base64')
        : /^https?:\/\//.test(path)
        ? await (await getBuffer(path))
        : fs.existsSync(path)
        ? fs.readFileSync(path)
        : Buffer.alloc(0);

    let buffer;
    if (options && (options.packname || options.author)) {
        buffer = await writeExifImg(buff, options);
    } else {
        buffer = await imageToWebp(buff);
    }

    await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
    };

    sock.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`, `[1], 'base64')
        : /^https?:\/\//.test(path)
        ? await (await getBuffer(path))
        : fs.existsSync(path)
        ? fs.readFileSync(path)
        : Buffer.alloc(0);

    let buffer;
    if (options && (options.packname || options.author)) {
        buffer = await writeExifVid(buff, options);
    } else {
        buffer = await videoToWebp(buff);
    }

    await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
    };
    
    sock.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)

        let type = await fileTypeFromBuffer(data) || {
          mime: "application/octet-stream",
          ext: "bin"
        };
        
        filename = path.join(__filename, './data/trash/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename,
        data)
        return {
            res,
            filename,
	    size: await getSizeMedia(data),
            ...type,
            data
        }

    }

    sock.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
  let type = await sock.getFile(path, true);
  let { res, data: file, filename: pathFile } = type;

  if (res && res.status !== 200 || file.length <= 65536) {
    try {
      throw {
        json: JSON.parse(file.toString())
      };
    } catch (e) {
      if (e.json) throw e.json;
    }
  }

  let opt = {
    filename
  };

  if (quoted) opt.quoted = quoted;
  if (!type) options.asDocument = true;

  let mtype = '',
    mimetype = type.mime,
    convert;
  
  if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker';
  else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image';
  else if (/video/.test(type.mime)) mtype = 'video';
  else if (/audio/.test(type.mime)) {
    convert = await (ptt ? toPTT : toAudio)(file, type.ext);
    file = convert.data;
    pathFile = convert.filename;
    mtype = 'audio';
    mimetype = 'audio/ogg; codecs=opus';
  } else mtype = 'document';

  if (options.asDocument) mtype = 'document';

  delete options.asSticker;
  delete options.asLocation;
  delete options.asVideo;
  delete options.asDocument;
  delete options.asImage;

  let message = { ...options, caption, ptt, [mtype]: { url: pathFile }, mimetype };
  let m;

  try {
    m = await sock.sendMessage(jid, message, { ...opt, ...options });
  } catch (e) {
    //console.error(e)
    m = null;
  } finally {
    if (!m) m = await sock.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options });
    file = null;
    return m;
  }
}

    sock.sendContact = async (jid, kon = [], name, desk = "Developer Bot", quoted = '', opts = {}) => {
    const list = kon.map(i => ({
      displayName: typeof name !== 'undefined' ? name : 'Unknown',
      vcard:
        'BEGIN:VCARD\n' +
        'VERSION:3.0\n' +
        `N:;${name || 'Unknown'};;;\n` +
        `FN:${name || 'Unknown'}\n` +
        'ORG:Unknown\n' +
        'TITLE:\n' +
        `item1.TEL;waid=${i}:${i}\n` +
        'item1.X-ABLabel:Ponsel\n' +
        `X-WA-BIZ-DESCRIPTION:${desk}\n` +
        `X-WA-BIZ-NAME:${name || 'Unknown'}\n` +
        'END:VCARD'
    }));

    await sock.sendMessage(
      jid,
      { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts },
      { quoted }
    );
   }
 }
 
startBot();

fs.watchFile(__filename, () => {
    fs.unwatchFile(__filename);
    console.log(chalk.white.bold("~> Update File :"), chalk.green.bold(__filename));
    import(`${pathToFileURL(__filename).href}?update=${Date.now()}`);
});