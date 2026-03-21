const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const axios = require("axios");

module.exports = {
  config: {
    name: "help",
    version: "6.0",
    author: "♡—͟͞͞𝐓𝐀𝐌𝐈𝐌 ⸙",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View all commands" },
    longDescription: { en: "View all available commands or command details" },
    category: "info",
    guide: { en: "{pn}help [command]" },
    priority: 1
  },

  onStart: async function ({ message, args, event, role }) {

    const prefix = getPrefix(event.threadID);

    const videos = [
      "https://files.catbox.moe/2qru86.mp4",
      "https://files.catbox.moe/8xm9d0.mp4",
      "https://files.catbox.moe/diksvg.mp4",
      "https://files.catbox.moe/qu3vfu.mp4"
    ];

    const stylish = (text = "") => {
      const map = {
        A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",
        N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",
        a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",k:"𝐤",l:"𝐥",m:"𝐦",
        n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳",
        0:"𝟎",1:"𝟏",2:"𝟐",3:"𝟑",4:"𝟒",5:"𝟓",6:"𝟔",7:"𝟕",8:"𝟖",9:"𝟗"," ":" "
      };
      return text.split("").map(c => map[c] || c).join("");
    };

    const roleText = r =>
      stylish(
        r === 0 ? "Everyone" :
        r === 1 ? "Group Admin" :
        r === 2 ? "Bot Admin" : "Unknown"
      );

    // =================
    // MAIN HELP MENU
    // =================
    if (!args[0]) {

      const categories = {};

      for (const [name, cmd] of commands) {
        if (!cmd?.config) continue;
        if (cmd.config.role > role) continue;

        const cat = cmd.config.category || "other";
        (categories[cat] ??= []).push(name);
      }

      let msg = `
╭━━━〔 ⸙ 𝐓𝐀𝐌𝐈𝐌 𝐁𝐎𝐓 々 〕━━━╮
│ ✦ 𝐀𝐋𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐌𝐄𝐍𝐔
╰━━━━━━━━━━━━━━━━━━╯`;

      for (const [cat, cmds] of Object.entries(categories)) {

        msg += `\n\n╭─❍ 『 ${stylish(cat.toUpperCase())} 』`;

        for (const cmd of cmds.sort()) {
          msg += `\n│ ➤ ${stylish(prefix + cmd)}`;
        }

        msg += `\n╰───────────────`;
      }

      msg += `

╭───────────────❍
│ ✦ ${stylish("Total Commands")} : ${stylish(commands.size.toString())}
│ ✦ ${stylish("Use")} : ${stylish(prefix + "help")} ${stylish("command")}
│ ✦ ${stylish("Owner")} : ♡—͟͞͞𝐓𝐀𝐌𝐈𝐌 ⸙
╰───────────────❍
`;

      try {

        const randomVideo = videos[Math.floor(Math.random() * videos.length)];

        const stream = (await axios({
          url: randomVideo,
          method: "GET",
          responseType: "stream"
        })).data;

        return message.reply({
          body: msg,
          attachment: stream
        });

      } catch (e) {
        return message.reply(msg);
      }
    }

    // =================
    // COMMAND DETAILS
    // =================
    const input = args[0].toLowerCase();
    const realName = aliases.get(input) || input;
    const cmd = commands.get(realName);

    if (!cmd?.config) {
      return message.reply(`
╭────────❍
│ ❌ ${stylish("Command Not Found")}
│ ${stylish("Use")} : ${stylish(prefix + "help")}
╰────────❍`);
    }

    const cfg = cmd.config;

    const aliasList = [...aliases.entries()]
      .filter(([a, n]) => n === realName)
      .map(([a]) => a);

    const detailMsg = `
┌───────── ✧ ─────────┐
       𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐈𝐍𝐅𝐎
└───────── ✧ ─────────┘
▸ 𝐍𝐚𝐦𝐞     : ${stylish(cfg.name)}
▸ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧  : ${stylish(cfg.version || "1.0")}
▸ 𝐀𝐮𝐭𝐡𝐨𝐫   : ${stylish(cfg.author || "Tamim")}
▸ 𝐑𝐨𝐥𝐞     : ${roleText(cfg.role)}
▸ 𝐂𝐨𝐨𝐥𝐝𝐨𝐰𝐧 : ${stylish((cfg.countDown || 0).toString())}𝐬
▸ 𝐀𝐥𝐢𝐚𝐬𝐞𝐬  : ${stylish(aliasList.join(", ") || "None")}
▸ 𝐃𝐞𝐬𝐜     : ${stylish(cfg.longDescription?.en || cfg.shortDescription?.en || "N/A")}
▸ 𝐆𝐮𝐢𝐝𝐞    : ${stylish(cfg.guide?.en?.replace("{pn}", prefix) || "N/A")}
─────────────────────
      𝐁𝐎𝐓 𝐎𝐖𝐍𝐄𝐑 𝐓𝐀𝐌𝐈𝐌
`;

    return message.reply(detailMsg);
  }
};
