import { parsePhoneNumber as PhoneNumber } from 'awesome-phonenumber';
import { delay } from '@whiskeysockets/baileys';
import config from '../config.js';
import { printLog } from './print.js';

// Holds a reference to the currently-live, not-yet-registered Baileys
// socket so the web pairing site can ask it for a pairing code on demand.
let activeSocket = null;
let pairingInFlight = false;

function setPairingSocket(sock) {
    activeSocket = sock;
}

function clearPairingSocket() {
    activeSocket = null;
}

function isReadyForPairing() {
    return Boolean(activeSocket) && !pairingInFlight;
}

/**
 * Called from the DARKX MD pairing website (lib/server.js) whenever a user
 * types their WhatsApp number and asks for a code.
 * @param {string} rawNumber - digits only, with country code, no + or spaces
 * @returns {Promise<{ code: string }>}
 */
async function requestWebPairingCode(rawNumber) {
    if (!rawNumber || typeof rawNumber !== 'string') {
        throw new Error('Please provide a WhatsApp number.');
    }
    const number = rawNumber.replace(/[^0-9]/g, '');
    const pn = PhoneNumber(`+${number}`);
    if (!pn.valid) {
        throw new Error('Invalid phone number. Include the country code, e.g. 2557XXXXXXXX.');
    }
    if (!activeSocket) {
        throw new Error('Bot socket is not ready yet. Please wait a few seconds and try again.');
    }
    if (pairingInFlight) {
        throw new Error('A pairing request is already in progress. Please wait.');
    }
    pairingInFlight = true;
    try {
        await delay(500);
        let code = await activeSocket.requestPairingCode(number, config.customPairingCode || 'DARKXXMD');
        code = code?.match(/.{1,4}/g)?.join('-') || code;
        printLog('success', `Web pairing code generated for ${number}: ${code}`);
        return { code };
    }
    catch (error) {
        printLog('error', `Web pairing failed for ${number}: ${error.message}`);
        throw new Error('Could not generate a pairing code right now. Please try again shortly.');
    }
    finally {
        pairingInFlight = false;
    }
}

export { setPairingSocket, clearPairingSocket, isReadyForPairing, requestWebPairingCode };
