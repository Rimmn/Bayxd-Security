// ~ developer Jarr Officiall 
// ~ telegram @jarroffc2

process.on("uncaughtException", (err) => {
console.error("Caught exception:", err);
});

import { 
  S_WHATSAPP_NET, 
  downloadContentFromMessage,
  generateWAMessageFromContent,
  generateWAMessageContent
} from "@whiskeysockets/baileys";

import * as fs from "fs/promises"; 
import * as fsSync from "fs";  
import chalk from "chalk";
import { fileURLToPath, pathToFileURL } from "url";
import util from "util";
import axios from "axios";
import fetch from "node-fetch";
import path from "path";
import { exec, spawn, execSync } from 'child_process';

//=============================================//
// * import file
import { handleMessage, getPluginStats } from "./control/plugins.js"
import { getGroup, db, getSettings, getUser, incrementData } from './control/database.js';

//=============================================//
const sewa = JSON.parse(fsSync.readFileSync("./data/sewa.json"))
const datagc1 = JSON.parse(fsSync.readFileSync("./data/premiumV1.json"))
const datagc2 = JSON.parse(fsSync.readFileSync("./data/premiumV2.json"))
const you = JSON.parse(fsSync.readFileSync("./data/ban.json"))
const list = JSON.parse(fsSync.readFileSync("./data/list.json"))
export const owners = JSON.parse(fsSync.readFileSync("./data/owner.json"))

