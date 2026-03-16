const axios = require("axios");

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
    name: "pinterest2",
    aliases: ["pin2"],
    version: "2.2",
    author: "Aminul Sordar",
    countDown: 10,
    role: 0,
    shortDescription: "Search Pinterest images (v2) with coins",
    category: "image",
    guide: "{pn} <keyword> | <limit>"
  },

  onStart: async function ({ message, args, event, usersData, api }) {
    const COST = 500;
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    try {
      let userData = await usersData.get(senderID);
      let balance = userData.money || 0;

      // UPDATED BROKE CHECK Baby
      if (balance < COST) {
        return message.reply(`‎🎀\n > ${senderName}\n\n` + formatText(`• Baby, You need ${COST} coins to use this command! Use daily /quiz and other games to earn more and come back, Baby!`));
      }

      if (!args[0]) {
        return message.reply(formatText("• Baby, please provide a search keyword! Example: pin2 aesthetic | 6"));
      }

      const input = args.join(" ").split("|");
      const search = input[0].trim();
      const limit = input[1] ? parseInt(input[1].trim()) : 5;

      if (limit > 10) {
        return message.reply(formatText("• Baby, the maximum limit is 10 images!"));
      }

      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      // Using the Aminul REST API Baby
      const apiUrl = `https://aminul-rest-api-three.vercel.app/image/pinterest?search=${encodeURIComponent(search)}&limit=${limit}`;
      const res = await axios.get(apiUrl);

      if (!res.data.status || !res.data.data.images || res.data.data.images.length === 0) {
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
        return message.reply(formatText("• No images found for your search, Baby!"));
      }

      const images = res.data.data.images;
      const attachments = [];

      for (let img of images) {
        try {
          const stream = (await axios.get(img, { responseType: "stream" })).data;
          attachments.push(stream);
        } catch (e) {
          console.error("Stream error, Baby:", e);
        }
      }

      // Deduct coins Baby
      const remaining = balance - COST;
      await usersData.set(senderID, { ...userData, money: remaining });

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      const styledMsg = `‎🎀\n > ${senderName}\n\n` +
        `• ` + formatText(`Baby, Pinterest v2 Results for: ${search}`) + `\n` +
        `• ` + formatText(`Deducted: ${COST}`) + `\n` +
        `• ` + formatText(`Balance: ${remaining} Baby`);

      return message.reply({
        body: styledMsg,
        attachment: attachments
      });

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      console.error(err);
      return message.reply(formatText("• API Error on Pinterest v2, Baby!"));
    }
  }
};
