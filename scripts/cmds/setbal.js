module.exports = {
  config: {
    name: "set",
    aliases: ['ap'],
    version: "1.1",
    author: "Loid Butter । Modified By —͟͞͞𝐓𝐀𝐌𝐈𝐌",
    role: 0,
    shortDescription: {
      en: "Set coins and experience points for a user"
    },
    longDescription: {
      en: "Set coins and experience points for a user as desired"
    },
    category: "bank",
    guide: {
      en: "{pn}set [money|exp] [amount] — supports 1k, 1m, 1b"
    }
  },

  onStart: async function ({ args, event, api, usersData }) {

    const permission = ["100000317130398", "100076339585458"];

    if (!permission.includes(event.senderID)) {
      return api.sendMessage(
        `───────────────\n❌ ʏᴏᴜ ᴅᴏɴ'ᴛ ʜᴀᴠᴇ ᴘᴇʀᴍɪssɪᴏɴ\n───────────────`,
        event.threadID,
        event.messageID
      );
    }

    const query = args[0];
    const rawAmount = args[1];

    function parseAmount(str) {
      if (!str) return NaN;
      str = str.toLowerCase().trim();
      if (str.endsWith('b')) return parseFloat(str) * 1_000_000_000;
      if (str.endsWith('m')) return parseFloat(str) * 1_000_000;
      if (str.endsWith('k')) return parseFloat(str) * 1_000;
      return parseFloat(str);
    }

    const amount = parseAmount(rawAmount);

    if (!query || isNaN(amount)) {
      return api.sendMessage(
        `───────────────\n⚠️ ᴜsᴀɢᴇ: sᴇᴛ [ᴍᴏɴᴇʏ|ᴇxᴘ] [ᴀᴍᴏᴜɴᴛ]\n💡 sᴜᴘᴘᴏʀᴛs: 1ᴋ · 1ᴍ · 1ʙ\n───────────────`,
        event.threadID
      );
    }

    const { senderID, threadID } = event;
    if (senderID === api.getCurrentUserID()) return;

    let targetUser;
    if (event.type === "message_reply") {
      targetUser = event.messageReply.senderID;
    } else {
      const mention = Object.keys(event.mentions);
      targetUser = mention[0] || senderID;
    }

    const userData = await usersData.get(targetUser);
    if (!userData) {
      return api.sendMessage(
        `───────────────\n❌ ᴜsᴇʀ ɴᴏᴛ ꜰᴏᴜɴᴅ\n───────────────`,
        threadID
      );
    }

    const name = await usersData.getName(targetUser);

    function formatAmount(num) {
      if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'ʙ';
      if (num >= 1_000_000) return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'ᴍ';
      if (num >= 1_000) return (num / 1_000).toFixed(2).replace(/\.00$/, '') + 'ᴋ';
      return num.toLocaleString();
    }

    if (query.toLowerCase() === 'exp') {
      await usersData.set(targetUser, {
        money: userData.money,
        exp: amount,
        data: userData.data
      });

      return api.sendMessage(
        `───────────────\n✨ ᴇxᴘ ᴜᴘᴅᴀᴛᴇᴅ\n───────────────\n➜ ᴜsᴇʀ · ${name}\n➜ ᴇxᴘ  · ${formatAmount(amount)}\n───────────────`,
        threadID
      );

    } else if (query.toLowerCase() === 'money') {
      await usersData.set(targetUser, {
        money: amount,
        exp: userData.exp,
        data: userData.data
      });

      return api.sendMessage(
        `───────────────\n💸 ᴍᴏɴᴇʏ ᴜᴘᴅᴀᴛᴇᴅ\n───────────────\n➜ ᴜsᴇʀ  · ${name}\n➜ ᴄᴏɪɴs · ${formatAmount(amount)}\n───────────────`,
        threadID
      );

    } else {
      return api.sendMessage(
        `───────────────\n❌ ᴜsᴇ 'ᴇxᴘ' ᴏʀ 'ᴍᴏɴᴇʏ' ᴏɴʟʏ\n───────────────`,
        threadID
      );
    }
  }
};
