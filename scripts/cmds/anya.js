const axios = require("axios");
const fs = require("fs-extra");
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
    name: "anya",
    version: "2.3",
    author: "kshitiz + modified by saif",
    countDown: 5,
    role: 0,
    hasPrefix: false, // No prefix needed now, Baby!
    shortDescription: "Anya TTS (No Prefix)",
    category: "anime",
    guide: "anya <text> or reply"
  },

  onStart: async function ({ api, event, args, usersData }) {
    const COST = 500;
    const senderID = event.senderID;
    const { threadID, messageID } = event;
    const senderName = await usersData.getName(senderID);

    try {
      let userData = await usersData.get(senderID);
      let balance = userData.money || 0;

      // Check balance Baby
      if (balance < COST) {
        return api.sendMessage(
          `‎🎀\n > ${senderName}\n\n` + 
          formatText(`• Baby, You need ${COST} coin to use this command! Use daily /quiz and Other game and come again!`),
          threadID, messageID
        );
      }

      let textInput = args.join(" ");
      if (event.type === "message_reply" && event.messageReply.body) {
        textInput = event.messageReply.body;
      }

      if (!textInput) {
        return api.sendMessage(formatText("• Baby, please type something for Anya to say!"), threadID, messageID);
      }

      api.setMessageReaction("⏳", messageID, (err) => {}, true);

      const encodedText = encodeURIComponent(textInput);
      const audioPath = path.resolve(__dirname, 'cache', `anya_${Date.now()}.mp3`);

      const audioApi = await axios.get(`https://api.tts.quest/v3/voicevox/synthesis?text=${encodedText}&speaker=3`);
      const audioUrl = audioApi.data.mp3StreamingUrl;

      await global.utils.downloadFile(audioUrl, audioPath);

      const remaining = balance - COST;
      await usersData.set(senderID, { ...userData, money: remaining });

      api.setMessageReaction("✅", messageID, (err) => {}, true);

      const styledMsg = `‎🎀\n > ${senderName}\n\n` +
        `• ` + formatText(`Baby, Anya has a message for you!`) + `\n` +
        `• ` + formatText(`Deducted: ${COST}`) + `\n` +
        `• ` + formatText(`Balance: ${remaining} Baby`);

      api.sendMessage({
        body: styledMsg,
        attachment: fs.createReadStream(audioPath)
      }, threadID, () => {
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      }, messageID);

    } catch (error) {
      api.setMessageReaction("❌", messageID, (err) => {}, true);
      api.sendMessage(formatText("• Something went wrong, Baby!"), threadID, messageID);
    }
  }
};
