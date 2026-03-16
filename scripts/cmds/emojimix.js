const axios = require("axios");

const fancy = (text) => {
  const map = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', '𝐋': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.toString().split('').map(char => map[char] || char).join('');
};

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "emojimix",
    aliases: ["mix"],
    version: "2.0",
    author: "MahMUD / Saif",
    countDown: 10,
    role: 0,
    guide: "{pn} <emoji1> <emoji2>",
    category: "fun"
  },

  onStart: async function ({ message, args, event, usersData, api }) {
    const COST = 500;
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    try {
      let userData = await usersData.get(senderID);
      let balance = userData.money || 0;

      // BROKE CHECK Baby
      if (balance < COST) {
        return message.reply(`‎🎀\n > ${senderName}\n\n` + fancy(`• Baby, You need ${COST} coins to mix emojis! Use daily /quiz and other games to earn more and come back, Baby!`));
      }

      const [emoji1, emoji2] = args;
      if (!emoji1 || !emoji2) return message.reply(fancy("• Please provide two emojis to mix, Baby!"));

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const apiUrl = `${await baseApiUrl()}/api/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;
      const response = await axios.get(apiUrl, {
        headers: { "Author": "MahMUD" },
        responseType: "stream"
      });

      // DEDUCT COINS Baby
      const remaining = balance - COST;
      await usersData.set(senderID, { ...userData, money: remaining });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const successMsg = `‎🎀\n > ${senderName}\n\n` +
        `• ` + fancy(`Emojis mixed successfully!`) + `\n` +
        `• ` + fancy(`Deducted: ${COST} Coins`) + `\n` +
        `• ` + fancy(`Balance: ${remaining} Baby`);

      return message.reply({
        body: successMsg,
        attachment: response.data
      });

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      console.error(error);
      return message.reply(fancy("• These emojis can't be mixed, Baby!"));
    }
  }
};
