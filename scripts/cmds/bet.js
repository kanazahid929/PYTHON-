// ===== FONT & MONEY SYSTEM =====
const boldFontMap = {
  a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",
  k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",
  u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳",
  A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",
  K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",
  U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",
  0:"𝟎",1:"𝟏",2:"𝟐",3:"𝟑",4:"𝟒",5:"𝟓",6:"𝟔",7:"𝟕",8:"𝟖",9:"𝟗"
};
const toBold = t => t.split("").map(c => boldFontMap[c] || c).join("");

const smallBold = {"0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗",".":"."};
const sb = n => n.toString().split("").map(c=>smallBold[c]||c).join("");

const parseShorthand = (str) => {
  if (!str) return NaN;
  str = str.toLowerCase();
  const map = { k:1e3,m:1e6,b:1e9,t:1e12 };
  const suffix = Object.keys(map).find(s=>str.endsWith(s));
  const multi = suffix ? map[suffix] : 1;
  if (suffix) str = str.slice(0,-suffix.length);
  const n = parseFloat(str);
  return isNaN(n) ? NaN : n * multi;
};

// ===== MODULE =====
module.exports = {
  config: {
    name: "bet",
    version: "2.1",
    author: "♡—͟͞͞𝐓𝐀𝐌𝐈𝐌⸙",
    category: "game",
    shortDescription: { en: "Aesthetic betting game" }
  },

  onStart: async ({ args, message, event, usersData, api }) => {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const bet = parseShorthand(args[0]);

    if (isNaN(bet) || bet <= 0) return message.reply("⚠️ " + toBold("Invalid Bet Amount"));
    if (bet > userData.money) return message.reply("💰 " + toBold("Balance is too low"));

    // --- ANIMATION START ---
    const loading = await message.reply(`
╭━━━ 🎲 ${toBold("BETTING")} 🎲 ━━━╮
│
│  [ ▬▬▭▭▭▭▭▭▭ ]
│  ${toBold("Shuffling chips...")}
│
╰━━━━━━━━━━━━━━━━━╯`);

    await new Promise(r => setTimeout(r, 1000));
    
    // Logic (40% Win Chance)
    const isWin = Math.random() < 0.4;
    const finalBalance = isWin ? userData.money + bet : userData.money - bet;

    await usersData.set(senderID, { money: finalBalance });

    const result = `
┏━━━━━━━━━━━━━━━━━┓
   ${isWin ? "🏆 " + toBold("YOU WON") : "💸 " + toBold("YOU LOST")}
┗━━━━━━━━━━━━━━━━━┛
  
  👤 ${toBold("Player")}: ${userData.name || "User"}
  💵 ${toBold("Amount")}: ${sb(bet)}
  
  ${isWin ? "✅ Profit" : "❌ Loss"}: ${sb(bet)}
  🏦 ${toBold("Balance")}: ${sb(finalBalance)}

┏━━━━━━━━━━━━━━━━━┓
   ${isWin ? "🔥 King of the table!" : "💀 Better luck next time!"}
┗━━━━━━━━━━━━━━━━━┛`;

    // Amader system-e edit thake na, tai api.editMessage use korlam
    return api.editMessage(result, loading.messageID);
  }
};
