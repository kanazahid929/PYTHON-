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

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "bed",
    version: "1.8",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "love",
    shortDescription: "Generate anime-style bed hug image",
    guide: "{pn} @mention"
  },

  onStart: async function ({ message, event, api, usersData }) {
    const COST = 500;
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    try {
      // Author Protection Baby
      const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
      if (module.exports.config.author.trim() !== obfuscatedAuthor) {
        return api.sendMessage("❌ | Author name changed. Contact MahMUD.", event.threadID, event.messageID);
      }

      let userData = await usersData.get(senderID);
      let balance = userData.money || 0;

      // Broke Check Baby
      if (balance < COST) {
        return message.reply(`‎🎀\n > ${senderName}\n\n` + formatText(`• Baby, You need ${COST} coin to use this! Use /quiz to earn more!`));
      }

      const mention = Object.keys(event.mentions);
      if (mention.length === 0) {
        return message.reply(formatText("• Please mention someone, Baby!"));
      }

      const targetID = mention[0];
      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      const base = await mahmud();
      const apiURL = `${base}/api/bed`;

      const response = await axios.post(
        apiURL,
        { senderID, targetID },
        { responseType: "arraybuffer" }
      );

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      const imgPath = path.join(cacheDir, `bed_${Date.now()}.png`);
      fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

      // Deduct coins Baby
      const remaining = balance - COST;
      await usersData.set(senderID, { ...userData, money: remaining });

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      const styledMsg = `‎🎀\n > ${senderName}\n\n` +
        `• ` + formatText(`Baby, Here is your special image!`) + `\n` +
        `• ` + formatText(`Deducted: ${COST}`) + `\n` +
        `• ` + formatText(`Balance: ${remaining} Baby`);

      await message.reply({
        body: styledMsg,
        attachment: fs.createReadStream(imgPath)
      }, () => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      message.reply(formatText("• Something went wrong with the bed command, Baby!"));
    }
  }
};
