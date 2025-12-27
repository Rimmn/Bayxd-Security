import sqlite3 from 'sqlite3';
import path from 'path';
import config from '../../src/config/env.js'; 

const dbPath = path.join(process.cwd(), config.database.path);

console.log(`🗄️ Database path: ${dbPath}`);

const data = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database Error:', err.message);
        console.error('💡 Check if database path is correct:', dbPath);
    } else {
        console.log('✅ Database connected');
    }
});

const initDb = () => {
    return new Promise((resolve, reject) => {
        data.serialize(() => {
            // Create users table
            data.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                banned INTEGER DEFAULT 0,
                premium INTEGER DEFAULT 0,
                limit_val INTEGER DEFAULT ${config.rpg.defaultLimit},
                balance INTEGER DEFAULT ${config.rpg.defaultBalance},
                bank INTEGER DEFAULT 0,
                
                afk_time INTEGER DEFAULT -1,
                afk_reason TEXT DEFAULT '',
                
                health INTEGER DEFAULT ${config.rpg.defaultHealth},
                stamina INTEGER DEFAULT ${config.rpg.defaultStamina},
                level INTEGER DEFAULT 1,
                exp INTEGER DEFAULT 0,
                role TEXT DEFAULT 'Warga',
                
                potion INTEGER DEFAULT 0,
                iron INTEGER DEFAULT 0,
                gold INTEGER DEFAULT 0,
                diamond INTEGER DEFAULT 0,
                common_crate INTEGER DEFAULT 0,
                sword INTEGER DEFAULT 0
            )`, (err) => {
                if (err) {
                    console.error('❌ Error creating users table:', err.message);
                    reject(err);
                }
            });

            // Create groups table
            data.run(`CREATE TABLE IF NOT EXISTS groups (
                id TEXT PRIMARY KEY,
                welcome INTEGER DEFAULT ${config.group.welcome ? 1 : 0},
                goodbye INTEGER DEFAULT ${config.group.goodbye ? 1 : 0},
                mute INTEGER DEFAULT ${config.group.mute ? 1 : 0},
                muted_users TEXT DEFAULT '[]',
                antilinkgc INTEGER DEFAULT ${config.group.antilinkgc ? 1 : 0},
                antilinkch INTEGER DEFAULT ${config.group.antilinkch ? 1 : 0},
                antilinkall INTEGER DEFAULT ${config.group.antilinkall ? 1 : 0},
                antipromosi INTEGER DEFAULT ${config.group.antipromosi ? 1 : 0},
                antisticker INTEGER DEFAULT ${config.group.antisticker ? 1 : 0},
                antitoxic INTEGER DEFAULT ${config.group.antitoxic ? 1 : 0},
                antitagsw INTEGER DEFAULT ${config.group.antitagsw ? 1 : 0},
                autosholat INTEGER DEFAULT ${config.group.autosholat ? 1 : 0},
                rpg_mode INTEGER DEFAULT ${config.group.rpg_mode ? 1 : 0}
            )`, (err) => {
                if (err) {
                    console.error('❌ Error creating groups table:', err.message);
                    reject(err);
                }
            });
            
            // Create settings table
            data.run(`CREATE TABLE IF NOT EXISTS settings (
                id TEXT PRIMARY KEY,
                prefix TEXT DEFAULT '${config.bot.prefix}',
                multiprefix INTEGER DEFAULT ${config.bot.multiPrefix ? 1 : 0},
                public INTEGER DEFAULT ${config.bot.public ? 1 : 0},
                
                autotyping INTEGER DEFAULT ${config.bot.autotyping ? 1 : 0},
                autoread INTEGER DEFAULT ${config.bot.autoread ? 1 : 0},
                readsw INTEGER DEFAULT ${config.bot.readsw ? 1 : 0},
                pconly INTEGER DEFAULT ${config.bot.pconly ? 1 : 0},
                gconly INTEGER DEFAULT ${config.bot.gconly ? 1 : 0},
                anticall INTEGER DEFAULT ${config.bot.anticall ? 1 : 0}
            )`, (err) => {
                if (err) {
                    console.error('❌ Error creating settings table:', err.message);
                    reject(err);
                }
            });

            // Initialize default bot settings
            data.get(`SELECT id FROM settings WHERE id = 'bot'`, (err, row) => {
                if (err) return reject(err);
                if (!row) {
                    data.run(`INSERT INTO settings (id, prefix, multiprefix, public, autotyping, autoread) 
                              VALUES ('bot', ?, ?, ?, ?, ?)`, 
                    [
                        config.bot.prefix,
                        config.bot.multiPrefix ? 1 : 0,
                        config.bot.public ? 1 : 0,
                        config.bot.autotyping ? 1 : 0,
                        config.bot.autoread ? 1 : 0
                    ], (err) => {
                        if (err) reject(err); 
                        else {
                            console.log('✅ Default bot settings initialized');
                            resolve();
                        }
                    });
                } else { 
                    resolve(); 
                }
            });
        });
    });
};

const getUser = (jid, name) => {
    return new Promise((resolve, reject) => {
        data.get(`SELECT * FROM users WHERE id = ?`, [jid], (err, row) => {
            if (err) return reject(err);
            if (!row) {
                const sql = `INSERT INTO users (id, name, limit_val, balance, health, stamina) 
                             VALUES (?, ?, ?, ?, ?, ?)`;
                data.run(sql, [
                    jid, 
                    name, 
                    config.rpg.defaultLimit,
                    config.rpg.defaultBalance,
                    config.rpg.defaultHealth,
                    config.rpg.defaultStamina
                ], (err) => {
                    if (err) return reject(err);
                    resolve({ 
                        id: jid, 
                        name, 
                        banned: 0, 
                        premium: 0, 
                        limit_val: config.rpg.defaultLimit, 
                        balance: config.rpg.defaultBalance, 
                        afk_time: -1, 
                        afk_reason: '',
                        health: config.rpg.defaultHealth, 
                        stamina: config.rpg.defaultStamina, 
                        level: 1, 
                        exp: 0, 
                        role: 'Warga' 
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
                        welcome: config.group.welcome ? 1 : 0, 
                        goodbye: config.group.goodbye ? 1 : 0, 
                        mute: config.group.mute ? 1 : 0, 
                        muted_users: '[]',
                        antilinkgc: config.group.antilinkgc ? 1 : 0, 
                        antilinkch: config.group.antilinkch ? 1 : 0, 
                        antilinkall: config.group.antilinkall ? 1 : 0, 
                        antipromosi: config.group.antipromosi ? 1 : 0, 
                        antisticker: config.group.antisticker ? 1 : 0, 
                        antitoxic: config.group.antitoxic ? 1 : 0, 
                        antitagsw: config.group.antitagsw ? 1 : 0,
                        autosholat: config.group.autosholat ? 1 : 0, 
                        rpg_mode: config.group.rpg_mode ? 1 : 0
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
                prefix: config.bot.prefix, 
                multiprefix: config.bot.multiPrefix ? 1 : 0, 
                public: config.bot.public ? 1 : 0,
                autotyping: config.bot.autotyping ? 1 : 0, 
                autoread: config.bot.autoread ? 1 : 0, 
                readsw: config.bot.readsw ? 1 : 0, 
                pconly: config.bot.pconly ? 1 : 0, 
                gconly: config.bot.gconly ? 1 : 0, 
                anticall: config.bot.anticall ? 1 : 0 
            });
        });
    });
};

const db = (table, id, column, value) => {
    return new Promise((resolve, reject) => {
        if (!['users', 'groups', 'settings'].includes(table)) {
            return reject("Invalid table");
        }
        
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
        if (!['users', 'groups'].includes(table)) {
            return reject("Invalid table");
        }
        
        const sql = `UPDATE ${table} SET ${column} = ${column} + ? WHERE id = ?`;
        data.run(sql, [value, id], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

// Export functions
export { initDb, getUser, getGroup, getSettings, db, incrementData };

// Export database instance for direct access (if needed)
export default data;
