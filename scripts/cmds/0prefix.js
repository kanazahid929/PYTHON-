const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "7.0",
    author: "—͟͞͞𝐓𝐀𝐌𝐈𝐌⸙",
    countDown: 5,
    role: 0,
    description: "⚙️ Change / Check Bot Prefix",
    category: "config"
  },

  langs: {
    en: {
      prefixTooLong:
`⚠️ ᴘʀᴇꜰɪx ᴛᴏᴏ ʟᴏɴɢ
——————————————
❌ ᴍᴀx ᴀʟʟᴏᴡᴇᴅ ➜ 5 ᴄʜᴀʀs`,

      prefixSame:
`💡 ɴᴏ ᴄʜᴀɴɢᴇ ɴᴇᴇᴅᴇᴅ
——————————————
✨ ᴀʟʀᴇᴀᴅʏ ᴜsɪɴɢ ᴛʜɪs ᴘʀᴇꜰɪx`,

      noPrefix:
`⚙️ ᴘʀᴇꜰɪx ᴄᴏᴍᴍᴀɴᴅ
——————————————
⚠️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴘʀᴇꜰɪx`,

      resetSuccess:
`♻️ ᴘʀᴇꜰɪx ʀᴇsᴇᴛ
——————————————
✅ ɢʀᴏᴜᴘ ᴘʀᴇꜰɪx ʀᴇsᴇᴛ sᴜᴄᴄᴇssꜰᴜʟʟʏ`
    }
  },

  onStart: async function ({ message, args, event, threadsData }) {

    if (!args[0])
      return message.reply(this.langs.en.noPrefix);

    if (args[0].toLowerCase() === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(this.langs.en.resetSuccess);
    }

    const newPrefix = args[0];

    if (newPrefix.length > 5)
      return message.reply(this.langs.en.prefixTooLong);

    const currentPrefix = utils.getPrefix(event.threadID);

    if (newPrefix === currentPrefix)
      return message.reply(this.langs.en.prefixSame);

    await threadsData.set(event.threadID, newPrefix, "data.prefix");

    return message.reply(
`✅ ᴘʀᴇꜰɪx ᴜᴘᴅᴀᴛᴇᴅ
——————————————
💬 ɴᴇᴡ ᴘʀᴇꜰɪx ➜ [ ${newPrefix} ]`
    );
  },

  onChat: async function ({ event, message }) {

    if (event.body?.toLowerCase() === "prefix") {

      const globalPrefix = global.GoatBot.config.prefix;
      const groupPrefix = utils.getPrefix(event.threadID);

      const videos = [
        "https://files.catbox.moe/zo8402.mp4"
      ];
      const videoUrl = videos[Math.floor(Math.random() * videos.length)];

      return message.reply({
        body:
`⚙️ ᴘʀᴇꜰɪx sᴛᴀᴛᴜs
——————————————
🌐 ɢʟᴏʙᴀʟ ➜ [ ${globalPrefix} ]
💬 ɢʀᴏᴜᴘ  ➜ [ ${groupPrefix} ]
——————————————
👤 ᴏᴡɴᴇʀ  ➜ 𝐓𝐀𝐌𝐈𝐌
🔗 ʟɪɴᴋ   ➜ ꜰʙ.ᴄᴏᴍ/ɪᴛs.x.ᴛᴀᴍɪᴍ
📖 ʜᴇʟᴘ  ➜ ${groupPrefix}help
——————————————
✨ 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐓𝐀𝐌𝐈𝐌`,
        attachment: await utils.getStreamFromURL(videoUrl)
      });
    }
  }
};
