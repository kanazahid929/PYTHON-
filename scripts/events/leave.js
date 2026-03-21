const { getTime, getStreamFromURL } = global.utils;

module.exports = {
    config: {
        name: "leave",
        version: "3.0",
        author: "SAIF (Modified By ♡—͟͞͞ᴛꫝ֟፝ؖ۬ᴍɪᴍ ⸙)",
        category: "events"
    },

    langs: {  
        vi: {  
            session1: "🌅 Buổi Sáng",  
            session2: "☀️ Buổi Trưa",  
            session3: "🌤️ Buổi Chiều",  
            session4: "🌙 Buổi Tối",  
            leaveType1: "🚪 Tự rời khỏi nhóm",  
            leaveType2: "⚒️ Bị Admin sa thải",  
            defaultLeaveMessage: "╭━━━〔 💠 𝐋𝐄𝐀𝐕𝐄 𝐍𝐎𝐓𝐈𝐅𝐘 💠 〕━━━\n┃\n┃  ✨ 𝐍𝐚𝐦𝐞: {userName}\n┃  📝 𝐒𝐭𝐚𝐭𝐮𝐬: {type}\n┃  🕒 𝐓𝐢𝐦𝐞: {time}\n┃  🌤️ 𝐒𝐞𝐬𝐬𝐢𝐨𝐧: {session}\n┃  🌟 𝐆𝐫𝐨𝐮𝐩: {threadName}\n┃\n┃  💌 𝐂𝐚̉𝐦 𝐨̛𝐧 𝐛𝐚̣𝐧 đ𝐚̃ đ𝐨̂̀𝐧𝐠 𝐡𝐚̀𝐧𝐡!\n╰━━━━━━━━━━━━━━━━━━━━━━━🌺"
        },
        en: {
            session1: "🌅 𝐌𝐨𝐫𝐧𝐢𝐧𝐠",
            session2: "☀️ 𝐍𝐨𝐨𝐧",
            session3: "🌇 𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧",
            session4: "🌃 𝐍𝐢𝐠𝐡𝐭",
            leaveType1: "🚪 𝐒𝐞𝐥𝐟-𝐋𝐞𝐟𝐭",
            leaveType2: "⚒️ 𝐊𝐢𝐜𝐤𝐞𝐝 𝐛𝐲 𝐀𝐝𝐦𝐢𝐧",
            defaultLeaveMessage: "╭━━━〔 𝐆𝐎𝐎𝐃 𝐁𝐘𝐄 〕━━━\n┃  💔 𝐒𝐚𝐝 𝐭𝐨 𝐬𝐞𝐞 𝐲𝐨𝐮 𝐠𝐨...\n┣━━━━━━━━━━━━━━━🌺\n┃  👤 𝐔𝐬𝐞𝐫: {userName}\n┃  📊 𝐄𝐯𝐞𝐧𝐭: {type}\n┃  ⏰ 𝐓𝐢𝐦𝐞: {time}\n┃  🌆 𝐏𝐡𝐚𝐬𝐞: {session}\n┃  🛡️ 𝐆𝐫𝐨𝐮𝐩: {threadName}\n┣━━━━━━━━━━━━━━━🌺\n┃  👋 𝐖𝐞 𝐰𝐢𝐬𝐡 𝐲𝐨𝐮 𝐭𝐡𝐞 𝐛𝐞𝐬𝐭 𝐥𝐮𝐜𝐤!\n╰━━━〔 𝐓𝐀𝐌𝐈𝐌 ⸙ 〕━━━"
        }
    },

    onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {  
        if (event.logMessageType !== "log:unsubscribe") return;  

        const { threadID } = event;  
        const threadData = await threadsData.get(threadID);  
        
        // Auto-enable if not set, or return if disabled
        if (!threadData.settings.sendLeaveMessage) return;  

        const { leftParticipantFbId } = event.logMessageData;  
        if (leftParticipantFbId == api.getCurrentUserID()) return;  

        const timeNow = getTime("HH:mm:ss");  
        const currentHour = parseInt(timeNow.split(":")[0]);  
        const threadName = threadData.threadName || "Unknown Group";  
        const userName = await usersData.getName(leftParticipantFbId) || "User";  

        const isKicked = leftParticipantFbId != event.author;
        let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data || {};  
        
        const session =  
            currentHour <= 10 ? getLang("session1") :  
            currentHour <= 12 ? getLang("session2") :  
            currentHour <= 18 ? getLang("session3") :  
            getLang("session4");

        const form = {  
            mentions: leaveMessage.includes("{userNameTag}") ? [{ tag: userName, id: leftParticipantFbId }] : []  
        };  

        leaveMessage = leaveMessage  
            .replace(/\{userName\}|\{userNameTag\}/g, userName)  
            .replace(/\{type\}/g, isKicked ? getLang("leaveType2") : getLang("leaveType1"))  
            .replace(/\{threadName\}|\{boxName\}/g, threadName)  
            .replace(/\{time\}/g, timeNow)  
            .replace(/\{session\}/g, session);  

        form.body = leaveMessage;  

        try {
            const gifUrl = isKicked 
                ? "https://files.catbox.moe/030e3f.gif" // Kicked GIF
                : "https://files.catbox.moe/tp5gqa.gif"; // Leave GIF
            
            const attachment = await getStreamFromURL(gifUrl);
            if (attachment) form.attachment = [attachment];
        } catch (err) {
            console.error("Gif error:", err);
        }

        return message.send(form);  
    }
};
