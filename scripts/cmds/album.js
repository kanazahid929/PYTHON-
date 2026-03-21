const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//           🎬 ALBUM — by Tamim
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BASE_API  = "https://nix-album-api.vercel.app";
const IMGUR_API = "https://apis-toop.vercel.app/aryan/imgur";

// ── Single source of truth ──────────────────
const CATEGORIES = [
  { key: "funny",     label: "🤣 𝐅𝐮𝐧𝐧𝐲",       caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐅𝐮𝐧𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 😺"       },
  { key: "islamic",   label: "☪️ 𝐈𝐬𝐥𝐚𝐦𝐢𝐜",     caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 ✨"     },
  { key: "sad",       label: "😢 𝐒𝐚𝐝",           caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐒𝐚𝐝 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 😢"           },
  { key: "anime",     label: "🌟 𝐀𝐧𝐢𝐦𝐞",        caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐀𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🌟"        },
  { key: "lofi",      label: "🎶 𝐋𝐨𝐅𝐈",          caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐋𝐨𝐅𝐈 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🎶"          },
  { key: "attitude",  label: "☠️ 𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞",     caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 ☠️"     },
  { key: "ff",        label: "🎮 𝐅𝐫𝐞𝐞𝐅𝐢𝐫𝐞",      caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐅𝐫𝐞𝐞𝐅𝐢𝐫𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🎮"      },
  { key: "love",      label: "💖 𝐋𝐨𝐯𝐞",          caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐋𝐨𝐯𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 💖"          },
  { key: "horny",     label: "🥵 𝐇𝐨𝐫𝐧𝐲",         caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐇𝐨𝐫𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🥵"         },
  { key: "baby",      label: "🥰 𝐁𝐚𝐛𝐲",           caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐁𝐚𝐛𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🥰"           },
  { key: "romantic",  label: "😍 𝐑𝐨𝐦𝐚𝐧𝐭𝐢𝐜",      caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐑𝐨𝐦𝐚𝐧𝐭𝐢𝐜 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 😍"      },
  { key: "cartoon",   label: "🙅 𝐂𝐚𝐫𝐭𝐨𝐨𝐧",       caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐂𝐚𝐫𝐭𝐨𝐨𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🙅"       },
  { key: "pubg",      label: "🎮 𝐏𝐔𝐁𝐆",           caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐏𝐔𝐁𝐆 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🎮"           },
  { key: "emotional", label: "😌 𝐄𝐦𝐨𝐭𝐢𝐨𝐧𝐚𝐥",     caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐄𝐦𝐨𝐭𝐢𝐨𝐧𝐚𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 😌"     },
  { key: "meme",      label: "🐥 𝐌𝐞𝐦𝐞",           caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐌𝐞𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🐥"           },
  { key: "song",      label: "🎧 𝐒𝐨𝐧𝐠",           caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐒𝐨𝐧𝐠 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🎧"           },
  { key: "friend",    label: "👭 𝐅𝐫𝐢𝐞𝐧𝐝",         caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐅𝐫𝐢𝐞𝐧𝐝 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 👭"         },
  { key: "trending",  label: "🎯 𝐓𝐫𝐞𝐧𝐝𝐢𝐧𝐠",       caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐓𝐫𝐞𝐧𝐝𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🎯"       },
  { key: "hinata",    label: "🧑‍🦰 𝐇𝐢𝐧𝐚𝐭𝐚",        caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐇𝐢𝐧𝐚𝐭𝐚 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🧑‍🦰"        },
  { key: "gojo",      label: "🧔 𝐆𝐨𝐣𝐨",            caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐆𝐨𝐣𝐨 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🧔"            },
  { key: "car",       label: "🚗 𝐂𝐚𝐫",             caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐂𝐚𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🚗"             },
  { key: "cat",       label: "🐈 𝐂𝐚𝐭",             caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐂𝐚𝐭 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🐈"             },
  { key: "random",    label: "🌎 𝐑𝐚𝐧𝐝𝐨𝐦",          caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐑𝐚𝐧𝐝𝐨𝐦 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🌎"          },
  { key: "game",      label: "🕹️ 𝐆𝐚𝐦𝐞",            caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐆𝐚𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🕹️"            },
  { key: "asif",      label: "🧑‍🚀 𝐀𝐬𝐢𝐟 𝐇𝐮𝐣𝐮𝐫",    caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐀𝐬𝐢𝐟 𝐇𝐮𝐣𝐮𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🧑‍🚀"    },
  { key: "azhari",    label: "👳 𝐀𝐳𝐡𝐚𝐫𝐢 𝐇𝐮𝐣𝐮𝐫",   caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐀𝐳𝐡𝐚𝐫𝐢 𝐇𝐮𝐣𝐮𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 👳"   },
  { key: "girl",      label: "💃 𝐆𝐢𝐫𝐥",            caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐆𝐢𝐫𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 💃"            },
  { key: "travel",    label: "✈️ 𝐓𝐫𝐚𝐯𝐞𝐥",          caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐓𝐫𝐚𝐯𝐞𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 ✈️"          },
  { key: "food",      label: "🍔 𝐅𝐨𝐨𝐝",            caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐅𝐨𝐨𝐝 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🍔"            },
  { key: "nature",    label: "🌿 𝐍𝐚𝐭𝐮𝐫𝐞",          caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐍𝐚𝐭𝐮𝐫𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🌿"          },
  { key: "tiktok",    label: "💥 𝐓𝐢𝐤𝐓𝐨𝐤",          caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐓𝐢𝐤𝐓𝐨𝐤 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 💥"          },
  { key: "naruto",    label: "🙋 𝐍𝐚𝐫𝐮𝐭𝐨",          caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐍𝐚𝐫𝐮𝐭𝐨 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🙋"          },
  { key: "phone",     label: "📱 𝐏𝐡𝐨𝐧𝐞",           caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐏𝐡𝐨𝐧𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 📱"           },
  { key: "editing",   label: "💻 𝐄𝐝𝐢𝐭𝐢𝐧𝐠",         caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐄𝐝𝐢𝐭𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 💻"         },
  { key: "neymar",    label: "⚽ 𝐍𝐞𝐲𝐦𝐚𝐫",          caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐍𝐞𝐲𝐦𝐚𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 ⚽"          },
  { key: "messi",     label: "⚽ 𝐌𝐞𝐬𝐬𝐢",           caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐌𝐞𝐬𝐬𝐢 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 ⚽"           },
  { key: "ronaldo",   label: "⚽ 𝐑𝐨𝐧𝐚𝐥𝐝𝐨",         caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐑𝐨𝐧𝐚𝐥𝐝𝐨 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 ⚽"         },
  { key: "football",  label: "🏆 𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥",        caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🏆"        },
  { key: "hindi",     label: "🫂 𝐇𝐢𝐧𝐝𝐢",           caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐇𝐢𝐧𝐝𝐢 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🫂"           },
  { key: "18+",       label: "🔞 𝟏𝟖+",              caption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝟏𝟖+ 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 🔥"              },
];

const ITEMS_PER_PAGE = 10;
const DIVIDER        = "╔══════════════════════╗";
const DIVIDER_END    = "╚══════════════════════╝";
const LINE           = "║──────────────────────║";

// ── Helper: safe temp file path ─────────────
function getTempPath(senderID) {
  return path.join(__dirname, `cache_album_${senderID}_${Date.now()}.mp4`);
}

// ── Helper: download video to disk ──────────
async function downloadVideo(url, filePath) {
  const res = await axios({
    url,
    method: "GET",
    responseType: "stream",
    timeout: 20000,
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);
    res.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// ── Helper: safe file cleanup ────────────────
function cleanFile(filePath) {
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
}

// ════════════════════════════════════════════
module.exports = {
  config: {
    name: "album",
    version: "1.0.0",
    role: 0,
    author: "ArYAN (Modified By Tamim)",
    category: "media",
    guide: {
      en: [
        "{p}{n}            ➜ Show video categories (page 1)",
        "{p}{n} [page]     ➜ Go to a specific page  (e.g. !album 2)",
        "{p}{n} add [cat] [url]  ➜ Add a video to a category",
        "{p}{n} list       ➜ List all categories from server",
      ].join("\n"),
    },
  },

  // ══════════════════════════════════════════
  onStart: async function ({ api, event, args }) {
    const cmd = (args[0] || "").toLowerCase();

    // ─── ADD command ────────────────────────
    if (cmd === "add") {
      const category = (args[1] || "").toLowerCase();
      if (!category) {
        return api.sendMessage(
          `${DIVIDER}\n` +
          `║  ⚠️  𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲 𝐧𝐨𝐭 𝐬𝐩𝐞𝐜𝐢𝐟𝐢𝐞𝐝!\n` +
          `${LINE}\n` +
          `║  𝐔𝐬𝐚𝐠𝐞:\n` +
          `║  !album add [𝐜𝐚𝐭] [𝐮𝐫𝐥]\n` +
          `║  𝐨𝐫 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐯𝐢𝐝𝐞𝐨\n` +
          `${DIVIDER_END}`,
          event.threadID, event.messageID
        );
      }

      let videoUrl = args[2] || null;

      // Allow replying to a video
      if (event.messageReply?.attachments?.length > 0) {
        const att = event.messageReply.attachments[0];
        if (att.type !== "video") {
          return api.sendMessage(
            `${DIVIDER}\n║  ❌ 𝐎𝐧𝐥𝐲 𝐯𝐢𝐝𝐞𝐨 𝐚𝐭𝐭𝐚𝐜𝐡𝐦𝐞𝐧𝐭𝐬 𝐚𝐫𝐞 𝐚𝐥𝐥𝐨𝐰𝐞𝐝.\n${DIVIDER_END}`,
            event.threadID, event.messageID
          );
        }
        videoUrl = att.url;
      }

      if (!videoUrl) {
        return api.sendMessage(
          `${DIVIDER}\n║  ❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐔𝐑𝐋\n║  𝐨𝐫 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐯𝐢𝐝𝐞𝐨.\n${DIVIDER_END}`,
          event.threadID, event.messageID
        );
      }

      try {
        api.sendMessage(
          `${DIVIDER}\n║  ⏳ 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐭𝐨 𝐈𝐦𝐠𝐮𝐫...\n${DIVIDER_END}`,
          event.threadID
        );

        const imgurRes = await axios.get(IMGUR_API, { params: { url: videoUrl } });
        if (!imgurRes.data?.imgur) throw new Error("Imgur upload returned no URL.");
        const imgurLink = imgurRes.data.imgur;

        const addRes = await axios.post(`${BASE_API}/api/album/add`, {
          category,
          videoUrl: imgurLink,
        });

        return api.sendMessage(
          `${DIVIDER}\n` +
          `║  ✅ 𝐕𝐢𝐝𝐞𝐨 𝐀𝐝𝐝𝐞𝐝!\n` +
          `${LINE}\n` +
          `║  📂 𝐂𝐚𝐭: ${category}\n` +
          `║  ${addRes.data.message || "Success"}\n` +
          `${DIVIDER_END}`,
          event.threadID, event.messageID
        );
      } catch (err) {
        console.error("[album:add]", err.message);
        return api.sendMessage(
          `${DIVIDER}\n` +
          `║  ❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐚𝐝𝐝 𝐯𝐢𝐝𝐞𝐨.\n` +
          `${LINE}\n` +
          `║  ${err.response?.data?.error || err.message}\n` +
          `${DIVIDER_END}`,
          event.threadID, event.messageID
        );
      }
    }

    // ─── LIST command ────────────────────────
    if (cmd === "list") {
      try {
        const res = await axios.get(`${BASE_API}/api/category/list`);
        if (!res.data?.success) throw new Error(res.data?.error || "Unknown error");

        const cats = res.data.categories
          .map((c, i) => `║  ${String(i + 1).padStart(2, "0")}. ${c}`)
          .join("\n");

        return api.sendMessage(
          `╔══ 🗂️  𝐀𝐋𝐁𝐔𝐌 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐄𝐒 ══╗\n` +
          `${cats}\n` +
          `${DIVIDER_END}`,
          event.threadID, event.messageID
        );
      } catch (err) {
        return api.sendMessage(
          `${DIVIDER}\n║  ❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬.\n${DIVIDER_END}`,
          event.threadID, event.messageID
        );
      }
    }

    // ─── BROWSE / PAGINATE ───────────────────
    const page       = parseInt(args[0]) || 1;
    const totalPages = Math.ceil(CATEGORIES.length / ITEMS_PER_PAGE);

    if (page < 1 || page > totalPages) {
      return api.sendMessage(
        `${DIVIDER}\n` +
        `║  ⚠️ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐩𝐚𝐠𝐞!\n` +
        `║  𝐂𝐡𝐨𝐨𝐬𝐞 𝐛𝐞𝐭𝐰𝐞𝐞𝐧 𝟏 – ${totalPages}.\n` +
        `${DIVIDER_END}`,
        event.threadID, event.messageID
      );
    }

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const slice      = CATEGORIES.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const rows = slice
      .map((c, i) => `║  ${String(startIndex + i + 1).padStart(2, "0")}. ${c.label}`)
      .join("\n");

    const footer =
      `${LINE}\n` +
      `║  📄 𝐏𝐚𝐠𝐞 ${page} / ${totalPages}\n` +
      (page < totalPages
        ? `║  ➡️  𝐓𝐲𝐩𝐞 !album ${page + 1} 𝐟𝐨𝐫 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞\n`
        : `║  ✅ 𝐋𝐚𝐬𝐭 𝐩𝐚𝐠𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝!\n`) +
      `${DIVIDER_END}`;

    const message =
      `╔══ 🎬 𝐀𝐋𝐁𝐔𝐌 𝐕𝐈𝐃𝐄𝐎 𝐋𝐈𝐒𝐓 ══╗\n` +
      `${rows}\n` +
      `${footer}`;

    await api.sendMessage(message, event.threadID, (err, info) => {
      if (err || !info) return;
      global.GoatBot.onReply.set(info.messageID, {
        commandName : this.config.name,
        type        : "reply",
        messageID   : info.messageID,
        author      : event.senderID,
        startIndex,          // ← absolute offset for correct index calc
        slice,               // ← only the visible items
      });
    }, event.messageID);
  },

  // ══════════════════════════════════════════
  onReply: async function ({ api, event, Reply }) {
    // ── Author guard ──────────────────────────
    if (event.senderID !== Reply.author) {
      return api.sendMessage(
        `${DIVIDER}\n║  🚫 𝐓𝐡𝐢𝐬 𝐦𝐞𝐧𝐮 𝐢𝐬𝐧'𝐭 𝐲𝐨𝐮𝐫𝐬!\n${DIVIDER_END}`,
        event.threadID, event.messageID
      );
    }

    api.unsendMessage(Reply.messageID);

    const choice = parseInt(event.body);

    // choice is 1-based within the current page slice
    if (isNaN(choice) || choice < 1 || choice > Reply.slice.length + Reply.startIndex) {
      return api.sendMessage(
        `${DIVIDER}\n║  ⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡\n║  𝐚 𝐯𝐚𝐥𝐢𝐝 𝐧𝐮𝐦𝐛𝐞𝐫.\n${DIVIDER_END}`,
        event.threadID, event.messageID
      );
    }

    // ── Map absolute number → category ────────
    const absIndex = choice - 1;                        // 0-based global index
    const cat      = CATEGORIES[absIndex];

    if (!cat) {
      return api.sendMessage(
        `${DIVIDER}\n║  ❌ 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝.\n${DIVIDER_END}`,
        event.threadID, event.messageID
      );
    }

    // ── Notify user ───────────────────────────
    api.sendMessage(
      `${DIVIDER}\n║  🔍 𝐅𝐞𝐭𝐜𝐡𝐢𝐧𝐠 ${cat.label} 𝐕𝐢𝐝𝐞𝐨...\n${DIVIDER_END}`,
      event.threadID
    );

    try {
      const res = await axios.get(`${BASE_API}/api/album/videos/${cat.key}`);

      if (!res.data?.success) {
        return api.sendMessage(
          `${DIVIDER}\n║  ❌ ${res.data?.message || "No data returned."}\n${DIVIDER_END}`,
          event.threadID, event.messageID
        );
      }

      const videos = res.data.videos || [];
      if (videos.length === 0) {
        return api.sendMessage(
          `${DIVIDER}\n║  📭 𝐍𝐨 𝐯𝐢𝐝𝐞𝐨𝐬 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫\n║  "${cat.label}" 𝐲𝐞𝐭.\n${DIVIDER_END}`,
          event.threadID, event.messageID
        );
      }

      const randomUrl = videos[Math.floor(Math.random() * videos.length)];
      const filePath  = getTempPath(event.senderID);     // ← unique per user+time

      try {
        await downloadVideo(randomUrl, filePath);

        api.sendMessage(
          {
            body       : cat.caption,
            attachment : fs.createReadStream(filePath),
          },
          event.threadID,
          () => cleanFile(filePath),                     // ← cleanup after send
          event.messageID
        );
      } catch (dlErr) {
        cleanFile(filePath);                             // ← cleanup on error too
        console.error("[album:download]", dlErr.message);
        api.sendMessage(
          `${DIVIDER}\n║  ❌ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐟𝐚𝐢𝐥𝐞𝐝.\n║  𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.\n${DIVIDER_END}`,
          event.threadID, event.messageID
        );
      }
    } catch (err) {
      console.error("[album:fetch]", err.message);
      api.sendMessage(
        `${DIVIDER}\n║  ❌ 𝐀𝐏𝐈 𝐞𝐫𝐫𝐨𝐫 𝐰𝐡𝐢𝐥𝐞 𝐟𝐞𝐭𝐜𝐡𝐢𝐧𝐠.\n║  𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧.\n${DIVIDER_END}`,
        event.threadID, event.messageID
      );
    }
  },
};
