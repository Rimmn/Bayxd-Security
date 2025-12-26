import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'database.db');

const data = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('❌ Database Error:', err.message);
});

const initDb = () => {
    return new Promise((resolve, reject) => {
        data.serialize(() => {
            data.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                banned INTEGER DEFAULT 0,
                premium INTEGER DEFAULT 0,
                limit_val INTEGER DEFAULT 20,
                balance INTEGER DEFAULT 0,
                bank INTEGER DEFAULT 0,
                
                afk_time INTEGER DEFAULT -1,
                afk_reason TEXT DEFAULT '',
                
                health INTEGER DEFAULT 100,
                stamina INTEGER DEFAULT 100,
                level INTEGER DEFAULT 1,
                exp INTEGER DEFAULT 0,
                role TEXT DEFAULT 'Warga',
                
                potion INTEGER DEFAULT 0,
                iron INTEGER DEFAULT 0,
                gold INTEGER DEFAULT 0,
                diamond INTEGER DEFAULT 0,
                common_crate INTEGER DEFAULT 0,
                sword INTEGER DEFAULT 0
            )`);

            data.run(`CREATE TABLE IF NOT EXISTS groups (
                id TEXT PRIMARY KEY,
                welcome INTEGER DEFAULT 0,
                goodbye INTEGER DEFAULT 0,
                mute INTEGER DEFAULT 0,
                muted_users TEXT DEFAULT '[]',
                antilinkgc INTEGER DEFAULT 0,
                antilinkch INTEGER DEFAULT 0,
                antilinkall INTEGER DEFAULT 0,
                antipromosi INTEGER DEFAULT 0,
                antisticker INTEGER DEFAULT 0,
                antitoxic INTEGER DEFAULT 0,
                antitagsw INTEGER DEFAULT 0,
                autosholat INTEGER DEFAULT 0,
                rpg_mode INTEGER DEFAULT 1
            )`);
            
            data.run(`CREATE TABLE IF NOT EXISTS settings (
                id TEXT PRIMARY KEY,
                prefix TEXT DEFAULT '.',
                multiprefix INTEGER DEFAULT 1,
                public INTEGER DEFAULT 1,
                
                autotyping INTEGER DEFAULT 0,
                autoread INTEGER DEFAULT 0,
                readsw INTEGER DEFAULT 0,
                pconly INTEGER DEFAULT 0,
                gconly INTEGER DEFAULT 0,
                anticall INTEGER DEFAULT 0
            )`);

            data.get(`SELECT id FROM settings WHERE id = 'bot'`, (err, row) => {
                if (err) return reject(err);
                if (!row) {
                    data.run(`INSERT INTO settings (id, prefix, multiprefix, public, autotyping, autoread) VALUES ('bot', '.', 1, 1, 0, 0)`, (err) => {
                        if (err) reject(err); else resolve();
                    });
                } else { resolve(); }
            });
        });
    });
};

const getUser = (jid, name) => {
    return new Promise((resolve, reject) => {
        data.get(`SELECT * FROM users WHERE id = ?`, [jid], (err, row) => {
            if (err) return reject(err);
            if (!row) {
                const sql = `INSERT INTO users (id, name, limit_val, balance, health, stamina) VALUES (?, ?, 20, 1000, 100, 100)`;
                data.run(sql, [jid, name], (err) => {
                    if (err) return reject(err);
                    resolve({ 
                        id: jid, name, banned: 0, premium: 0, limit_val: 20, balance: 1000, 
                        afk_time: -1, afk_reason: '',
                        health: 100, stamina: 100, level: 1, exp: 0, role: 'Warga' 
                    });
                });
            } else {
                resolve(row);
            }
        });
    });
};

const getGroup = (jid) => {
    return new Promise((resolve, reject) => {
        data.get(`SELECT * FROM groups WHERE id = ?`, [jid], (err, row) => {
            if (err) return reject(err);
            if (!row) {
                data.run(`INSERT INTO groups (id) VALUES (?)`, [jid], (err) => {
                    if (err) return reject(err);
                    resolve({ 
                        id: jid, 
                        welcome: 0, goodbye: 0, mute: 0, muted_users: '[]',
                        antilinkgc: 0, antilinkch: 0, antilinkall: 0, 
                        antipromosi: 0, antisticker: 0, antitoxic: 0, antibot: 0, antitagsw: 0,
                        autosholat: 0, rpg_mode: 1
                    });
                });
            } else {
                resolve(row);
            }
        });
    });
};

const getSettings = () => {
    return new Promise((resolve, reject) => {
        data.get(`SELECT * FROM settings WHERE id = 'bot'`, (err, row) => {
            if (err) reject(err);
            resolve(row || { 
                prefix: '.', multiprefix: 1, public: 1,
                autotyping: 0, autoread: 0, readsw: 0, 
                pconly: 0, gconly: 0, anticall: 0 
            });
        });
    });
};

const db = (table, id, column, value) => {
    return new Promise((resolve, reject) => {
        if (!['users', 'groups', 'settings'].includes(table)) return reject("Invalid table");
        
        const sql = `UPDATE ${table} SET ${column} = ? WHERE id = ?`;
        data.run(sql, [value, id], function(err) {
            if (err) {
                console.error(`❌ Gagal update ${table} -> ${column}:`, err.message);
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

const incrementData = (table, id, column, value) => {
    return new Promise((resolve, reject) => {
        if (!['users', 'groups'].includes(table)) return reject("Invalid table");
        
        const sql = `UPDATE ${table} SET ${column} = ${column} + ? WHERE id = ?`;
        data.run(sql, [value, id], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

export { initDb, getUser, getGroup, getSettings, db, incrementData };