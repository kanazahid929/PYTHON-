module.exports = {
  config: {
    name: "inbox",
    aliases: ["in"],
    version: "1.2",
    author: "𓆩𝐂.𝐄.𝐎⸙𝐓𝐀𝐌𝐈𝐌𓆪",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "✨ Send inbox message"
    },
    category: "fun",
    guide: {
      en: "{p}inbox"
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
      // Group reply
      await message.reply(
        "╔══════════════╗\n" +
        " ✅ 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 \n" +
        "╚══════════════╝\n\n" +
        "📩 𝐈𝐧𝐛𝐨𝐱 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐒𝐞𝐧𝐭!\n" +
        "🔰 𝐏𝐥𝐞𝐚𝐬𝐞 𝐂𝐡𝐞𝐜𝐤 𝐘𝐨𝐮𝐫 𝐈𝐧𝐛𝐨𝐱 / 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐑𝐞𝐪𝐮𝐞𝐬𝐭 💌"
      );

      // Inbox message
      await api.sendMessage(
        "╭───✨ 𝐓𝐀𝐌𝐈𝐌 𝐁𝐎𝐓 ✨───╮\n\n" +
        "🤖 𝐇𝐞𝐥𝐥𝐨 𝐃𝐞𝐚𝐫~\n\n" +
        "✅ 𝐈𝐧𝐛𝐨𝐱 𝐀𝐜𝐜𝐞𝐬𝐬 𝐀𝐥𝐥𝐨𝐰𝐞𝐝!\n" +
        "💬 𝐍𝐨𝐰 𝐘𝐨𝐮 𝐂𝐚𝐧 𝐂𝐡𝐚𝐭 𝐖𝐢𝐭𝐡 𝐌𝐞 𝐅𝐫𝐞𝐞𝐥𝐲 😇\n\n" +
        "🔰 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝙱𝚢 : 𓆩𝐂.𝐄.𝐎⸙𝐓𝐀𝐌𝐈𝐌𓆪\n" +
        "╰────────────────╯",
        event.senderID
      );

    } catch (err) {
      console.error("Inbox error:", err);
      message.reply("❌ Inbox failed! Maybe bot is blocked.");
    }
  }
};
