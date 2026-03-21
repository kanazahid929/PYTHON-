const { getTime } = global.utils;

const ADMIN_THREAD_ID = "9551835831552936";

module.exports = {
  config: {
    name: "logsbot",
    isBot: true,
    version: "1.8",
    author: "♡—͟͞͞ᴛꫝ֟፝ؖ۬ᴍɪᴍ ⸙ x ChatGPT",
    envConfig: { allow: true },
    category: "events"
  },

  langs: {
    en: {
      title: "╭━━━〔 🤖 𝐋𝐎𝐆 𝐁𝐎𝐓 〕━━━╮",
      added: "✅ 𝗘𝗩𝗘𝗡𝗧: Bot has joined this group\n👤 Added by: %1",
      kicked: "❌ 𝗘𝗩𝗘𝗡𝗧: Bot has been removed from group\n👤 Kicked by: %1",
      footer: "━━━━━━━━━━━━━━━━━━━━\n🆔 Group ID: %1\n👥 Group Name: %2\n👤 User ID: %3\n⏰ Time: %4\n╰━━━━━━━━━━━━━━━━━━━━╯"
    },
    vi: {
      title: "╭━━━〔 🤖 𝐋𝐎𝐆 𝐁𝐎𝐓 〕━━━╮",
      added: "✅ SỰ KIỆN: Bot đã được thêm vào nhóm\n👤 Người thêm: %1",
      kicked: "❌ SỰ KIỆN: Bot bị kick khỏi nhóm\n👤 Người kick: %1",
      footer: "━━━━━━━━━━━━━━━━━━━━\n🆔 ID Nhóm: %1\n👥 Tên Nhóm: %2\n👤 User ID: %3\n⏰ Thời gian: %4\n╰━━━━━━━━━━━━━━━━━━━━╯"
    }
  },

  onStart: async ({ usersData, threadsData, event, api, getLang }) => {
    try {
      const botID = api.getCurrentUserID();

      const isAdded = event.logMessageType === "log:subscribe" &&
        event.logMessageData?.addedParticipants?.some(p => String(p.userFbId) === String(botID));

      const isKicked = event.logMessageType === "log:unsubscribe" &&
        String(event.logMessageData?.leftParticipantFbId) === String(botID);

      if (!isAdded && !isKicked) return;
      const { author, threadID } = event;
      if (String(author) === String(botID)) return;

      let msg = getLang("title");
      let threadName = "Unknown";
      let authorName = "Unknown";

      try { authorName = await usersData.getName(author) || "Unknown"; } catch {}

      if (isAdded) {
        const threadInfo = await api.getThreadInfo(threadID).catch(() => null);
        threadName = threadInfo?.threadName || "No Name";
        msg += `\n\n🎉 ${getLang("added", authorName)} 🎉`;
      }

      if (isKicked) {
        const threadData = await threadsData.get(threadID).catch(() => ({})) || {};
        threadName = threadData.threadName || "No Name";
        msg += `\n\n💀 ${getLang("kicked", authorName)} 💀`;
      }

      const time = getTime("DD/MM/YYYY HH:mm:ss");
      msg += `\n\n${getLang("footer", threadID, threadName, author, time)}`;

      await api.sendMessage(msg, ADMIN_THREAD_ID);

    } catch (err) {
      console.error("🛑 LOGS BOT ERROR:", err);
    }
  }
};
