const axios = require("axios");
const fs = require("fs");
const path = require("path");

const formatText = (text) => {
  const mapping = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', '𝐋': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.split('').map(char => mapping[char] || char).join('');
};

module.exports = {
  config: {
    name: "alert",
    version: "1.1",
    author: "Saif",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: "Create an alert style image",
    guide: "{pn} <text>"
  },

  onStart: async function ({ api, event, message, args, usersData }) {
    const COST = 500;
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    try {
      let userData = await usersData.get(senderID);
      let currentBalance = userData.money || 0;

      // BROKE CHECK Baby
      if (currentBalance < COST) {
        return message.reply(`‎🎀\n > ${senderName}\n\n` + formatText(`• Baby, You need ${COST} coin to use this command! Use daily /quiz and Other game and come again!`));
      }

      if (!args.length) return message.reply(formatText("• Please provide text for the alert, Baby!"));

      // React with ⏳ Baby
      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      const text = encodeURIComponent(args.join(" "));
      const apiUrl = `https://api.popcat.xyz/v2/alert?text=${text}`;

      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

      // Deduct coins Baby
      const remainingBalance = currentBalance - COST;
      await usersData.set(senderID, { ...userData, money: remainingBalance });

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const filePath = path.join(cacheDir, `alert_${Date.now()}.png`);
      
      fs.writeFileSync(filePath, res.data);

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      const styledMsg = `‎🎀\n > ${senderName}\n\n` +
        `• ` + formatText(`Baby, Your Alert Image is Ready!`) + `\n` +
        `• ` + formatText(`Deducted: ${COST}`) + `\n` +
        `• ` + formatText(`Balance: ${remainingBalance} Baby`);

      message.reply({
        body: styledMsg,
        attachment: fs.createReadStream(filePath)
      }, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      message.reply(formatText("• API is busy, try again later Baby!"));
    }
  }
};
