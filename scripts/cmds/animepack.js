const axios = require("axios");

module.exports = {
  config: {
    name: "animepack",
    version: "3.1",
    author: "𓆩𝐂.𝐄.𝐎⸙𝐓𝐀𝐌𝐈𝐌𓆪",
    countDown: 3,
    role: 0,
    shortDescription: "Stylish Anime Pack",
    longDescription: "Neko • Waifu • AnimeGirl • Cosplay – premium stylish anime commands",
    category: "anime"
  },

  onStart: async function ({ message, args }) {
    const sub = args[0];

    // ⭐ Stylish Menu
    if (!sub) {
      return message.reply(
        "✨ 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 𝐀𝐍𝐈𝐌𝐄 𝐌𝐄𝐍𝐔\n" +
        "──────────────────────\n" +
        "✦ 𝐍𝐞𝐤𝐨\n" +
        "♡ 𝐖𝐚𝐢𝐟𝐮\n" +
        "♡ 𝐀𝐧𝐢𝐦𝐞 𝐆𝐢𝐫𝐥\n" +
        "々 𝐂𝐨𝐬𝐩𝐥𝐚𝐲\n" +
        "──────────────────────\n" +
        "➡️ Usage: animepack neko"
      );
    }

    // ⭐ Stylish Fetch Function
    async function sendAnime(url, caption) {
      try {
        const res = await axios.get(url);
        const data = res.data;

        if (!data || !data.url)
          return message.reply("⚠️ Could not fetch image.");

        return message.reply({
          attachment: await global.utils.getStreamFromUrl(data.url),
          body: caption + "\n\n— 𓆩𝐂.𝐄.𝐎⸙𝐓𝐀𝐌𝐈𝐌𓆪 ✨",
        });
      } catch (e) {
        return message.reply("❌ Error: " + e.message);
      }
    }

    // 🐱 Neko
    if (sub === "neko") {
      return sendAnime(
        "https://api.waifu.pics/sfw/neko",
        "🐱 𝐇𝐞𝐫𝐞'𝐬 𝐘𝐨𝐮𝐫 𝐍𝐞𝐤𝐨"
      );
    }

    // 💖 Waifu
    if (sub === "waifu") {
      return sendAnime(
        "https://api.waifu.pics/sfw/waifu",
        "💖 𝐘𝐨𝐮𝐫 𝐖𝐚𝐢𝐟𝐮 𝐢𝐬 𝐇𝐞𝐫𝐞"
      );
    }

    // 🐇 Anime Girl
    if (sub === "animegirl") {
      return sendAnime(
        "https://api.waifu.pics/sfw/waifu",
        "🌸 𝐑𝐚𝐧𝐝𝐨𝐦 𝐀𝐧𝐢𝐦𝐞 𝐆𝐢𝐫𝐥"
      );
    }

    // 🔥 Cosplay
    if (sub === "cosplay") {
      try {
        const res = await axios.get("https://fantox-cosplay-api.onrender.com");
        const imageUrl = res.data?.url || "https://fantox-cosplay-api.onrender.com";

        return message.reply({
          attachment: await global.utils.getStreamFromUrl(imageUrl),
          body: "々 𝐑𝐚𝐧𝐝𝐨𝐦 𝐂𝐨𝐬𝐩𝐥𝐚𝐲\n\n— 𓆩𝐂.𝐄.𝐎⸙𝐓𝐀𝐌𝐈𝐌𓆪",
        });

      } catch (err) {
        return message.reply("❌ Failed to load cosplay image.");
      }
    }

    return message.reply("❌ Invalid option baby!");
  }
};
