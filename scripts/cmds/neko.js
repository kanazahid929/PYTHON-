const axios = require("axios");

module.exports = {
  config: {
    name: "neko",
    version: "1.1",
    author: "𓆩𝐂.𝐄.𝐎⸙𝐓𝐀𝐌𝐈𝐌𓆪",
    role: 0,
    shortDescription: "𝐂𝐮𝐭𝐞 𝐍𝐞𝐤𝐨",
    category: "anime",
    countDown: 5
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get("https://api.waifu.pics/sfw/neko");
      return message.reply({
        body: "🌸 𝐂𝐮𝐭𝐞 𝐍𝐞𝐤𝐨 𝐀𝐥𝐞𝐫𝐭 😽✨\n💗 𝐄𝐧𝐣𝐨𝐲 𝐭𝐡𝐞 𝐚𝐝𝐨𝐫𝐚𝐛𝐥𝐞 𝐯𝐢𝐛𝐞!",
        attachment: await global.utils.getStreamFromURL(res.data.url)
      });
    } catch (e) {
      return message.reply("😿 𝐍𝐞𝐤𝐨 𝐥𝐨𝐚𝐝 𝐡𝐨𝐲 𝐧𝐚𝐢");
    }
  }
};
