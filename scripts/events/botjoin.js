const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const ownerInfo = {
  name: "𝐒𝐚𝐢𝐟",
  facebook: "https://facebook.com/61582478533393",
  telegram: "@S41FUL0",
  supportGroup: "https://m.me/j/AbYhrDx5QWRQ54or/?send_source=gc%3Acopy_invite_link_c"
};

module.exports = {
  config: {
    name: "botjoin",
    version: "2.2",
    author: "Saimx69x",
    category: "events"
  },

  onStart: async function ({ event, api }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData } = event;
    const botID = api.getCurrentUserID();
    const addedUsers = logMessageData.addedParticipants;

    const isBotAdded = addedUsers.some(u => u.userFbId === botID);
    if (!isBotAdded) return;

    const nickNameBot = global.GoatBot.config.nickNameBot || "𝐌𝐢𝐤𝐚𝐬𝐚 𝐁𝐚𝐛𝐲 🎀";
    const prefix = global.utils.getPrefix(threadID);

    // Try to change nickname, ignore if it fails
    try {
      await api.changeNickname(nickNameBot, threadID, botID);
    } catch (err) {
      // Nickname change failed, moving on...
    }

    // Prepare the message body
    const textMsg = [
      "🎀 𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐟𝐨𝐫 𝐢𝐧𝐯𝐢𝐭𝐢𝐧𝐠 𝐦𝐞 🎀",
      `🔹 𝐁𝐨𝐭 𝐏𝐫𝐞𝐟𝐢𝐱: ${prefix}`,
      `🔸 𝐓𝐲𝐩𝐞: ${prefix}help 𝐭𝐨 𝐬𝐞𝐞 𝐚𝐥𝐥 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `👑 𝐎𝐰𝐧𝐞𝐫: ${ownerInfo.name}`,
      `🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤: ${ownerInfo.facebook}`,
      `✈️ 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦: ${ownerInfo.telegram}`,
      `🤖 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 𝐆𝐫𝐨𝐮𝐩: ${ownerInfo.supportGroup}`
    ].join("\n");

    try {
      const API_ENDPOINT = "https://xsaim8x-xxx-api.onrender.com/api/botjoin"; 
      const apiUrl = `${API_ENDPOINT}?botuid=${botID}&prefix=${encodeURIComponent(prefix)}`;
      
      const tmpDir = path.join(__dirname, "cache");
      await fs.ensureDir(tmpDir);
      const imagePath = path.join(tmpDir, `botjoin_${threadID}.png`);

      // Attempt to fetch the image with a 6-second timeout
      const response = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 6000 });
      await fs.writeFile(imagePath, response.data);

      // Send message WITH attachment
      await api.sendMessage({
        body: textMsg,
        attachment: fs.createReadStream(imagePath)
      }, threadID);

      // Clean up the image file
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    } catch (err) {
      // If API fails or times out, send ONLY the text message silently
      await api.sendMessage(textMsg, threadID);
    }
  }
};