//=============================================//
export async function caseHandler(m, sock, chatUpdate) {
try {
const body =
  m.message?.conversation ||
  m.message?.extendedTextMessage?.text ||
  m.message?.imageMessage?.caption ||
  m.message?.videoMessage?.caption ||
  m.message?.buttonsResponseMessage?.selectedButtonId ||
  m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
  m.message?.templateButtonReplyMessage?.selectedId ||
  (m.message?.interactiveResponseMessage
    ? JSON.parse(m.msg?.nativeFlowResponseMessage?.paramsJson || "{}")?.id
    : "") ||
  "";

const chatDb = await getGroup(m.chat);
const globalPrefix = global.prefix || '.'; 
const isPrefixOn = global.multiprefix === true; 

let prefix = null;
let isCmd = false;

if (isPrefixOn) { 
    if (body.startsWith(globalPrefix)) {
        prefix = globalPrefix; 
        isCmd = true;
    }
 } else {
    if (body.length > 0) { 
        prefix = ''; 
        isCmd = true;
    }
}

const command = isCmd? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
const args = isCmd ? body.slice(prefix.length).trim().split(/ +/).slice(1) : [];

const quoted = m.quoted ? m.quoted : m
const mime = quoted?.msg?.mimetype || quoted?.mimetype || null
const qmsg = (m.quoted || m)
const q = args.join(" ");
const text = q;

const botNumber = await sock.decodeJid(sock.user.id);
const isSewa = [botNumber, ...sewa].includes(m.sender) || m.isDeveloper;

const globalOwners = global.owner.map(v =>
  v.includes("@s.whatsapp.net") ? v : v + "@s.whatsapp.net"
);

const localOwners = owners.map(v =>
  v.includes("@s.whatsapp.net") ? v : v + "@s.whatsapp.net"
);

const allOwners = [
    botNumber,
    ...globalOwners,
    ...localOwners
];

const isOwner = allOwners.includes(m.sender) || m.isDeveloper === true;
const totalBan = you.length > 0 ? you.length : 0
const isPremGrupV1 = datagc1.includes(m.chat)
const isPremGrupV2 = datagc2.includes(m.chat)
const isBan = you.includes(m.sender)

if (global.autotyping && isCmd && !m.key.fromMe) {
 await sock.sendPresenceUpdate("composing", m.chat);
}

//=============================================//
const groupMetadata = m?.isGroup ? await sock.groupMetadata(m.chat).catch(() => ({})) : {};
const groupName = m?.isGroup ? groupMetadata.subject || '' : '';
const participants = m?.isGroup ? groupMetadata.participants?.map(p => {
            let admin = null;
            if (p.admin === 'superadmin') admin = 'superadmin';
            else if (p.admin === 'admin') admin = 'admin';
            return {
                id: p.id || null,
                jid: p.jid || null,
                admin,
                full: p
            };
        }) || []: [];
const groupOwner = m?.isGroup ? participants.find(p => p.admin === 'superadmin')?.jid || '' : '';
const groupAdmins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.jid || p.id);

const isBotAdmin = groupAdmins.includes(botNumber);
const isAdmin = groupAdmins.includes(m.sender);

//=============================================//
//Mute grup
if (m.isGroup && isCmd) {
        if (chatDb.mute === 1) {
            if (!isOwner && !isAdmin) {
                return; 
            }
        }
    }

if (body.startsWith(prefix + command)) {
    if (global.pconly && m.isGroup) {
        return m.reply("Bot Hanya Dapat Digunakan di privat chat âš ï¸");
    }
    if (global.gconly && !m.isGroup) {
        return; 
    }
}
 
//=============================================//
// * fungsi untuk jadwal sholat**
async function JadwalSholat(kota) {
  try {
    // cari ID kota
    const search = await axios.get(`https://api.myquran.com/v2/sholat/kota/cari/${encodeURIComponent(kota)}`)
    const dataKota = search.data.data?.[0]
    if (!dataKota) return `âš ï¸ Kota *${kota}* tidak ditemukan.`

    // ambil jadwal sholat berdasarkan ID kota
    const jadwal = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${dataKota.id}/${new Date().getFullYear()}/${new Date().getMonth()+1}/${new Date().getDate()}`)
    const j = jadwal.data.data.jadwal

    return `\`\`\`JADWAL SHOLAT ðŸŒž\`\`\`

ðŸ˜ï¸Kota : *${dataKota.lokasi}*
ðŸ“† Date : ${j.tanggal}

- ðŸ• *Imsak:*  ${j.imsak}
- ðŸ•Œ *Subuh:* ${j.subuh}
- ðŸŒž *Dzuhur:* ${j.dzuhur}
- â˜€ï¸ *Ashar:* ${j.ashar}
- ðŸŒ‡ *Maghrib:* ${j.maghrib}
- ðŸŒ™ *Isyak:* ${j.isya}

_Mari kita sholat âœ¨~_`
  } catch (err) {
    console.error(err)
    return "âš ï¸ Terjadi kesalahan saat mengambil jadwal sholat."
  }
}

//=============================================//
if (m.isGroup && !m.key.fromMe) {
    const mentionUser = [...new Set([
        ...(m.mentionedJid || []),
        ...(m.quoted ? [m.quoted.sender] : [])
    ])];

    for (const ment of mentionUser) {
        const targetUser = await getUser(ment);

        if (targetUser && targetUser.afk_time > -1) {
            const reason = targetUser.afk_reason || 'Tanpa alasan';
            const duration = Date.now() - targetUser.afk_time;
            const anu2 = ms(duration); 

            await reply(`Eh, jangan di-tag orangnya lagi *AFK!* ðŸ˜´
      
ðŸ•’ *Sejak:* ${anu2.hours} jam, ${anu2.minutes} menit, ${anu2.seconds} detik lalu
ðŸ’¬ *Alasan:* ${reason}`);
        }
    }
    
    const senderUser = await getUser(m.sender);

    if (senderUser && senderUser.afk_time > -1) {
        const reason = senderUser.afk_reason || 'Tanpa alasan';
        const duration = Date.now() - senderUser.afk_time;
        const anu = ms(duration);

        await db('users', m.sender, 'afk_time', -1);
        await db('users', m.sender, 'afk_reason', '');

        await sock.sendMessage(m.chat, {
            text: `Yeay! @${m.sender.split('@')[0]} udah balik dari *AFK!* ðŸŽ‰

ðŸ•’ *Durasi:* ${anu.hours} jam, ${anu.minutes} menit, ${anu.seconds} detik
ðŸ’¬ *Alasan:* ${reason}`,
            mentions: [m.sender]
        }, { quoted: m });
    }
}
//=============================================//
//untuk respon list 
if (!isCmd && m.isGroup) {
  let body = (m.text?.trim() 
         || m.message?.conversation 
         || m.message?.extendedTextMessage?.text 
         || m.msg?.text 
         || ""
).toLowerCase()
  let chatId = m.chat
  let res = list.find(e => e.chatId === chatId && e.cmd === body)
  if (res) {
    if (res.img) {
      sock.sendMessage(chatId, {
        image: { url: res.img },
        caption: res.respon
      }, { quoted: m })
    } else {
      m.reply(res.respon)
    }
    return
  }
}

//=============================================//
if (m.isGroup) {
  if (chatDb.antisticker === 1 && isBotAdmin) {
    if (m.message?.stickerMessage && !isOwner && !isSewa && !isAdmin && !m.key.fromMe) {
      const participant = m.key.participant || m.sender;
      await sock.sendMessage(m.chat, {
        text: `*Group Security!*
â€º Hii @${m.sender.split('@')[0]}, pesanmu dihapus.
â€º Jangan kirim *sticker* di sini!`,
        mentions: [m.sender]
      }, { quoted: m });

      await sleep(500);

      await sock.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          id: m.key.id,
          participant: participant,
          fromMe: false
        }
      });
    }
  }
}

