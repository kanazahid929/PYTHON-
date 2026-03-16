const jimp = require("jimp");
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

module.exports = {
  config: {
    name: "arrest",
    aliases: ["ar"],
    version: "2.0",
    author: "Saif",
    countDown: 5,
    role: 0,
    shortDescription: "Arrest a user",
    category: "fun",
    guide: "{pn} [@tag | reply | random]"
  },

  onStart: async function ({ message, args, api, event, usersData }) {
    const COST = 500;
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    try {
      let userData = await usersData.get(senderID);
      let balance = userData.money || 0;

      // BROKE CHECK Baby
      if (balance < COST) {
        return message.reply(`‎🎀\n > ${senderName}\n\n` + formatText(`• Baby, You need ${COST} coin to use this command! Use daily /quiz and Other game and come again!`));
      }

      // Determine target
      const mention = Object.keys(event.mentions);
      let targetID;

      if (args[0] && ["r", "rnd", "random"].includes(args[0].toLowerCase())) {
        const thread = await api.getThreadInfo(event.threadID);
        const all = thread.participantIDs.filter(id => id != senderID && id != api.getCurrentUserID());
        targetID = all[Math.floor(Math.random() * all.length)];
      } else if (mention.length > 0) {
        targetID = mention[0];
      } else if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      } else {
        return message.reply(formatText("• Please tag or reply to someone, Baby!"));
      }

      if (targetID === senderID) return message.reply(formatText("• You can't arrest yourself, Baby!"));

      // React with ⏳ Baby
      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      const targetName = await usersData.getName(targetID);
      const imgPath = await arrestImage(senderID, targetID);

      // Deduct coins Baby
      const remainingBalance = balance - COST;
      await usersData.set(senderID, { ...userData, money: remainingBalance });

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      const styledMsg = `‎🎀\n > ${senderName}\n\n` +
        `• ` + formatText(`Baby, ${targetName} is under arrest!`) + `\n` +
        `• ` + formatText(`Deducted: ${COST}`) + `\n` +
        `• ` + formatText(`Balance: ${remainingBalance} Baby`);

      return message.reply({
        body: styledMsg,
        attachment: fs.createReadStream(imgPath)
      }, () => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      message.reply(formatText("• Something went wrong, Baby!"));
    }
  }
};

async function arrestImage(one, two) {
  const av1 = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  av1.circle();

  const av2 = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  av2.circle();

  const out = path.join(__dirname, "cache", `arrest_${Date.now()}.png`);
  if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));
  
  const bg = await jimp.read("https://i.imgur.com/ep1gG3r.png");

  bg.resize(500, 500)
    .composite(av1.resize(100, 100), 375, 9)
    .composite(av2.resize(100, 100), 160, 92);

  await bg.writeAsync(out);
  return out;
}
