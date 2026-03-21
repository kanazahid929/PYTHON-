module.exports = {
  config: {
    name: "botnickname",
    aliases: ["nick"],
    version: "1.3",
    author: "Tamim",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Change nickname of the bot in all group chats"
    },
    longDescription: {
      en: "Change nickname of the bot in all group chats"
    },
    category: "owner",
    guide: {
      en: "{pn} <new nickname>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {
    en: {
      missingNickname: "❌ Please enter the new nickname for the bot!",
      changingNickname: "⚡ Starting to change bot nickname to «%1» in %2 group chats...",
      partialSuccessMessage: "⚠️ Changed nickname in some groups, but failed in: %2",
      successMessage: "✅ Successfully changed nickname in all group chats to «%1»",
      sendingNotification: "📢 Sending notifications to %1 group chats..."
    }
  },

  onStart: async function({ api, args, threadsData, message, getLang, envCommands }) {
    const newNickname = args.join(" ");

    if (!newNickname) return message.reply(getLang("missingNickname"));

    const allThreads = (await threadsData.getAll()).filter(
      t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup
    );

    message.reply(getLang("changingNickname", newNickname, allThreads.length));
    message.reply(getLang("sendingNotification", allThreads.length));

    const failedThreads = [];

    for (const thread of allThreads) {
      try {
        await api.changeNickname(newNickname, thread.threadID, api.getCurrentUserID());
        await new Promise(res => setTimeout(res, envCommands.delayPerGroup || 250));
      } catch (err) {
        console.error(`❌ Failed for thread ${thread.threadID}: ${err.message}`);
        failedThreads.push(thread.threadID);
      }
    }

    if (failedThreads.length === 0) {
      message.reply(getLang("successMessage", newNickname));
    } else {
      message.reply(getLang("partialSuccessMessage", newNickname, failedThreads.join(", ")));
    }
  }
};