//===============================================//
if (m.isGroup) {
    let mutedUsers = [];
    try {
        mutedUsers = JSON.parse(chatDb.muted_users || '[]');
    } catch (e) {
        mutedUsers = []; 
    }

    const sender = m.key.participant || m.participant || m.sender;
    if (mutedUsers.includes(sender) && !isOwner && !isAdmin && !isSewa && isBotAdmin && !m.key.fromMe) {
        
        await sleep(1000); 
        await sock.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: sender
            }
        });
    }
}

//=============================================//
if (m.isGroup) {
  if (chatDb.antilinkgc === 1) {
    const regex = /(?:https?:\/\/)?chat\.whatsapp\.com\/[A-Za-z0-9]{20,24}/i;

    if (regex.test(m.text) && !isOwner && !isSewa && !isAdmin && isBotAdmin && !m.key.fromMe) {
      
      await sock.sendMessage(m.chat, {
        text: `*Group Security!*
â€º Hii @${m.sender.split('@')[0]}, pesanmu dihapus 
â€º Jangan kirim link *grup lain* di sini!`,
        mentions: [m.sender]
      }, { quoted: m });

      await sleep(600); 
      await sock.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          id: m.key.id,
          participant: m.key.participant || m.sender,
          fromMe: false
        }
      });
    }
  }
}

//=============================================//
if (m.isGroup) {
  if (chatDb.antilinkch === 1) {
    const regex = /(?:https?:\/\/)?whatsapp\.com\/channel\/[A-Za-z0-9]{15,45}/i;
    if (regex.test(m.text) && !isOwner && !isSewa && !isAdmin && isBotAdmin && !m.key.fromMe) {

      const participant = m.key.participant || m.sender;

      await sock.sendMessage(m.chat, {
        text: `*Group Security!*
â€º Hii @${m.sender.split('@')[0]}, pesanmu dihapus 
â€º Jangan kirim link *saluran WhatsApp* di sini!`,
        mentions: [m.sender]
      }, { quoted: m });

      await sleep(600);
      await sock.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          id: m.key.id,
          participant: participant,
          fromMe: false
        }
      });
    }
  }
}

