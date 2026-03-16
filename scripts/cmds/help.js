// Bold small caps font map
const boldFont = (text) => {
  const map = {
    A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",
    K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",
    U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",
    a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",
    k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",
    u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳",
    0:"𝟎",1:"𝟏",2:"𝟐",3:"𝟑",4:"𝟒",5:"𝟓",6:"𝟔",7:"𝟕",8:"𝟖",9:"𝟗"
  };
  return text.split("").map(c => map[c] || c).join("");
};

const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "1.21",
    author: "Saif",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Display commands or details." },
    longDescription: { en: "Shows all commands categorized or details for one." },
    category: "box chat",
    guide: { en: "{pn} [command name]" },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    // Enhanced Admin information
    const adminInfo = {
      name: "Saif",
      facebook: "https://www.facebook.com/61567256940629",
      github: "https://github.com/saiful-404-st",
      website: "http://saif-portfilo.onrender.com",
      email: "saifmorse04@gmail.com",
      botVersion: "2.5.1",
      lastUpdate: "February,  2026",
      supportGroup: "https://m.me/j/AbYhrDx5QWRQ54or/",
      donate: "Fokinni vag"
    };

    if (!args || args.length === 0) {
      const categories = {};
      let msg = "";

      // Header (bold)
      msg += `╭───✦ ${boldFont("HELP MENU")} ✦───╮\n`;
      msg += `│ ${boldFont("Current Prefix")}: ${prefix}\n`;
      msg += `│ ${boldFont("Bot Version")}: ${adminInfo.botVersion}\n`;
      msg += "╰────────────────────╯\n\n";

      // Categorize commands
      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
      }

      // Build category boxes (bold category names)
      for (const categoryName of Object.keys(categories).sort()) {
        if (categoryName === "info") continue;
        const cmds = categories[categoryName].sort();
        msg += `╭─  ${boldFont(categoryName.toUpperCase())}  ─╮\n`;
        for (let i = 0; i < cmds.length; i += 3) {
          const row = cmds.slice(i, i + 3).map(x => `⭔ ${boldFont(x)}`).join("   ");
          msg += `│ ${row}\n`;
        }
        msg += "╰────────────────────╯\n\n";
      }

      // Footer / status (bold titles)
      const totalCommands = commands.size || 0;
      msg += `╭─────✰[ ${boldFont("BOT STATS")} ]\n`;
      msg += `│ ${boldFont("Total Commands")}: [${totalCommands}]\n`;
      msg += `│ ${boldFont("Use")}: ${prefix}help [command]\n`;
      msg += `│ ${boldFont("Last Update")}: ${adminInfo.lastUpdate}\n`;
      msg += "╰────────────✰\n\n";

      // Enhanced Admin Section (normal text for info)
      msg += `╭───✦ ${boldFont("ADMIN INFO")} ✦───╮\n`;
      msg += `│ ${boldFont("Developer")}: ${adminInfo.name}\n`;
      msg += `│ ${boldFont("Facebook")}: ${adminInfo.facebook}\n`;
      msg += `│ ${boldFont("GitHub")}: ${adminInfo.github}\n`;
      msg += `│ ${boldFont("Website")}: ${adminInfo.website}\n`;
      msg += `│ ${boldFont("Email")}: ${adminInfo.email}\n`;
      msg += `│ ${boldFont("Support Group")}: ${adminInfo.supportGroup}\n`;
      msg += `│ ${boldFont("Donate")}: ${adminInfo.donate}\n`;
      msg += "╰────────────✰\n\n";

      // Quick Tips Section (bold titles, normal text for tips)
      msg += `╭───✦ ${boldFont("QUICK TIPS")} ✦───╮\n`;
      msg += `│ • Use ${prefix}help [cmd] for details\n`;
      msg += `│ • Report bugs in support group\n`;
      msg += `│ • Bot auto-updates regularly\n`;
      msg += `│ • Join group for latest updates\n`;
      msg += "╰────────────✰";

      // Send message and schedule unsend (2 minutes = 120000 ms)
      const sentMessage = await message.reply(msg);
      
      setTimeout(async () => {
        try {
          await message.unsend(sentMessage.messageID);
        } catch (err) {
          // Silently fail if unsend doesn't work
        }
      }, 120000);
      
      return;
    }

    // ─── Specific command info ───
    const commandName = args[0].toLowerCase();
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));
    if (!command) return message.reply(`⚠️ Command "${commandName}" not found.`);

    const c = command.config;
    const desc = c.longDescription?.en || "No description available.";
    const guide = c.guide?.en ? c.guide.en.replace(/{pn}/g, `${prefix}${c.name}`) : "No guide provided.";
    const roleText = convertRole(c.role);

    // Command info box with bot version
    const response = [
      `╭───✦ ${boldFont("COMMAND INFO")} ✦───╮`,
      `│ ${boldFont("Name")}: ${boldFont(c.name)}`,
      "├── INFO",
      `│ ${boldFont("Description")}: ${desc}`,
      `│ ${boldFont("Author")}: ${c.author || "Unknown"}`,
      `│ ${boldFont("Guide")}: ${guide}`,
      "├── DETAILS",
      `│ ${boldFont("Version")}: ${c.version || "1.0"}`,
      `│ ${boldFont("Role")}: ${roleText}`,
      `│ ${boldFont("Bot Version")}: ${adminInfo.botVersion}`,
      "╰────────────✦"
    ].join("\n");

    // Send message and schedule unsend (2 minutes = 120000 ms)
    const sentMessage = await message.reply(response);
    
    setTimeout(async () => {
      try {
        await message.unsend(sentMessage.messageID);
      } catch (err) {
        // Silently fail if unsend doesn't work
      }
    }, 120000);
  },
};

function convertRole(role) {
  switch (role) {
    case 0: return "0 (All Users)";
    case 1: return "1 (Group Admins)";
    case 2: return "2 (Bot Admins)";
    default: return "Unknown";
  }
}
