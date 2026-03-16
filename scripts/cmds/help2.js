const boldFont = (text) => {
  const map = {
    A:"𝑨",B:"𝑩",C:"𝑪",D:"𝑫",E:"𝑬",F:"𝑭",G:"𝑮",H:"𝑯",I:"𝑰",J:"𝑱",
    K:"𝑲",L:"𝑳",M:"𝑴",N:"𝑵",O:"𝑶",P:"𝑷",Q:"𝒒",R:"𝑹",S:"𝑺",T:"𝑻",
    U:"𝑼",V:"𝑽",W:"𝑾",X:"𝑿",Y:"𝒀",Z:"𝒁",
    a:"𝒂",b:"𝒃",c:"𝒄",d:"𝒅",e:"𝒆",f:"𝒇",g:"𝒈",h:"𝒉",i:"𝒊",j:"𝒋",
    k:"𝒌",l:"𝒍",m:"𝒎",n:"𝒏",o:"𝒐",p:"𝒑",q:"𝒒",r:"𝒓",s:"𝒔",t:"𝒕",
    u:"𝒖",v:"𝒗",w:"𝒘",x:"𝒙",y:"𝒚",z:"𝒛",
    0:"𝟎",1:"𝟏",2:"𝟐",3:"𝟑",4:"𝟒",5:"𝟓",6:"𝟔",7:"𝟕",8:"𝟖",9:"𝟗",
    ".": "．", ":": "："
  };
  return text.split("").map(c => map[c] || c).join("");
};

module.exports = {
  config: {
    name: "help2",
    version: "2.9",
    author: "Saif / Gemini Fix",
    role: 0,
    category: "system",
    description: "Interactive category help with direct edit return"
  },

  onStart: async function ({ api, event, args, role }) {
    const { threadID, messageID } = event;
    const prefix = global.utils.getPrefix(threadID);
    const commands = global.GoatBot.commands;
    const categories = {};

    for (const [name, value] of commands) {
      if (value.config.role > role) continue;
      const cat = value.config.category || "Uncategorized";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    }

    const sortedCats = Object.keys(categories).sort();
    const input = args.join(" ").toLowerCase();

    // সরাসরি নাম দিলে রেজাল্ট দেখাবে বেবি
    if (input) {
      const categoryName = sortedCats.find(c => c.toLowerCase() === input);
      if (categoryName) {
        let msg = `╭───✦ ${boldFont(categoryName.toUpperCase())} ✦───╮\n`;
        const cmds = categories[categoryName].sort();
        for (let i = 0; i < cmds.length; i += 2) {
          const row = cmds.slice(i, i + 2).map(x => `⭔ ${boldFont(x)}`).join("   ");
          msg += `│ ${row}\n`;
        }
        msg += "╰────────────────────╯\n";
        msg += `💖 ${boldFont("Powered by Mikasa")}`;
        return api.sendMessage(msg, threadID, messageID);
      }
    }

    let helpMsg = `╭───✦ ${boldFont("HELP CATEGORIES")} ✦───╮\n`;
    sortedCats.forEach((cat, index) => {
      helpMsg += `│ ${index + 1}． ${boldFont(cat.toUpperCase())}\n`;
    });
    helpMsg += "╰────────────────────╯\n";
    helpMsg += `📝 ${boldFont("Reply with serial or category name")}\n`;
    helpMsg += `⏳ ${boldFont("Auto unsend after 2 minutes")}`;

    return api.sendMessage(helpMsg, threadID, (err, info) => {
      if (err) return;
      
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        categories: categories,
        sortedCats: sortedCats
      });

      setTimeout(() => { api.unsendMessage(info.messageID); }, 120000);
    }, messageID);
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, body, senderID } = event;
    if (senderID != Reply.author) return;

    let categoryName;
    const num = parseInt(body);

    if (!isNaN(num) && num > 0 && num <= Reply.sortedCats.length) {
      categoryName = Reply.sortedCats[num - 1];
    } else {
      categoryName = Reply.sortedCats.find(c => c.toLowerCase() === body.toLowerCase());
    }

    if (!categoryName) return;

    const cmds = Reply.categories[categoryName].sort();
    let msg = `╭───✦ ${boldFont(categoryName.toUpperCase())} ✦───╮\n`;
    for (let i = 0; i < cmds.length; i += 2) {
      const row = cmds.slice(i, i + 2).map(x => `⭔ ${boldFont(x)}`).join("   ");
      msg += `│ ${row}\n`;
    }
    msg += "╰────────────────────╯\n";
    msg += `✨ ${boldFont("Total Commands")}： ${cmds.length}\n`;
    msg += `💖 ${boldFont("Powered by Mikasa")}`;

    // বেবি, তোমার বলা ফরম্যাট অনুযায়ী রিটার্ন করছি
    api.unsendMessage(messageID);
    return api.editMessage(msg, Reply.messageID);
  }
};
