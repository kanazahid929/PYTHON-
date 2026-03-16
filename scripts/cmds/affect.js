const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const formatText = (text) => {
  const mapping = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', '𝐋': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.split('').map(char => mapping[char] || char).join('');
};

async function getFbAvatarBuffer(uid) {
  const url = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data);
}

module.exports = {
  config: {
    name: "affect",
    version: "2.1",
    author: "Saif",
    countDown: 5,
    role: 0,
    shortDescription: "Affect image with coins",
    category: "fun",
    guide: "{pn} [@tag | reply | random]"
  },

  onStart: async function({ event, message, usersData, api, args }) {
    const COST = 500;
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    try {
      let user = await usersData.get(senderID);
      let balance = user.money || 0;

      // BROKE CHECK Baby
      if (balance < COST) {
        return message.reply(`‎🎀\n > ${senderName}\n\n` + formatText(`• Baby, You need ${COST} coin to use this command! Use daily /quiz and Other game and come again!`));
      }

      // Determine Target
      const mention = Object.keys(event.mentions);
      let targetID;

      if (args[0] && ["r", "rnd", "random"].includes(args[0].toLowerCase())) {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const allUsers = threadInfo.participantIDs.filter(id => id != senderID && id != api.getCurrentUserID());
        targetID = allUsers[Math.floor(Math.random() * allUsers.length)];
      } else if (mention.length > 0) {
        targetID = mention[0];
      } else if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      } else {
        return message.reply(formatText("• Please tag or reply to someone, Baby!"));
      }

      // React with ⏳ Baby
      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      // Deduct coins
      await usersData.set(senderID, { ...user, money: balance - COST });

      const avatarBuf = await getFbAvatarBuffer(targetID);
      const img = await new DIG.Affect().getImage(avatarBuf);
      
      const tmpDir = path.join(__dirname, "cache");
      fs.ensureDirSync(tmpDir);
      const pathSave = path.join(tmpDir, `affect_${Date.now()}.png`);
      fs.writeFileSync(pathSave, Buffer.from(img));

      // Success!
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      const targetName = await usersData.getName(targetID);
      const styledMsg = `‎🎀\n > ${senderName}\n\n` +
        `• ` + formatText(`Baby, ${targetName} is Affected!`) + `\n` +
        `• ` + formatText(`Deducted: ${COST}`) + `\n` +
        `• ` + formatText(`Balance: ${balance - COST} Baby`);

      await message.reply({
        body: styledMsg,
        attachment: fs.createReadStream(pathSave)
      }, () => {
        if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
      });

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      message.reply(formatText("• Error affecting user, Baby!"));
    }
  }
};
