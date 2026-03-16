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

module.exports = {
  config: {
    name: "ads",
    version: "1.4",
    author: "SAIF",
    countDown: 5,
    role: 0,
    shortDescription: "Advertisement fun image!",
    category: "fun",
    guide: "{pn} [mention|reply|blank]",
  },

  onStart: async function ({ api, event, message, usersData }) {
    const COST = 500;
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    try {
      let user = await usersData.get(senderID);

      // BROKE CHECK Baby
      if ((user.money || 0) < COST) {
        return api.sendMessage(
          `‎🎀\n > ${senderName}\n\n` +
          formatText(`• Baby, You need ${COST} coin to use this command! Use daily /quiz and Other game and come again!`),
          event.threadID, event.messageID
        );
      }

      // Determine target UID
      let uid;
      const mention = Object.keys(event.mentions || {});
      if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
      } else if (mention.length > 0) {
        uid = mention[0];
      } else {
        uid = senderID;
      }

      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      // Fetch Avatar and Generate
      const avatarBuf = await getFbAvatarBuffer(uid);
      const imgBuffer = await new DIG.Ad().getImage(avatarBuf);

      // Deduct coins Baby
      await usersData.set(senderID, { ...user, money: user.money - COST });

      const tmpDir = path.join(__dirname, "cache");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const filePath = path.join(tmpDir, `ads_${Date.now()}.png`);
      fs.writeFileSync(filePath, Buffer.from(imgBuffer));

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      const targetName = await usersData.getName(uid);
      const styledMsg = `‎🎀\n > ${senderName}\n\n` +
        `• ` + formatText(`Baby, Latest Brand In The Market!`) + `\n` +
        `• ` + formatText(`Deducted: ${COST}`) + `\n` +
        `• ` + formatText(`Balance: ${user.money - COST} Baby`);

      message.reply({
        body: styledMsg,
        attachment: fs.createReadStream(filePath),
      }, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      message.reply(formatText("• Something went wrong, Baby!"));
    }
  }
};

async function getFbAvatarBuffer(uid) {
  const url = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data);
}
