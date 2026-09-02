const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        get forwardedNewsletterMessageInfo() {
            // Uses the JID resolved live from config.channelLinks by
            // lib/channelJids.js once the bot connects; falls back to the
            // last-known cached value if resolution hasn't happened yet.
            return {
                newsletterJid: global.primaryChannelJid || '120363319098372999@newsletter',
                newsletterName: 'DARKX MD',
                serverMessageId: -1
            };
        }
    }
};
export { channelInfo };
