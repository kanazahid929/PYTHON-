module.exports = {
  config: {
    name: "pending",
    aliases: ["pen", "pend", "pe"],
    version: "4.0.0",
    author: "♡—͟͞͞ᴛꫝ֟፝ؖ۬ᴍɪᴍ ⸙",
    countDown: 5,
    role: 2,
    shortDescription: "𝙃𝙖𝙣𝙙𝙡𝙚 𝙥𝙚𝙣𝙙𝙞𝙣𝙜 𝙧𝙚𝙦𝙪𝙚𝙨𝙩𝙨",
    longDescription: "𝘼𝙥𝙥𝙧𝙤𝙫𝙚 / 𝙍𝙚𝙟𝙚𝙘𝙩 𝙥𝙚𝙣𝙙𝙞𝙣𝙜 𝙪𝙨𝙚𝙧𝙨 & 𝙜𝙧𝙤𝙪𝙥𝙨",
    category: "utility",
  },

  // =========================
  // 🔁 REPLY SYSTEM
  // =========================
  onReply: async function ({ message, api, event, Reply, usersData }) {
    const { author, pending, messageID } = Reply;
    if (String(event.senderID) !== String(author)) return;

    const input = event.body.trim().toLowerCase();

    // ❌ CANCEL SYSTEM
    if (input === "c") {
      await api.unsendMessage(messageID);
      return message.reply(`
╭─❍ ❌ 𝐂𝐀𝐍𝐂𝐄𝐋𝐋𝐄𝐃 ❍─╮
│ ✦ 𝐎𝐩𝐞𝐫𝐚𝐭𝐢𝐨𝐧 𝐒𝐭𝐨𝐩𝐩𝐞𝐝
╰───────────────⭓`);
    }

    // 📌 VALIDATE INDEXES
    const indexes = [...new Set(input.split(/\s+/).map(Number))]
      .filter(n => !isNaN(n) && n > 0 && n <= pending.length);

    if (!indexes.length) {
      return message.reply(`
╭─❍ ⚠️ 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 ❍─╮
│ ✦ 𝐑𝐞𝐩𝐥𝐲 𝐖𝐢𝐭𝐡 𝐕𝐚𝐥𝐢𝐝 𝐍𝐮𝐦𝐛𝐞𝐫(𝐬)
╰───────────────⭓`);
    }

    let approved = [];

    for (const idx of indexes) {
      const group = pending[idx - 1];

      try {
        const name =
          group.name ||
          await usersData.getName(group.threadID) ||
          "𝐔𝐧𝐤𝐧𝐨𝐰𝐧";

        // 🎬 SAFE VIDEO WRAPPER
        let attachment;
        try {
          attachment = await global.utils.getStreamFromURL(
            "https://files.catbox.moe/uaqo2x.mp4"
          );
        } catch {}

        await api.sendMessage(
          {
            body:
`╭─❍ ✅ 𝐆𝐑𝐎𝐔𝐏 𝐀𝐏𝐏𝐑𝐎𝐕𝐄𝐃 ❍─╮
│ 📌 𝐍𝐚𝐦𝐞 : ${name}
│ 🎀 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 : ${global.GoatBot.config.prefix}help
│ 👑 𝐀𝐩𝐩𝐫𝐨𝐯𝐞𝐝 𝐁𝐲 : ᴛꫝ֟፝ؖ۬ᴍɪᴍ
╰───────────────⭓`,
            attachment
          },
          group.threadID
        );

        await api.changeNickname(
          global.GoatBot.config.nickNameBot || "🦋 𝐓𝐀𝐌𝐈𝐌 ✨",
          group.threadID,
          api.getCurrentUserID()
        );

        approved.push(name);

      } catch (err) {
        console.log("Approve error:", err);
      }
    }

    // 🧹 REMOVE PROCESSED
    indexes.sort((a, b) => b - a).forEach(i => pending.splice(i - 1, 1));

    await api.unsendMessage(messageID);

    return message.reply(`
╭─❍ ✨ 𝐀𝐏𝐏𝐑𝐎𝐕𝐄 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄 ✨ ❍─╮
│ ✅ 𝐓𝐨𝐭𝐚𝐥 : ${approved.length} 𝐆𝐫𝐨𝐮𝐩(𝐬)
│
${approved.map((n, i) => `│ 🔹 ${i + 1}. ${n}`).join("\n") || "│ 𝐍𝐨𝐧𝐞"}
╰───────────────⭓`);
  },

  // =========================
  // 🚀 START SYSTEM
  // =========================
  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;

    // 🔐 ADMIN CHECK
    if (!global.GoatBot.config.adminBot.includes(senderID)) {
      return api.sendMessage(`
╭─❍ 🚫 𝐀𝐂𝐂𝐄𝐒𝐒 𝐃𝐄𝐍𝐈𝐄𝐃 ❍─╮
│ ✦ 𝐎𝐧𝐥𝐲 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧𝐬
╰───────────────⭓`,
        threadID,
        messageID
      );
    }

    const type = args[0]?.toLowerCase();
    if (!type) {
      return api.sendMessage(`
╭─❍ 📌 𝐔𝐒𝐀𝐆𝐄 ❍─╮
│ ✦ 𝐩𝐞𝐧𝐝𝐢𝐧𝐠 𝐮𝐬𝐞𝐫
│ ✦ 𝐩𝐞𝐧𝐝𝐢𝐧𝐠 𝐭𝐡𝐫𝐞𝐚𝐝
│ ✦ 𝐩𝐞𝐧𝐝𝐢𝐧𝐠 𝐚𝐥𝐥
╰───────────────⭓`,
        threadID,
        messageID
      );
    }

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pendingList = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pendingList];

      let filtered = [];
      if (type.startsWith("u")) filtered = list.filter(t => !t.isGroup);
      else if (type.startsWith("t")) filtered = list.filter(t => t.isGroup);
      else if (type === "all") filtered = list;
      else return api.sendMessage("⚠️ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐓𝐲𝐩𝐞.", threadID, messageID);

      if (!filtered.length) {
        return api.sendMessage("✨ 𝐍𝐨 𝐏𝐞𝐧𝐝𝐢𝐧𝐠 𝐅𝐨𝐮𝐧𝐝.", threadID, messageID);
      }

      let msg = `╭─❍ 🎀 𝐏𝐄𝐍𝐃𝐈𝐍𝐆 𝐋𝐈𝐒𝐓 ❍─╮\n\n`;

      for (let i = 0; i < filtered.length; i++) {
        const name =
          filtered[i].name ||
          await usersData.getName(filtered[i].threadID) ||
          "𝐔𝐧𝐤𝐧𝐨𝐰𝐧";

        msg += `│ 【 ${i + 1} 】 ${name}\n`;
      }

      msg += `
├──────────────
│ 🦋 𝐑𝐞𝐩𝐥𝐲 𝐍𝐮𝐦𝐛𝐞𝐫(𝐬)
│ ❌ 𝐑𝐞𝐩𝐥𝐲 "c" 𝐓𝐨 𝐂𝐚𝐧𝐜𝐞𝐥
╰───────────────⭓`;

      api.sendMessage(msg, threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID,
          pending: filtered
        });

        setTimeout(() => {
          api.unsendMessage(info.messageID);
        }, 60000);
      }, messageID);

    } catch (err) {
      console.log(err);
      return api.sendMessage(
        "⚠️ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐓𝐨 𝐋𝐨𝐚𝐝 𝐏𝐞𝐧𝐝𝐢𝐧𝐠.",
        threadID,
        messageID
      );
    }
  }
};
