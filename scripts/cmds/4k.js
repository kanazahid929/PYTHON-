const axios = require("axios");
const fs = require("fs");
const path = require("path");

const formatText = (text) => {
  const mapping = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.split('').map(char => mapping[char] || char).join('');
};

module.exports = {
  config: {
    name: "4k",
    aliases: ["remini", "enhance"],
    version: "2.4",
    role: 0, // Everyone can use this now, Baby!
    author: "Saif",
    countDown: 5,
    category: "image",
    shortDescription: "Upscale images with style",
  },

  onStart: async function ({ api, message, event, args, usersData }) {
    const sender = event.senderID;
    const name = await usersData.getName(sender);
    const COST = 500;
    
    try {
      let user = await usersData.get(sender);

      if ((user.money || 0) < COST) {
        return message.reply(`‎🎀\n > ${name}\n\n` + formatText(`• Baby, You need ${COST} coin to use this command! Use daily /quiz and Other game and come again!`));
      }

      if (
        !event.messageReply ||
        !event.messageReply.attachments ||
        !event.messageReply.attachments[0] ||
        event.messageReply.attachments[0].type !== "photo"
      ) {
        return message.reply(formatText("• Please reply to an image, Baby!"));
      }

      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      const originalUrl = event.messageReply.attachments[0].url;
      const type = args[0] && !isNaN(args[0]) ? args[0] : 2;
      const level = args[1] && ["low", "medium", "high"].includes(args[1].toLowerCase()) ? args[1].toLowerCase() : "low";

      const apiUrl = `https://arychauhann.onrender.com/api/ihancer?url=${encodeURIComponent(originalUrl)}&type=${type}&level=${level}`;

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      
      await usersData.set(sender, { ...user, money: user.money - COST });

      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      const filePath = path.join(cacheDir, `enhanced_${Date.now()}.png`);
      
      fs.writeFileSync(filePath, Buffer.from(response.data));

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      const statusMsg = `‎🎀\n > ${name}\n\n` +
        `• ` + formatText(`Baby, Your Enhanced Image is Ready!`) + `\n` +
        `• ` + formatText(`Deducted: ${COST}`) + `\n` +
        `• ` + formatText(`Balance: ${user.money - COST} Baby`);

      await message.reply({
        body: statusMsg,
        attachment: fs.createReadStream(filePath)
      });

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      message.reply(formatText("• API is busy, try again later Baby!"));
    }
  }
};
