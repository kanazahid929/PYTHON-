const jimp = require("jimp");
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
    name: "condom",
    version: "2.0",
    author: "Saif",
    countDown: 20,
    role: 0,
    shortDescription: "Condom meme with auto-random targeting",
    category: "fun",
    guide: "{pn} [@mention | reply | blank for random]"
  },

  onStart: async function({ message, event, usersData, api }) {
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

      // Determine target Baby
      let uid;
      if (Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
      } else if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
      } else {
        // AUTO RANDOM if blank Baby
        const threadInfo = await api.getThreadInfo(event.threadID);
        const participants = threadInfo.participantIDs.filter(id => id != senderID && id != api.getCurrentUserID());
        if (participants.length === 0) return message.reply(formatText("• No one else is here for the prank, Baby!"));
        uid = participants[Math.floor(Math.random() * participants.length)];
      }

      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      const targetName = await usersData.getName(uid);
      const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      
      const avatar = await jimp.read(avatarURL);
      const baseImage = await jimp.read("https://i.imgur.com/cLEixM0.jpg");
      
      baseImage.resize(512, 512).composite(avatar.resize(263, 263), 256, 258);
      
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `condom_${uid}_${Date.now()}.png`);
      await baseImage.writeAsync(filePath);

      // Deduct coins Baby
      const remaining = balance - COST;
      await usersData.set(senderID, { ...userData, money: remaining });

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      const styledMsg = `‎🎀\n > ${senderName}\n\n` +
        `• ` + formatText(`Baby, Look at this condom fail: @${targetName}!`) + `\n` +
        `• ` + formatText(`Deducted: ${COST}`) + `\n` +
        `• ` + formatText(`Balance: ${remaining} Baby`);

      await message.reply({
        body: styledMsg,
        mentions: [{ tag: `@${targetName}`, id: uid }],
        attachment: fs.createReadStream(filePath)
      }, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      console.error(err);
      message.reply(formatText("• Failed to create the meme, Baby!"));
    }
  }
};
