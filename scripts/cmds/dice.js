// ===== FONT & UTILS =====
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
const sb = n => n.toString().split("").map(c => smallBold[c] || c).join("");

const parseShorthand = (str) => {
  if (!str) return NaN;
  str = str.toLowerCase();
  const map = { k:1e3,m:1e6,b:1e9,t:1e12,qd:1e15,qt:1e18,sx:1e21,sp:1e24,oc:1e27,no:1e30,dc:1e33 };
  const suffix = Object.keys(map).sort((a,b)=>b.length-a.length).find(s=>str.endsWith(s));
  const multi = suffix ? map[suffix] : 1;
  if (suffix) str = str.slice(0,-suffix.length);
  const n = parseFloat(str);
  return isNaN(n) ? NaN : n * multi;
};

// ===== MODULE =====
module.exports = {
  config: {
    name: "dice",
    aliases: ["roll"],
    version: "2.0",
    author: "♡—͟͞͞𝐓𝐀𝐌𝐈𝐌⸙ x Gemini",
    countDown: 5,
    role: 0,
    shortDescription: "60/40 Dice betting game 🎲",
    category: "game",
    guide: "{pn} <amount>"
  },

  onStart: async function ({ api, message, args, usersData, event }) {
    const userId = event.senderID;
    const threadID = event.threadID;
    const bet = parseShorthand(args[0]);

    if (isNaN(bet) || bet <= 0)
      return message.reply("❌ | " + toBold("Enter a valid bet amount"));

    const userData = await usersData.get(userId);
    const money = userData.money || 0;

    if (bet > money)
      return message.reply("🚫 | " + toBold("Not enough balance!"));

    // --- 60% Win Logic ---
    const isWin = Math.random() < 0.60;
    let dice;
    
    if (isWin) {
      // Pick a winning number (4, 5, or 6)
      dice = Math.floor(Math.random() * 3) + 4;
    } else {
      // Pick a losing number (1, 2, or 3)
      dice = Math.floor(Math.random() * 3) + 1;
    }

    const diceEmoji = { 1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅" };
    
    // Calculate New Balance
    const winAmount = isWin ? bet : -bet;
    const newMoney = money + winAmount;
    
    await usersData.set(userId, { money: newMoney });

    // Result Message
    const resultHeader = isWin 
      ? `🎉 ${toBold("VICTORY")}` 
      : `💀 ${toBold("DEFEAT")}`;

    const resMsg = `
┏━━━━━ 🎲 𝐃𝐈𝐂𝐄 ━━━━━┓
      ${resultHeader}
┗━━━━━━━━━━━━━━━━━━━━┛

  ◈ ${toBold("Result")}: ${diceEmoji[dice]} (${sb(dice)})
  ◈ ${toBold("Profit")}: ${isWin ? "+" : "-"}${sb(bet)}
  ◈ ${toBold("Wallet")}: ${sb(newMoney)}

   ${isWin ? "🔥 𝐘𝐨𝐮'𝐫𝐞 𝐨𝐧 𝐚 𝐫𝐨𝐥𝐥!" : "💸 𝐃𝐨𝐧'𝐭 𝐠𝐢𝐯𝐞 𝐮𝐩, 𝐛𝐛𝐲!"}
    `.trim();

    return message.reply(resMsg);
  }
};
