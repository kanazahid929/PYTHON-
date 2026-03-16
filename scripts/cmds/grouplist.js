module.exports = {
  config: {
    name: "grouplist",
    aliases: ["gl", "groups", "mygroups"],
    version: "2.0.0",
    author: "♡—͟͞͞𝐓𝐀𝐌𝐈𝐌⸙",
    role: 2,
    description: "Show all groups where the bot is present",
    category: "admin",
    usage: "grouplist",
    countDown: 3
  },

  onStart: async function ({ api, event }) {
    try {

      const botID = api.getCurrentUserID();
      const threadList = await api.getThreadList(200, null, ["INBOX"]);

      const groups = threadList.filter(thread =>
        thread.isGroup &&
        Array.isArray(thread.participantIDs) &&
        thread.participantIDs.includes(botID)
      );

      if (!groups.length) {
        return api.sendMessage(
          "❌ 𝐍𝐨 𝐠𝐫𝐨𝐮𝐩𝐬 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐛𝐨𝐭",
          event.threadID,
          event.messageID
        );
      }

      let msg =
`╭─〔 🤖 𝐁𝐎𝐓 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐒𝐓 〕─╮
│ 📊 𝐓𝐨𝐭𝐚𝐥 𝐆𝐫𝐨𝐮𝐩𝐬: ${groups.length}
╰────────────────╯

`;

      let groupMap = [];

      groups.forEach((group, i) => {
        msg += `「 ${i + 1} 」➤ 𝐆𝐫𝐨𝐮𝐩: ${group.name || "𝐔𝐧𝐧𝐚𝐦𝐞𝐝 𝐆𝐫𝐨𝐮𝐩"}\n`;
        groupMap.push({
          index: i + 1,
          threadID: group.threadID
        });
      });

      msg += `\n💬 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐚 𝐧𝐮𝐦𝐛𝐞𝐫 𝐭𝐨 𝐯𝐢𝐞𝐰 𝐟𝐮𝐥𝐥 𝐠𝐫𝐨𝐮𝐩 𝐢𝐧𝐟𝐨`;

      api.sendMessage(
        msg,
        event.threadID,
        (err, info) => {

          if (err) return;

          global.GoatBot.onReply.set(info.messageID, {
            commandName: "grouplist",
            author: event.senderID,
            groupMap,
            editMsgID: info.messageID
          });

        },
        event.messageID
      );

    } catch (err) {

      api.sendMessage(
        "❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐥𝐨𝐚𝐝 𝐠𝐫𝐨𝐮𝐩 𝐥𝐢𝐬𝐭",
        event.threadID,
        event.messageID
      );

    }
  },

  onReply: async function ({ api, event, Reply }) {

    try {

      if (event.senderID !== Reply.author) return;

      const num = parseInt(event.body);
      if (isNaN(num)) return;

      const target = Reply.groupMap.find(g => g.index === num);
      if (!target) return;

      const info = await api.getThreadInfo(target.threadID);

      const admins = info.adminIDs.map(admin => {
        const user = info.userInfo.find(u => u.id == admin.id);
        return user ? `• ${user.name}` : "• Unknown";
      }).join("\n");

      const members = info.userInfo
        .slice(0, 15)
        .map((user, i) => `${i + 1}. ${user.name}`)
        .join("\n");

      const more =
        info.userInfo.length > 15
          ? `\n…𝐀𝐧𝐝 ${info.userInfo.length - 15} 𝐦𝐨𝐫𝐞 𝐦𝐞𝐦𝐛𝐞𝐫𝐬`
          : "";

      const text =
`╭─〔 📊 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎 〕─╮

📛 𝐍𝐚𝐦𝐞: ${info.threadName}
🆔 𝐓𝐡𝐫𝐞𝐚𝐝 𝐈𝐃: ${info.threadID}

👥 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${info.participantIDs.length}

👑 𝐀𝐝𝐦𝐢𝐧𝐬:
${admins || "• None"}

👥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 (Preview)
${members}${more}

📌 𝐀𝐩𝐩𝐫𝐨𝐯𝐚𝐥 𝐌𝐨𝐝𝐞: ${info.approvalMode ? "𝐎𝐍" : "𝐎𝐅𝐅"}

🖼️ 𝐆𝐫𝐨𝐮𝐩 𝐏𝐡𝐨𝐭𝐨: ${info.imageSrc ? "𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞" : "𝐍𝐨𝐧𝐞"}

🤖 𝐁𝐨𝐭 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐀𝐜𝐭𝐢𝐯𝐞

╰────────────────╯`;

      api.editMessage(text, Reply.editMsgID);

      if (info.imageSrc) {

        api.sendMessage(
          {
            body: "🖼️ 𝐆𝐫𝐨𝐮𝐩 𝐏𝐡𝐨𝐭𝐨",
            attachment: await global.utils.getStreamFromURL(info.imageSrc)
          },
          event.threadID,
          null,
          event.messageID
        );

      }

    } catch (err) {

      api.sendMessage(
        "❌ 𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐟𝐞𝐭𝐜𝐡 𝐠𝐫𝐨𝐮𝐩 𝐢𝐧𝐟𝐨",
        event.threadID,
        event.messageID
      );

    }
  }
};