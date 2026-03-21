const { getStreamsFromAttachment } = global.utils;

const ADMIN_IDS = ["100076339585458", "100000317130398"];

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "10.0",
    author: "♡—͟͞͞𝐓𝐀𝐌𝐈𝐌⸙ ‎〆 々—͟͞͞𝐂𝐇𝐀𝐓𝐆𝐏𝐓⸙",
    countDown: 5,
    role: 0,
    category: "owner",
    guide: { en: "{pn} <message>" },
    envConfig: { delayPerGroup: 300 }
  },

  langs: {
    en: {
      missingMessage: "⚠️ ᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴀ ᴍᴇssᴀɢᴇ ᴏʀ ᴀᴛᴛᴀᴄʜ ᴍᴇᴅɪᴀ 🥺",
      onlyAdmin: "🔐 | ᴏɴʟʏ ᴀᴅᴍɪɴ ᴛᴀᴍɪᴍ ᴄᴀɴ ᴜsᴇ ᴛʜɪs",
      sendingNotification: "🚀 ѕᴇɴᴅɪɴɢ ᴛᴏ %1 ɢʀᴏᴜᴘѕ...",
      sentNotification: "✅ sᴇɴᴛ ᴛᴏ %1 ɢʀᴏᴜᴘѕ ѕᴜᴄᴄᴇssғᴜʟʟʏ 🎉",
      replySent: "💌 ʏᴏᴜʀ ᴍᴇssᴀɢᴇ ʜᴀs ʙᴇᴇɴ sᴇɴᴛ ᴛᴏ ᴀᴅᴍɪɴ",
      adminReplySent: "👑 ᴀᴅᴍɪɴ ʀᴇᴘʟʏ sᴇɴᴛ ѕᴜᴄᴄᴇssғᴜʟʟʏ"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, usersData, getLang }) {
    if (!ADMIN_IDS.includes(event.senderID)) return message.reply(getLang("onlyAdmin"));

    const attachments = event.attachments.length > 0 ? event.attachments : (event.messageReply?.attachments || []);
    const validAttachments = attachments.filter(i => i.url && ["photo", "png", "animated_image", "video", "audio"].includes(i.type));

    if (!args[0] && validAttachments.length === 0) return message.reply(getLang("missingMessage"));

    const senderName = await usersData.getName(event.senderID);
    const { delayPerGroup } = envCommands[commandName];

    let stream = [];
    if (validAttachments.length > 0) {
      try { stream = await getStreamsFromAttachment(validAttachments); } catch (e) { console.error(e); }
    }

    const formSend = {
      body: "◈━━━━━━━━━━━━━━━━━━◈\n" +
            "     ✦ ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴ ғʀᴏᴍ ᴀᴅᴍɪɴ ✦\n" +
            "◈━━━━━━━━━━━━━━━━━━◈\n\n" +
            "╭━━━〔 👤 𝗦𝗲𝗻𝗱𝗲𝐫 〕━━━╮\n" +
            `┃👑 ᴀᴅᴍɪɴ : ${senderName}\n` +
            "┣━━━━━━━━━━━━━━━━━━\n" +
            "┃ 💬 ᴍᴇssᴀɢᴇ:\n" +
            `┃ ${args.join(" ") || "Sent a media file"}\n` +
            "╰━━━━━━━━━━━━━━━━━━╯\n\n" +
            "🔁 ʀᴇᴘʟʏ ᴛᴏ ᴛʜɪs ᴍᴇssᴀɢᴇ ᴛᴏ ᴄᴏɴᴛᴀᴄᴛ ᴀᴅᴍɪɴ",
      attachment: stream
    };

    // সরাসরি API থেকে সব গ্রুপের লিস্ট নেওয়া হচ্ছে
    api.getThreadList(100, null, ["INBOX"], (err, list) => {
      if (err) return message.reply("Can't get thread list: " + err.error);
      
      const groupThreads = list.filter(group => group.isGroup && group.threadID != event.threadID);
      
      // কারেন্ট গ্রুপে আগে পাঠানো হচ্ছে
      api.sendMessage(formSend, event.threadID, (err, info) => {
        if (!err && info) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "userReplyToAdmin",
            adminThreadID: event.threadID 
          });
        }
      });

      // বাকি সব গ্রুপে লুপ চালানো হচ্ছে
      message.reply(getLang("sendingNotification", groupThreads.length + 1));

      groupThreads.forEach(async (t, index) => {
        setTimeout(() => {
          api.sendMessage(formSend, t.threadID, (err, info) => {
            if (!err && info) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "userReplyToAdmin",
                adminThreadID: event.threadID 
              });
            }
          });
        }, index * delayPerGroup);
      });
    });
  },

  onReply: async function ({ event, api, Reply, usersData, threadsData, getLang }) {
    const { type, adminThreadID, userThreadID, userMessageID } = Reply;
    const commandName = this.config.name;

    const attachments = event.attachments || [];
    const validAttachments = attachments.filter(i => i.url && ["photo", "png", "animated_image", "video", "audio"].includes(i.type));
    let stream = [];
    if (validAttachments.length > 0) {
      try { stream = await getStreamsFromAttachment(validAttachments); } catch (e) {}
    }

    if (type === "userReplyToAdmin") {
      const senderName = await usersData.getName(event.senderID);
      const threadInfo = await threadsData.get(event.threadID);
      const threadName = threadInfo?.threadName || "Group/Private";

      api.sendMessage({
          body: `📩 ʀᴇᴘʟʏ ʀᴇᴄᴇɪᴠᴇᴅ\n━━━━━━━━━━━━━━━━━━\n👤 ᴜsᴇʀ: ${senderName}\n👥 ɢʀᴏᴜᴘ: ${threadName}\n🆔 ɪᴅ: ${event.threadID}\n💬 ᴍᴇssᴀɢᴇ: ${event.body || "Media"}`,
          attachment: stream
        },
        adminThreadID,
        (err, info) => {
          if (!err && info) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              type: "adminReplyToUser",
              userThreadID: event.threadID,
              userMessageID: event.messageID,
              adminThreadID: adminThreadID
            });
          }
        }
      );
      return api.sendMessage(getLang("replySent"), event.threadID);
    }

    if (type === "adminReplyToUser") {
      if (!ADMIN_IDS.includes(event.senderID)) return;
      api.sendMessage({
          body: "╭━━━〔 👑 ᴀᴅᴍɪɴ ʀᴇᴘʟʏ 〕━━━╮\n" + `┃ ${event.body || "Media"}\n` + "╰━━━━━━━━━━━━━━━━━━╯\n\n💬 ʏᴏᴜ ᴄᴀɴ ʀᴇᴘʟʏ ᴀɢᴀɪɴ",
          attachment: stream
        },
        userThreadID,
        (err, info) => {
           if (!err && info) {
             global.GoatBot.onReply.set(info.messageID, {
                commandName,
                type: "userReplyToAdmin",
                adminThreadID: adminThreadID
             });
             api.sendMessage(getLang("adminReplySent"), event.threadID);
           }
        },
        userMessageID
      );
    }
  }
};
