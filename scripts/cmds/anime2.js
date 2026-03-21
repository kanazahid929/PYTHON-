const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "anime2",
    version: "2.3",
    author: "𓆩𝐂.𝐄.𝐎⸙𝐓𝐀𝐌𝐈𝐌𓆪",
    role: 0,
    category: "anime",
    shortDescription: "✨ Anime World",
    longDescription: "Images • GIFs • Quotes • Search • Recommendations",
    guide: {
      en:
        "🎌 anime <milf|ero|ecchi|ass|waifu|neko|megumin|maid|awoo|shinobu|cuddle|pat|ranime|aquote|achar|asearch|arecommend>"
    }
  },

  onStart: async function ({ message, args }) {
    const sub = args[0];
    if (!sub)
      return message.reply(
        "❌ 𝐌𝐢𝐬𝐬𝐢𝐧𝐠 𝐂𝐨𝐦𝐦𝐚𝐧𝐝\n✨ Use: anime <type>"
      );

    try {
      const waifuIm = async (tag, title) => {
        const { data } = await axios.get(
          `https://api.waifu.im/search/?included_tags=${tag}`
        );
        return message.reply({
          body:
            `🎀 𝐀𝐍𝐈𝐌𝐄 𝐆𝐀𝐋𝐋𝐄𝐑𝐘 🎀\n\n` +
            `✨ ${title}\n` +
            `🌸 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐀𝐌𝐈𝐌`,
          attachment: await getStreamFromURL(data.images[0].url)
        });
      };

      const simpleImg = async (url, title) => {
        const { data } = await axios.get(url);
        return message.reply({
          body:
            `💫 𝐀𝐍𝐈𝐌𝐄 𝐕𝐈𝐁𝐄 💫\n\n` +
            `💖 ${title}\n` +
            `🌸 Enjoy the moment~`,
          attachment: await getStreamFromURL(data.url)
        });
      };

      const gifSend = async (url, title) => {
        const { data } = await axios.get(url);
        return message.reply({
          body:
            `🎞️ 𝐀𝐍𝐈𝐌𝐄 𝐆𝐈𝐅 🎞️\n\n` +
            `🤍 ${title}\n` +
            `✨ Feel the emotion`,
          attachment: await getStreamFromURL(data.url)
        });
      };

      switch (sub) {
        case "milf": return waifuIm("milf", "𝐌𝐈𝐋𝐅 𝐀𝐍𝐈𝐌𝐄");
        case "ero": return waifuIm("ero", "𝐄𝐑𝐎𝐓𝐈𝐂 𝐀𝐍𝐈𝐌𝐄");
        case "ecchi": return waifuIm("ecchi", "𝐄𝐂𝐂𝐇𝐈 𝐕𝐈𝐁𝐄");
        case "ass": return waifuIm("ass", "𝐀𝐍𝐈𝐌𝐄 𝐀𝐑𝐓");
        case "maid": return waifuIm("maid", "𝐌𝐀𝐈𝐃 𝐂𝐔𝐓𝐄𝐍𝐄𝐒𝐒");

        case "waifu": return simpleImg("https://api.waifu.pics/sfw/waifu", "𝐘𝐨𝐮𝐫 𝐖𝐚𝐢𝐟𝐮 💕");
        case "neko": return simpleImg("https://api.waifu.pics/sfw/neko", "𝐍𝐞𝐤𝐨 𝐂𝐮𝐭𝐞 🐾");
        case "megumin": return simpleImg("https://api.waifu.pics/sfw/megumin", "𝐄𝐱𝐩𝐥𝐨𝐬𝐢𝐨𝐧 💥");
        case "awoo": return simpleImg("https://api.waifu.pics/sfw/awoo", "𝐀𝐰𝐨𝐨 🐺");
        case "shinobu": return simpleImg("https://api.waifu.pics/sfw/shinobu", "𝐁𝐮𝐭𝐭𝐞𝐫𝐟𝐥𝐲 🦋");

        case "cuddle": return gifSend("https://api.waifu.pics/sfw/cuddle", "𝐂𝐮𝐝𝐝𝐥𝐞 🤗");
        case "pat": return gifSend("https://api.waifu.pics/sfw/pat", "𝐏𝐚𝐭 𝐏𝐚𝐭 👋");

        case "ranime": {
          const { data } = await axios.get("https://api.jikan.moe/v4/random/anime");
          const a = data.data;
          return message.reply({
            body:
              `🎬 𝐑𝐀𝐍𝐃𝐎𝐌 𝐀𝐍𝐈𝐌𝐄 🎬\n\n` +
              `📺 ${a.title}\n` +
              `⭐ Episodes: ${a.episodes || "?"}\n` +
              `📡 Status: ${a.status}\n\n` +
              `${a.synopsis?.slice(0, 280)}...`,
            attachment: await getStreamFromURL(a.images.jpg.image_url)
          });
        }

        case "aquote": {
          const { data } = await axios.get("https://animechan.vercel.app/api/random");
          return message.reply(
            `💬 「 ${data.quote} 」\n\n👤 ${data.character}\n🎌 ${data.anime}`
          );
        }

        case "arecommend": {
          const { data } = await axios.get("https://api.jikan.moe/v4/top/anime?limit=5");
          let txt = "🌟 𝐓𝐎𝐏 𝐀𝐍𝐈𝐌𝐄 𝐑𝐄𝐂𝐎𝐌𝐌𝐄𝐍𝐃 🌟\n\n";
          data.data.forEach((a, i) => {
            txt += `✨ ${i + 1}. ${a.title} — ⭐ ${a.score}\n`;
          });
          return message.reply(txt);
        }

        default:
          return message.reply("❓ 𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐀𝐧𝐢𝐦𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝");
      }
    } catch (e) {
      console.error(e);
      return message.reply("⚠️ 𝐀𝐏𝐈 𝐄𝐫𝐫𝐨𝐫\n✨ Try again later");
    }
  }
};