//=============================================//
if (m.isGroup) {
  if (chatDb.antitoxic === 1 && isBotAdmin) {
    
    const pornWords = [
      "18+", "hentai", "sexi",
      "porn", "porno", "xnxx", "xvideos",
      "jav", "fetish", "gay", "sexy", "sex", "hot",
      "bikini", "sepak", "ngentot",
      "anjing","kontol","memek","asu","bangsat",
      "babi","goblok","tolol","idiot","jingan",
      "bacot","ngentot","jancok","pantek","kampang",
      "kimak","pepek","bego","tai","fuck",
      "laso","ajng","ajg","bapaklu","emaklu","palalu",
      "lol","penis","mmk","su","lonte","jalang","tytyd",
      "titit","yatim","yapit","piatu","pungut","anjir",
      "mani","sperma","sepongin","kocoqin","kocok","coli",
      "sex","sepong","fck", "lapet", "ngesex", "bugil", "tobugil",
      "telanjang", "naked"
    ];

    const pesan = (m.text || "").toLowerCase();
    const Warn = pornWords.some(k => pesan.includes(k));
    if (Warn && !isOwner && !isSewa && !isAdmin && !m.key.fromMe) {

      const participant = m.key.participant || m.sender;
      await sock.sendMessage(m.chat, {
        text: `*Group Security!*
â€º Hii @${m.sender.split('@')[0]}, pesanmu dihapus  
â€º Kata terlarang tidak diperbolehkan di grup ini.`,
        mentions: [m.sender]
      }, { quoted: m });

      await sleep(600);
      await sock.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          id: m.key.id,
          participant: participant,
          fromMe: false
        }
      });
    }
  }
}
//=============================================//
if (m.isGroup) {
  if (chatDb.antitagsw === 1 && isBotAdmin) {
    if (!isOwner && !isSewa && !isAdmin && !m.key.fromMe) {
      if (m.message?.groupStatusMentionMessage) {
        
        const participant = m.key.participant || m.sender;
        await sock.sendMessage(m.chat, {
          text: `*Group Security!*
â€º Hii @${m.sender.split('@')[0]}, pesanmu dihapus  
â€º Jangan tag *status* di sini!`,
          mentions: [m.sender]
        }, { quoted: m });

        await sleep(600); 
        await sock.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            id: m.key.id,
            participant: participant,
            fromMe: false
          }
        });
      }
    }
  }
}

//=============================================//
if (m.isGroup) {
  if (chatDb.antipromosi === 1 && isBotAdmin) {
    if (!isOwner && !isSewa && !isAdmin && !m.key.fromMe) {

      const pesan = (
        m.text ||
        m.message?.extendedTextMessage?.text ||
        ""
      ).toLowerCase();
      const promoWords = [
        "ready", "sell", "price", "jual",
        "redi", "remdi", "buy", "beli", "order", "sewa",
        "diskon", "jasa", "murah", "murmer", "promo",
        "reseller", "garansi", "bergaransi", "nokos",
        "stock", "stok", "bayar", "pembayaran", "payment",
        "dp", "own panel", "panel", "apk premium", "idr", "maharin",
        "function", "bug", "crash"
      ];


      const adaPromo = promoWords.some(word => pesan.includes(word));
      if (adaPromo) {
        const participant = m.key.participant || m.sender;

        await sock.sendMessage(m.chat, {
          text: `*Group Security!*
â€º Hii @${m.sender.split('@')[0]}, pesanmu dihapus  
â€º Kata *promosi* terdeteksi!`,
          mentions: [m.sender]
        }, { quoted: m });

        await sleep(600); 
        await sock.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            id: m.key.id,
            participant: participant,
            fromMe: false
          }
        });
      }
    }
  }
}

