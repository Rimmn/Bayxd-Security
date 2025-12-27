/*
  Security GitHub - Safe Version
  Repository: Rimmn/Bayxd-Security
*/

import axios from 'axios';
import config from '../../src/config/env.js';

// === CACHE SYSTEM ===
let cacheData = null;
let lastFetch = 0;

// === VALIDATE CONFIG ===
function validateConfig() {
  console.log('🔐 Security Config Check:');
  console.log('   Repository:', `${config.github.owner}/${config.github.repo}`);
  console.log('   Data File:', config.github.file);
  console.log('   Backup:', config.github.backup ? '✅ ON' : '❌ OFF');
  
  if (!config.github.token) {
    console.error('❌ ERROR: GITHUB_TOKEN tidak ditemukan!');
    console.error('💡 Tambahkan Environment Variable: GITHUB_TOKEN');
    return false;
  }
  
  console.log('✅ Config valid');
  return true;
}

// === GET GITHUB API URL ===
function getGitHubUrl() {
  return `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${config.github.file}`;
}

// === FETCH FROM GITHUB ===
async function fetchFromGitHub() {
  if (!validateConfig()) {
    return { nomor: [] };
  }
  
  try {
    console.log('📥 Fetching from GitHub...');
    const apiUrl = getGitHubUrl();
    
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `token ${config.github.token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'JARR-Bot-Security'
      },
      timeout: 30000
    });
    
    const content = Buffer.from(response.data.content, 'base64').toString('utf8');
    let data;
    
    try {
      data = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ Error parsing JSON');
      data = { nomor: [] };
    }
    
    if (!data.nomor || !Array.isArray(data.nomor)) {
      data.nomor = [];
    }
    
    console.log(`✅ Fetched ${data.nomor.length} items from GitHub`);
    return data;
    
  } catch (error) {
    console.error('❌ GitHub API Error');
    return { nomor: [] };
  }
}

// === MAIN FUNCTION ===
export async function scurityDB(forceRefresh = false) {
  try {
    const now = Date.now();
    
    if (!forceRefresh && cacheData && (now - lastFetch < config.github.cacheTime)) {
      return cacheData;
    }
    
    const data = await fetchFromGitHub();
    
    cacheData = data;
    lastFetch = now;
    
    return data;
    
  } catch (error) {
    return { nomor: [] };
  }
}

// === UPDATE DATABASE ===
export async function upNumber(newData) {
  try {
    if (!validateConfig()) {
      throw new Error('Invalid configuration');
    }
    
    if (!newData || typeof newData !== 'object') {
      throw new Error('Invalid data format');
    }
    
    if (!newData.nomor || !Array.isArray(newData.nomor)) {
      newData.nomor = [];
    }
    
    console.log('📤 Updating GitHub database...');
    
    const apiUrl = getGitHubUrl();
    
    const currentFile = await axios.get(apiUrl, {
      headers: {
        Authorization: `token ${config.github.token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
    
    const content = JSON.stringify(newData, null, 2);
    const encodedContent = Buffer.from(content).toString('base64');
    
    const updateData = {
      message: `Database update - ${new Date().toLocaleString()}`,
      content: encodedContent,
      sha: currentFile.data.sha
    };
    
    await axios.put(apiUrl, updateData, {
      headers: {
        Authorization: `token ${config.github.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    cacheData = newData;
    lastFetch = Date.now();
    
    console.log('✅ Database updated successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to update database');
    throw error;
  }
}

// === UTILITY FUNCTIONS ===
export function clearCache() {
  cacheData = null;
  lastFetch = 0;
  console.log('🗑️ Cache cleared');
}

export function getCacheInfo() {
  return {
    hasCache: cacheData !== null,
    lastFetch: lastFetch,
    itemCount: cacheData?.nomor?.length || 0
  };
}

// === INITIALIZE ===
console.log('🔐 Security System Initialized');

if (config.github.backup) {
  console.log('🔄 GitHub backup enabled');
}

export default {
  scurityDB,
  upNumber,
  clearCache,
  getCacheInfo
};
