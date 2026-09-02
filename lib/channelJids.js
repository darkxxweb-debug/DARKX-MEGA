import fs, { existsSync, mkdirSync } from 'fs';
import path from 'path';
import config from '../config.js';
import { printLog } from './print.js';

const CACHE_PATH = path.join(process.cwd(), 'data', 'channelJids.json');

/**
 * Extract the invite code from a WhatsApp channel link.
 * e.g. https://whatsapp.com/channel/0029VbBV3Zc4tRrpgtNVVk1a -> 0029VbBV3Zc4tRrpgtNVVk1a
 */
function extractInviteCode(link) {
    const match = String(link).match(/channel\/([A-Za-z0-9]+)/);
    return match ? match[1] : null;
}

function readCache() {
    try {
        if (!existsSync(CACHE_PATH))
            return {};
        return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
    }
    catch {
        return {};
    }
}

function writeCache(data) {
    try {
        if (!existsSync(path.dirname(CACHE_PATH)))
            mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
        fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
    }
    catch (e) {
        printLog('error', `Failed to cache channel JIDs: ${e.message}`);
    }
}

/**
 * Resolve the real newsletter JIDs for every link in config.channelLinks
 * by asking WhatsApp for the invite metadata, then cache + expose them.
 * Call this once the socket connection is open.
 */
async function resolveChannelJids(sock) {
    const links = config.channelLinks || (config.channelLink ? [config.channelLink] : []);
    const cache = readCache();
    const results = [];
    for (const link of links) {
        const code = extractInviteCode(link);
        if (!code) {
            printLog('warning', `Could not parse invite code from channel link: ${link}`);
            continue;
        }
        if (cache[code]?.jid) {
            results.push({ link, jid: cache[code].jid, name: cache[code].name });
            continue;
        }
        try {
            const meta = await sock.newsletterMetadata('invite', code);
            const jid = meta?.id;
            if (jid) {
                cache[code] = { jid, name: meta?.name || null, link };
                results.push({ link, jid, name: meta?.name || null });
                printLog('success', `Channel JID resolved: ${link} -> ${jid}`);
            }
            else {
                printLog('warning', `No JID returned for channel link: ${link}`);
            }
        }
        catch (e) {
            printLog('error', `Failed to resolve channel JID for ${link}: ${e.message}`);
        }
    }
    writeCache(cache);
    global.channelJids = results;
    global.primaryChannelJid = results[0]?.jid || null;
    return results;
}

function getCachedChannelJids() {
    const cache = readCache();
    return Object.values(cache);
}

export { resolveChannelJids, getCachedChannelJids, extractInviteCode };