//=============================================//
if (m.isGroup) {
  if (chatDb.antilinkall === 1 && isBotAdmin) {
    if (!isOwner && !isSewa && !isAdmin && !m.key.fromMe) {

      const pesan =
        m.text ||
        m.message?.extendedTextMessage?.text ||
        "";

      const regexLink = /https?:\/\/[^\s]+/i;
      const adaLink = regexLink.test(pesan);

      if (adaLink) {
        const participant = m.key.participant || m.participant || m.sender;

        await sock.sendMessage(
          m.chat,
          {
            text: `*Group Security!*
â€º Hii @${m.sender.split('@')[0]}, pesanmu dihapus 
â€º Jangan kirim *link* apapun di sini!`,
            mentions: [m.sender],
          },
          { quoted: m }
        );

        await sleep(1000);
        await sock.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: participant,
          },
        });
      }
    }
  }
}

//=============================================//

const qtxt = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "0@s.whatsapp.net"
    },
    message: {
        newsletterAdminInviteMessage: {
            newsletterJid: "120363253324828163@newsletter",
            newsletterName: "xcde",
            caption: `Powered By ${namaOwner}`,
            inviteExpiration: "1757494779"
        }
    }
};

const qkontak = {
key: {
participant: `15517868409@s.whatsapp.net`,
...(botNumber ? {
remoteJid: `15517868409@s.whatsapp.net`
} : {})
},
message: {
'contactMessage': {
'displayName': `ç§ã¯ã‚¸ãƒ£ãƒ¼ã§ã™`,
'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=15517868409:+1 551 786-8409\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
sendEphemeral: true
}}
}

const reply = m.reply = async (teks) => {
  return sock.sendMessage(m.chat, {
    text: `${teks}`,
    mentions: [m.sender],
    contextInfo: {
      externalAdReply: {
        title: `${namaBot}`,
        body: `ã‚¸ãƒ£ãƒ¼`,
        thumbnailUrl: global.fotoOwner,
        sourceUrl: "",
      }
    }
  }, { quoted: m });
};

const example = (teks) => {
return `Cara pengguna:\n*${prefix+command}* ${teks}`
}

//=============================================//
const handleData = { text, q, args, isCmd, mime, qmsg, isOwner, command, qtxt, qkontak, reply, owners, sewa, isSewa, example, isPremGrupV1, isPremGrupV2, totalBan, isBan, isBotAdmin, isAdmin, getPluginStats, datagc1, datagc2, list, JadwalSholat, downloadContentFromMessage, S_WHATSAPP_NET, generateWAMessageFromContent, prefix,
  generateWAMessageContent, db, incrementData, getUser, getGroup, chatDb, botNumber }

if (isCmd) {
  await handleMessage(m, sock, handleData.command.toLowerCase(), handleData);
}

//=============================================//
if (isCmd) {
   const from = m.key.remoteJid;
  const chatType = from.endsWith("@g.us") ? "GROUP" : "PRIVATE";
  const status = isOwner ? "owner" : "free user";
  const fullCommand = `${prefix}${command}`; 

console.log(
    chalk.white.bold('\n'), chalk.bgGreen.bold('[âœ“] - MESSAGE DETECTED'),
    '\n' + chalk.white('â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€'),
    '\n' + chalk.white('â€º Cmd       :'), chalk.green(fullCommand),
    '\n' + chalk.white('â€º Chat In   :'), chalk.blue(chatType),
    '\n' + chalk.white('â€º Status    :'), chalk.yellow(status),
    '\n' + chalk.white('â€º Name      :'), chalk.cyan(m.pushName),
    '\n' + chalk.white('â€º Sender    :'), chalk.magenta(m.sender),
        '\n' + chalk.white('â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€') + '\n'
);
}

//=============================================//
} catch (err) {
console.log(err)
await sock.sendMessage(global.owner+"@s.whatsapp.net", {text: err.toString()}, {quoted: m})
}}

//=============================================//
const __filename = fileURLToPath(import.meta.url);
fsSync.watchFile(__filename, () => { 
    fsSync.unwatchFile(__filename); 
    console.log(chalk.white.bold("~> Update File :"), chalk.green.bold(__filename));
    import(`${pathToFileURL(__filename).href}?update=${Date.now()}`);
});