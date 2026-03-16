const axios = require('axios');
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");
const { performance } = require('perf_hooks');

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
    name: "sing",
    aliases: ["song"],
    version: "1.1.0",
    author: "bayjid+saif",
    category: "music",
    shortDescription: "Fast Download with React",
    guide: "{pn} <song name>"
  },

  onStart: async function ({ api, event, args, usersData }) {
    const start = performance.now();
    try {
      const COST = 500;
      const sender = event.senderID;
      const name = await usersData.getName(sender);
      let user = await usersData.get(sender);

      if ((user.money || 0) < COST) {
        return api.sendMessage(`‎🎀\n > ${name}\n\n` + formatText(`• Baby, You need ${COST} coin to use this command! Use daily /quiz and Other game and come again!`), event.threadID, event.messageID);
      }

      if (!args[0]) return api.sendMessage(formatText("• Type a song name, Baby!"), event.threadID, event.messageID);

      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      const vID = args[0].match(/(?:v=|\/)([0-9A-Za-z_-]{11})/) ? args[0].match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)[1] : (await yts(args.join(" "))).videos[0]?.videoId;
      
      if (!vID) {
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
        return api.sendMessage(formatText("• Not found, Baby!"), event.threadID, event.messageID);
      }

      await usersData.set(sender, { ...user, money: user.money - COST });

      const { data } = await axios.get(`https://www.noobs-api.top/dipto/ytDl3?link=${vID}&format=mp3`);
      if (!data.downloadLink) throw new Error();

      const tmp = path.join(__dirname, `cache`, `${Date.now()}.mp3`);
      if (!fs.existsSync(path.join(__dirname, `cache`))) fs.mkdirSync(path.join(__dirname, `cache`));

      const res = await axios({ url: data.downloadLink, method: "GET", responseType: "stream" });
      const stream = res.data.pipe(fs.createWriteStream(tmp));

      stream.on("finish", () => {
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
        
        const time = ((performance.now() - start) / 1000).toFixed(2);
        const msg = `‎🎀\n > ${name}\n\n` +
          `• ` + formatText(`Baby, Your Song is Ready!`) + `\n` +
          `• ` + formatText(`Deducted: ${COST}`) + `\n` +
          `• ` + formatText(`Balance: ${user.money - COST}`) + `\n` +
          `• ` + formatText(`Time: ${time}s Baby`);

        api.sendMessage({ body: msg, attachment: fs.createReadStream(tmp) }, event.threadID, () => {
          if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
        }, event.messageID);
      });

    } catch (e) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      api.sendMessage(formatText("• Error processing, Baby!"), event.threadID, event.messageID);
    }
  }
};
