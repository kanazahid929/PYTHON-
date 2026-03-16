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
    name: "edit",
    aliases: ["imgedit", "e"],
    version: "2.8",
    author: "SiFu / Saif", 
    countDown: 15,
    role: 0,
    shortDescription: { en: "Edit image with Seedream V4 for 1000 coins" },
    category: "image",
    guide: "{pn} <prompt> (reply to photo)"
  },

  onStart: async function ({ message, event, api, args, usersData }) {
    const COST = 1000;
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    try {
      let userData = await usersData.get(senderID);
      let balance = userData.money || 0;

      // BROKE CHECK Baby
      if (balance < COST) {
        return message.reply(`‎🎀\n > ${senderName}\n\n` + fancy(`• Baby, You need ${COST} coins to edit an image! Use daily /quiz and other games to earn more and come back, Baby!`));
      }

      const hasPhotoReply = event.type === "message_reply" && event.messageReply?.attachments?.[0]?.type === "photo";
      if (!hasPhotoReply) {
        return message.reply(`‎🎀\n > ${senderName}\n\n` + fancy("• If you want to edit an image, please reply to a photo, Baby."));
      }

      const prompt = args.join(" ").trim();
      if (!prompt) {
        return message.reply(`‎🎀\n > ${senderName}\n\n` + fancy("• Please enter a prompt to start the editing, Baby."));
      }

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const model = "seedream v4 edit";
      const imageUrl = event.messageReply.attachments[0].url;

      const res = await axios.get("https://fluxcdibai-1.onrender.com/generate", {
        params: { prompt, model, imageUrl },
        timeout: 120000
      });

      const resultUrl = res.data?.data?.imageResponseVo?.url;

      if (!resultUrl) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(fancy("• The system could not return an edited image, Baby."));
      }

      // Deduct coins Baby
      const remaining = balance - COST;
      await usersData.set(senderID, { ...userData, money: remaining });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const successMsg = `‎🎀\n > ${senderName}\n\n` +
        `• ` + fancy(`Image edited successfully!`) + `\n` +
        `• ` + fancy(`Deducted: ${COST} Coins`) + `\n` +
        `• ` + fancy(`Balance: ${remaining} Baby`);

      await message.reply({
        body: successMsg,
        attachment: await global.utils.getStreamFromURL(resultUrl)
      });

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply(fancy("• An error occurred while editing the image, Baby."));
    }
  }
};
