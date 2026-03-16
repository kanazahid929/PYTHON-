// 💰 Standard Shorthand Parser Baby (Complete Edition)
const parseAmount = (str) => {
  if (!str) return NaN;
  str = str.toLowerCase().replace(/\s+/g, "");
  const suffixes = {
    vg: 1e63, nod: 1e60, ocd: 1e57, spd: 1e54, sxd: 1e51, qid: 1e48, qad: 1e45,
    td: 1e42, dd: 1e39, ud: 1e36, dc: 1e33, no: 1e30, oc: 1e27, sp: 1e24,
    sx: 1e21, qi: 1e18, qa: 1e15, t: 1e12, b: 1e9, m: 1e6, k: 1e3
  };
  let matched = Object.keys(suffixes).sort((a,b) => b.length - a.length).find(suf => str.endsWith(suf));
  let multiplier = matched ? suffixes[matched] : 1;
  if (matched) str = str.slice(0, -matched.length);
  let num = parseFloat(str);
  return isNaN(num) ? NaN : num * multiplier;
};

// ✨ Bold Sans-Serif Font Baby
const toBoldSerifItalic = (text) => {
  if (text === undefined || text === null) return "";
  const fonts = {
    'a': '𝐚','b': '𝐛','c': '𝐜','d': '𝐝','e': '𝐞','f': '𝐟','g': '𝐠','h': '𝐡','i': '𝐢','j': '𝐣','k': '𝐤','l': '𝐥','m': '𝐦','n': '𝐧','o': '𝐨','p': '𝐩','q': '𝐪','r': '𝐫','s': '𝐬','t': '𝐭','u': '𝐮','v': '𝐯','w': '𝐰','x': '𝐱','y': '𝐲','z': '𝐳',
    'A': '𝐀','B': '𝐁','C': '𝐂','D': '𝐃','E': '𝐄','F': '𝐅','G': '𝐆','H': '𝐇','I': '𝐈','J': '𝐉','K': '𝐊','L': '𝐋','M': '𝐌','N': '𝐍','O': '𝐎','P': '𝐏','Q': '𝐐','R': '𝐑','S': '𝐒','T': '𝐓','U': '𝐔','V': '𝐕','W': '𝐖','X': '𝐗','Y': '𝐘','Z': '𝐙',
    '0': '𝟎','1': '𝟏','2': '𝟐','3': '𝟑','4': '𝟒','5': '𝟓','6': '𝟔','7': '𝟕','8': '𝟖','9': '𝟗', '.': '.'
  };
  return String(text).split('').map(char => fonts[char] || char).join('');
};

// 🏦 Standard Shorthand Formatter Baby (Complete Edition)
function formatMoney(num) {
  if (num === undefined || num === null || isNaN(num)) return "0";
  
  const suffixes = [
    { value: 1e63, symbol: "𝐕𝐠" },   // Vigintillion
    { value: 1e60, symbol: "𝐍𝐨𝐝" },  // Novemdecillion
    { value: 1e57, symbol: "𝐎𝐜𝐝" },  // Octodecillion
    { value: 1e54, symbol: "𝐒𝐩𝐝" },  // Septendecillion
    { value: 1e51, symbol: "𝐒𝐱𝐝" },  // Sexdecillion
    { value: 1e48, symbol: "𝐐𝐢𝐝" },  // Quindecillion
    { value: 1e45, symbol: "𝐐𝐚𝐝" },  // Quattuordecillion
    { value: 1e42, symbol: "𝐓𝐝" },   // Tredecillion
    { value: 1e39, symbol: "𝐃𝐝" },   // Duodecillion
    { value: 1e36, symbol: "𝐔𝐝" },   // Undecillion
    { value: 1e33, symbol: "𝐃𝐜" },   // Decillion
    { value: 1e30, symbol: "𝐍𝐨" },   // Nonillion
    { value: 1e27, symbol: "𝐎𝐜" },   // Octillion
    { value: 1e24, symbol: "𝐒𝐩" },   // Septillion
    { value: 1e21, symbol: "𝐒𝐱" },   // Sextillion
    { value: 1e18, symbol: "𝐐𝐢" },   // Quintillion
    { value: 1e15, symbol: "𝐐𝐚" },   // Quadrillion
    { value: 1e12, symbol: "𝐓" },    // Trillion
    { value: 1e9,  symbol: "𝐁" },    // Billion
    { value: 1e6,  symbol: "𝐌" },    // Million
    { value: 1e3,  symbol: "𝐊" }     // Thousand
  ];
  for (const s of suffixes) {
    if (num >= s.value) {
      return toBoldSerifItalic((num / s.value).toFixed(2)) + s.symbol;
    }
  }
  return toBoldSerifItalic(Math.floor(num).toString());
}

