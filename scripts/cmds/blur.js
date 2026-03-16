const axios = require("axios");

const formatText = (text) => {
  const mapping = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', '𝐋': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.split('').map(char => mapping[char] || char).join('');
};

const baseApi = async () => {
  const res = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json"
  );
  return res.data.mahmud;
};

module.exports = {
  config: {
    name: "blur",
    version: "2.1",
    author: "Saif",
    countDown: 5,
    role: 0,
    category: "image",
    shortDescription: "Blur an image with coins",
    guide: "{pn} [reply image] [1–100]"
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    const COST = 500;
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    try {
      let userData = await usersData.get(senderID);
      let balance = userData.money || 0;

      // BROKE CHECK Baby
      if (balance < COST) {
        return message.reply(`‎🎀\n > ${senderName}\n\n` + formatText(`• Baby, You need ${COST} coin to use this command! Use /quiz to earn more!`));
      }

      let imageUrl;
      let blurLevel = 50;

      // Determine Image Source Baby
      if (event.type === "message_reply" && event.messageReply.attachments?.length > 0) {
        imageUrl = event.messageReply.attachments[0].url;
        if (!isNaN(args[0])) {
          const lv = Number(args[0]);
          if (lv >= 1 && lv <= 100) blurLevel = lv;
        }
      } else if (args[0]?.startsWith("http")) {
        imageUrl = args[0];
        if (!isNaN(args[1])) {
          const lv = Number(args[1]);
          if (lv >= 1 && lv <= 100) blurLevel = lv;
        }
      } else {
        return message.reply(formatText("• Baby, please reply to an image or provide a link!"));
      }

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const apiUrl = await baseApi();
      const finalUrl = `${apiUrl}/api/blur/mahmud?url=${encodeURIComponent(imageUrl)}&blurLevel=${blurLevel}`;

      // Deduct coins Baby
      const remaining = balance - COST;
      await usersData.set(senderID, { ...userData, money: remaining });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const styledMsg = `‎🎀\n > ${senderName}\n\n` +
        `• ` + formatText(`Baby, Image Blurred Successfully!`) + `\n` +
        `• ` + formatText(`Blur Level: ${blurLevel}%`) + `\n` +
        `• ` + formatText(`Deducted: ${COST}`) + `\n` +
        `• ` + formatText(`Balance: ${remaining} Baby`);

      message.reply({
        body: styledMsg,
        attachment: await global.utils.getStreamFromURL(finalUrl)
      });

    } catch (e) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(formatText("• Something went wrong, Baby!"));
    }
  }
};
