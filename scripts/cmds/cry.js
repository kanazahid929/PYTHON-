const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const fancy = (text) => {
  const map = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', '𝐋': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.toString().split('').map(char => map[char] || char).join('');
};

module.exports = {
  config: {
    name: "cry",
    version: "2.6",
    author: "Saif",
    countDown: 10,
    role: 0,
    shortDescription: "Cry looking at a photo with 500 coins",
    category: "fun",
    guide: "{pn} [@tag | reply | blank for random]",
  },

  onStart: async function({ event, message, usersData, api, args }) {
    const COST = 500;
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    try {
      let userData = await usersData.get(senderID);
      let balance = userData.money || 0;

      // UPDATED BROKE CHECK Baby
      if (balance < COST) {
        return message.reply(`‎🎀\n > ${senderName}\n\n` + fancy(`• Baby, You need ${COST} coins to use this command! Use daily /quiz and other games to earn more and come back, Baby!`));
      }

      // Determine target Baby
      let targetID;
      if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } else if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      } else {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const participants = threadInfo.participantIDs.filter(id => id != senderID && id != api.getCurrentUserID());
        if (participants.length === 0) return message.reply(fancy("• No one else is here to make you cry, Baby!"));
        targetID = participants[Math.floor(Math.random() * participants.length)];
      }

      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      const targetName = await usersData.getName(targetID);
      const avatarURL = `https://graph.facebook.com/${targetID}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      
      const res = await axios.get(avatarURL, { responseType: "arraybuffer" });
      const avatarBuffer = Buffer.from(res.data);

      const imgBuffer = await new DIG.Mikkelsen().getImage(avatarBuffer);
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `cry_${targetID}_${Date.now()}.png`);
      await fs.writeFile(filePath, imgBuffer);

      // Deduct coins Baby
      const remaining = balance - COST;
      await usersData.set(senderID, { ...userData, money: remaining });

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      const styledMsg = `‎🎀\n > ${senderName}\n\n` +
        `• ` + fancy(`Baby, you are crying looking at @${targetName}'s photo!`) + `\n` +
        `• ` + fancy(`Deducted: ${COST}`) + `\n` +
        `• ` + fancy(`Balance: ${remaining} Baby`);

      await message.reply({
        body: styledMsg,
        mentions: [{ tag: `@${targetName}`, id: targetID }],
        attachment: fs.createReadStream(filePath)
      }, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      console.error(err);
      return message.reply(fancy("• Failed to generate image, Baby!"));
    }
  }
};