const emojis = ["❤️", "💙", "💚", "💛", "💜", "🧡"];

module.exports = {
  config: {
    name: "bet",
    version: "5.5",
    author: "Saif",
    category: "game",
    countDown: 15,
    shortDescription: "🎰 𝐔𝐋𝐓𝐑𝐀-𝐒𝐓𝐀𝐁𝐋𝐄 𝐁𝐄𝐓 𝐆𝐀𝐌𝐄",
    guide: { en: "{p}bet <amount>" }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { senderID, threadID, messageID } = event;
    const user = senderID;
    const now = Date.now();

    // Get user data
    const userData = await usersData.get(user);
    if (!userData.data) userData.data = {};

    // 🕐 12 Hours Reset System Baby
    const TWELVE_HOURS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    
    if (!userData.data.betLimit || !userData.data.betLimit.lastReset) {
      userData.data.betLimit = { lastReset: now, count: 0 };
    } else {
      const timeSinceReset = now - userData.data.betLimit.lastReset;
      if (timeSinceReset >= TWELVE_HOURS) {
        userData.data.betLimit = { lastReset: now, count: 0 };
      }
    }

    if (userData.data.betLimit.count >= 20) {
      const timeLeft = TWELVE_HOURS - (now - userData.data.betLimit.lastReset);
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      
      return api.sendMessage(
        toBoldSerifItalic(`⚠️ YOU HAVE REACHED YOUR LIMIT OF 20 BETS!\n⏰ Reset in: ${hoursLeft}h ${minutesLeft}m`),
        threadID,
        messageID
      );
    }

    let betAmount = parseAmount(args[0]);
    if (!betAmount || betAmount <= 0) {
      return api.sendMessage(
        toBoldSerifItalic("❌ INVALID BET AMOUNT! USAGE: bet 500"),
        threadID,
        messageID
      );
    }

    if (!userData || userData.money < betAmount) {
      return api.sendMessage(
        toBoldSerifItalic("💰 INSUFFICIENT BALANCE! YOU HAVE: ") + formatMoney(userData?.money || 0),
        threadID,
        messageID
      );
    }

    const userEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const loadingMsg = await api.sendMessage(
      toBoldSerifItalic("🎰 BETTING ON ") + userEmoji + toBoldSerifItalic(" BABY... 🎀\n💵 AMOUNT: ") + formatMoney(betAmount),
      threadID,
      messageID
    );

    await new Promise(r => setTimeout(r, 2000));

    // 50/50 Win Chance
    const isWin = Math.random() < 0.50;
    const winEmoji = isWin ? userEmoji : "🖤";
    const change = isWin ? betAmount : -betAmount;
    const newBalance = userData.money + change;

    userData.data.betLimit.count += 1;
    await usersData.set(user, { money: newBalance, data: userData.data });

    let resultText = isWin 
      ? toBoldSerifItalic("✅ YOU WON: ") + formatMoney(betAmount) 
      : toBoldSerifItalic("❌ YOU LOST: ") + formatMoney(betAmount);

    const finalResult = `
🎰 ${toBoldSerifItalic("BET RESULT BABY")}

${toBoldSerifItalic("YOUR EMOJI:")} ${userEmoji}
${toBoldSerifItalic("WINNING EMOJI:")} ${winEmoji}

${resultText}

💰 ${toBoldSerifItalic("NEW BALANCE:")} ${formatMoney(newBalance)}
📈 ${toBoldSerifItalic("DAILY USE:")} ${toBoldSerifItalic(userData.data.betLimit.count.toString())}/𝟐𝟎
    `.trim();

    // Edit message first
    await api.editMessage(finalResult, loadingMsg.messageID);
    
    // Then set auto-unsend after 1 minute
    setTimeout(() => {
      api.unsendMessage(loadingMsg.messageID);
    }, 60000);
  }
};