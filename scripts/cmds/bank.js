const fs = require("fs");
const path = require("path");

// Fancy Font Helper Baby - New Style
function fancy(text) {
    const map = {
        'a': '𝐚','b': '𝐛','c': '𝐜','d': '𝐝','e': '𝐞','f': '𝐟','g': '𝐠','h': '𝐡','i': '𝐢','j': '𝐣','k': '𝐤','l': '𝐥','m': '𝐦','n': '𝐧','o': '𝐨','p': '𝐩','q': '𝐪','r': '𝐫','s': '𝐬','t': '𝐭','u': '𝐮','v': '𝐯','w': '𝐰','x': '𝐱','y': '𝐲','z': '𝐳',
        'A': '𝐀','B': '𝐁','C': '𝐂','D': '𝐃','E': '𝐄','F': '𝐅','G': '𝐆','H': '𝐇','I': '𝐈','J': '𝐉','K': '𝐊','L': '𝐋','M': '𝐌','N': '𝐍','O': '𝐎','P': '𝐏','Q': '𝐐','R': '𝐑','S': '𝐒','T': '𝐓','U': '𝐔','V': '𝐕','W': '𝐖','X': '𝐗','Y': '𝐘','Z': '𝐙',
        '0': '𝟎','1': '𝟏','2': '𝟐','3': '𝟑','4': '𝟒','5': '𝟓','6': '𝟔','7': '𝟕','8': '𝟖','9': '𝟗',
        '.': '.', ',': ',', ':': ':', '/': '/',
        '|': '|', '[': '[', ']': ']', '-': '-', '_': '_'
    };
    return text.toString().split('').map(char => map[char] || char).join('');
}

function parseAmount(str) {
    if (!str) return NaN;
    str = str.toLowerCase().replace(/\s+/g, "");
    const map = {
        k: 1e3, m: 1e6, b: 1e9, t: 1e12
    };
    const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);
    for (let key of sortedKeys) {
        if (str.endsWith(key)) {
            let num = parseFloat(str.slice(0, -key.length));
            return isNaN(num) ? NaN : num * map[key];
        }
    }
    return parseFloat(str);
}

function formatMoney(amount) {
    const units = [
        { v: 1e12, s: "𝐓" }, { v: 1e9, s: "𝐁" }, { v: 1e6, s: "𝐌" }, { v: 1e3, s: "𝐊" }
    ];
    for (let u of units) {
        if (Math.abs(amount) >= u.v) return (amount / u.v).toFixed(2) + u.s;
    }
    return amount.toFixed(2);
}

module.exports = {
  config: {
    name: "bank",
    version: "6.0",
    description: "🏦 𝐔𝐋𝐓𝐑𝐀-𝐁𝐀𝐍𝐊 𝐌𝐎𝐍𝐆𝐎𝐃𝐁 𝐄𝐃𝐈𝐓𝐈𝐎𝐍 𝐁𝐀𝐁𝐘 🏦",
    category: "bank",
    author: "𝐌𝐝 𝐌𝐨𝐣𝐚𝐝𝐝𝐞𝐝 𝐇𝐨𝐬𝐬𝐚𝐢𝐧",
    countDown: 3
  },

  onStart: async function({ args, message, event, api, usersData }) {
    const userID = event.senderID;
    const userName = await usersData.getName(userID);
    
    // Fancy reply function with new style
    const reply = text => message.reply(
`🎀
> ${fancy(userName)}

${text}`
    );

    // Fetch User Data from DB
    let userData = await usersData.get(userID);
    if (!userData.data) userData.data = {};
    
    // Initialize bank data structure
    if (!userData.data.bankData) {
        userData.data.bankData = { 
            bank: 0, 
            lastInterest: Date.now(),
            loan: 0,
            loanTime: 0,
            transactionHistory: []
        };
    }

    let userBank = userData.data.bankData;
    let userMoney = userData.money || 0;

    const saveDB = async (id, bankObj, cash) => {
        await usersData.set(id, { 
            money: cash,
            data: { ...userData.data, bankData: bankObj } 
        });
    };

    // Auto interest check (daily)
    const checkInterest = async () => {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (now - userBank.lastInterest >= oneDay && userBank.bank > 0) {
            const daysPassed = Math.floor((now - userBank.lastInterest) / oneDay);
            const interestRate = 0.05; // 5% daily interest
            const interest = userBank.bank * interestRate * daysPassed;
            
            userBank.bank += interest;
            userBank.lastInterest = userBank.lastInterest + (daysPassed * oneDay);
            
            userBank.transactionHistory.unshift({
                type: "interest",
                amount: interest,
                time: now,
                note: `${daysPassed} 𝐝𝐚𝐲(𝐬) 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 @ 𝟓%`
            });
            
            await saveDB(userID, userBank, userMoney);
            return interest;
        }
        return 0;
    };

    // Auto loan interest check (hourly)
    const checkLoanInterest = async () => {
        if (userBank.loan <= 0) return 0;
        
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        if (now - userBank.loanTime >= oneHour) {
            const hoursPassed = Math.floor((now - userBank.loanTime) / oneHour);
            const loanInterestRate = 0.02; // 2% hourly interest on loans
            const interest = userBank.loan * loanInterestRate * hoursPassed;
            
            userBank.loan += interest;
            userBank.loanTime = userBank.loanTime + (hoursPassed * oneHour);
            
            // Log the loan interest
            userBank.transactionHistory.unshift({
                type: "loan_interest",
                amount: interest,
                time: now,
                note: `𝐋𝐨𝐚𝐧 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 ${hoursPassed}𝐡 @ 𝟐%`
            });
            
            await saveDB(userID, userBank, userMoney);
            return interest;
        }
        return 0;
    };

    const command = args[0]?.toLowerCase();
    const amount = parseAmount(args[1]);

    // Check auto interests first
    await checkInterest();
    await checkLoanInterest();

    switch(command) {
      case "deposit":
      case "dep":
        if (isNaN(amount) || amount <= 0) return reply(fancy("❌ 𝐄𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐛𝐚𝐛𝐲."));
        if (userMoney < amount) return reply(fancy("❌ 𝐘𝐨𝐮 𝐝𝐨𝐧'𝐭 𝐡𝐚𝐯𝐞 𝐞𝐧𝐨𝐮𝐠𝐡 𝐜𝐚𝐬𝐡 𝐛𝐚𝐛𝐲."));
        
        userBank.bank += amount;
        
        userBank.transactionHistory.unshift({
            type: "deposit",
            amount: amount,
            time: Date.now(),
            note: "𝐁𝐚𝐧𝐤 𝐝𝐞𝐩𝐨𝐬𝐢𝐭"
        });
        if (userBank.transactionHistory.length > 10) userBank.transactionHistory.pop();
        
        await saveDB(userID, userBank, userMoney - amount);
        
        return reply(
`• 𝐃𝐞𝐩𝐨𝐬𝐢𝐭𝐞𝐝: ${fancy(formatMoney(amount))} 💰
• 𝐁𝐚𝐧𝐤 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${fancy(formatMoney(userBank.bank))} 💳
• 𝐂𝐚𝐬𝐡 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${fancy(formatMoney(userMoney - amount))} 💵`
        );

      case "withdraw":
      case "wd":
        if (isNaN(amount) || amount <= 0) return reply(fancy("❌ 𝐄𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐛𝐚𝐛𝐲."));
        if (userBank.bank < amount) return reply(fancy("❌ 𝐘𝐨𝐮𝐫 𝐛𝐚𝐧𝐤 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 𝐢𝐬 𝐭𝐨𝐨 𝐥𝐨𝐰 𝐛𝐚𝐛𝐲."));
        
        userBank.bank -= amount;
        
        userBank.transactionHistory.unshift({
            type: "withdraw",
            amount: amount,
            time: Date.now(),
            note: "𝐁𝐚𝐧𝐤 𝐰𝐢𝐭𝐡𝐝𝐫𝐚𝐰"
        });
        
        await saveDB(userID, userBank, userMoney + amount);
        
        return reply(
`• 𝐖𝐢𝐭𝐡𝐝𝐫𝐚𝐰𝐧: ${fancy(formatMoney(amount))} 💵
• 𝐁𝐚𝐧𝐤 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${fancy(formatMoney(userBank.bank))} 💳
• 𝐂𝐚𝐬𝐡 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${fancy(formatMoney(userMoney + amount))} 💰`
        );

      case "balance":
      case "bal":
        const total = userBank.bank + userMoney;
        let loanInfo = "";
        if (userBank.loan > 0) {
            loanInfo = `\n• 𝐋𝐨𝐚𝐧 𝐃𝐮𝐞: ${fancy(formatMoney(userBank.loan))} ⚠️`;
        }
        
        return reply(
`• 𝐁𝐚𝐧𝐤: ${fancy(formatMoney(userBank.bank))} 💳
• 𝐂𝐚𝐬𝐡: ${fancy(formatMoney(userMoney))} 💵
• 𝐓𝐨𝐭𝐚𝐥: ${fancy(formatMoney(total))} 💰${loanInfo}`
        );

      case "interest":
        const now = Date.now();
        const diff = (now - userBank.lastInterest) / 1000;
        
        if (diff < 86400) {
          const hours = Math.floor((86400 - diff) / 3600);
          const minutes = Math.floor(((86400 - diff) % 3600) / 60);
          
          if (userBank.bank === 0) {
            return reply(fancy("❌ 𝐘𝐨𝐮 𝐧𝐞𝐞𝐝 𝐦𝐨𝐧𝐞𝐲 𝐢𝐧 𝐛𝐚𝐧𝐤 𝐟𝐢𝐫𝐬𝐭 𝐛𝐚𝐛𝐲."));
          }
          
          const potentialInterest = userBank.bank * 0.05;
          
          return reply(
`⏰ 𝐍𝐞𝐱𝐭 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭 𝐢𝐧: ${fancy(hours)}𝐡 ${fancy(minutes)}𝐦
💰 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐁𝐚𝐧𝐤: ${fancy(formatMoney(userBank.bank))}
💸 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭: ${fancy(formatMoney(potentialInterest))} @ 𝟓%`
          );
        }
        
        const interest = userBank.bank * 0.05;
        userBank.bank += interest;
        userBank.lastInterest = now;
        
        userBank.transactionHistory.unshift({
            type: "interest",
            amount: interest,
            time: now,
            note: "𝐃𝐚𝐢𝐥𝐲 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 @ 𝟓%"
        });
        
        await saveDB(userID, userBank, userMoney);
        
        return reply(
`💸 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭 𝐄𝐚𝐫𝐧𝐞𝐝: ${fancy(formatMoney(interest))}
💰 𝐍𝐞𝐰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${fancy(formatMoney(userBank.bank))}
✨ 𝐂𝐨𝐦𝐞 𝐛𝐚𝐜𝐤 𝐭𝐨𝐦𝐨𝐫𝐫𝐨𝐰 𝐟𝐨𝐫 𝐦𝐨𝐫𝐞 𝐛𝐚𝐛𝐲!`
        );

      case "loan":
        // Check current loan status
        if (!args[1] || args[1] === "status") {
            if (userBank.loan <= 0) {
                return reply(
`💰 𝐋𝐨𝐚𝐧 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐍𝐨 𝐚𝐜𝐭𝐢𝐯𝐞 𝐥𝐨𝐚𝐧
🏦 𝐌𝐚𝐱 𝐋𝐨𝐚𝐧: 𝟏𝟎𝐌
💰 𝐘𝐨𝐮𝐫 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${fancy(formatMoney(userBank.bank))}
💵 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐂𝐚𝐬𝐡: ${fancy(formatMoney(userMoney))}

𝐔𝐬𝐞: 𝐛𝐚𝐧𝐤 𝐥𝐨𝐚𝐧 <𝐚𝐦𝐨𝐮𝐧𝐭> 𝐭𝐨 𝐛𝐨𝐫𝐫𝐨𝐰`
                );
            }
            
            // Calculate total with interest
            const totalDue = userBank.loan;
            const interestAmount = totalDue - parseAmount(args[1] ? args[1] : "0");
            
            return reply(
`💰 𝐀𝐜𝐭𝐢𝐯𝐞 𝐋𝐨𝐚𝐧: ${fancy(formatMoney(userBank.loan))}
⚠️ 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭: 𝟐% 𝐩𝐞𝐫 𝐡𝐨𝐮𝐫
💸 𝐓𝐨𝐭𝐚𝐥 𝐃𝐮𝐞: ${fancy(formatMoney(userBank.loan))}
✅ 𝐓𝐨 𝐩𝐚𝐲: 𝐛𝐚𝐧𝐤 𝐥𝐨𝐚𝐧 𝐩𝐚𝐲 <𝐚𝐦𝐨𝐮𝐧𝐭>`
            );
        }
        
        if (args[1] === "pay") {
            const payAmount = parseAmount(args[2]);
            if (isNaN(payAmount) || payAmount <= 0) return reply(fancy("❌ 𝐄𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐛𝐚𝐛𝐲."));
            if (userBank.loan <= 0) return reply(fancy("✅ 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐧𝐨 𝐥𝐨𝐚𝐧 𝐛𝐚𝐛𝐲!"));
            if (payAmount > userBank.loan) return reply(fancy("❌ 𝐘𝐨𝐮'𝐫𝐞 𝐩𝐚𝐲𝐢𝐧𝐠 𝐦𝐨𝐫𝐞 𝐭𝐡𝐚𝐧 𝐲𝐨𝐮 𝐨𝐰𝐞 𝐛𝐚𝐛𝐲."));
            if (userMoney < payAmount) return reply(fancy("❌ 𝐍𝐨𝐭 𝐞𝐧𝐨𝐮𝐠𝐡 𝐜𝐚𝐬𝐡 𝐛𝐚𝐛𝐲."));
            
            userBank.loan -= payAmount;
            
            // Log payment
            userBank.transactionHistory.unshift({
                type: "loan_payment",
                amount: payAmount,
                time: Date.now(),
                note: "𝐋𝐨𝐚𝐧 𝐩𝐚𝐲𝐦𝐞𝐧𝐭"
            });
            
            await saveDB(userID, userBank, userMoney - payAmount);
            
            if (userBank.loan <= 0) {
                return reply(
`✅ 𝐋𝐨𝐚𝐧 𝐅𝐮𝐥𝐥𝐲 𝐏𝐚𝐢𝐝! 🎉
💰 𝐏𝐚𝐢𝐝: ${fancy(formatMoney(payAmount))}
💵 𝐑𝐞𝐦𝐚𝐢𝐧𝐢𝐧𝐠 𝐂𝐚𝐬𝐡: ${fancy(formatMoney(userMoney - payAmount))}
✨ 𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐛𝐚𝐛𝐲!`
                );
            }
            
            return reply(
`✅ 𝐋𝐨𝐚𝐧 𝐏𝐚𝐲𝐦𝐞𝐧𝐭: ${fancy(formatMoney(payAmount))}
💰 𝐑𝐞𝐦𝐚𝐢𝐧𝐢𝐧𝐠 𝐋𝐨𝐚𝐧: ${fancy(formatMoney(userBank.loan))}
⚠️ 𝐊𝐞𝐞𝐩 𝐩𝐚𝐲𝐢𝐧𝐠 𝐭𝐨 𝐚𝐯𝐨𝐢𝐝 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭!`
            );
        }
        
        // New loan request
        if (isNaN(amount) || amount <= 0) return reply(fancy("❌ 𝐄𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐛𝐚𝐛𝐲."));
        
        // Max loan 10M
        const MAX_LOAN = 10_000_000;
        if (amount > MAX_LOAN) {
            return reply(fancy(`❌ 𝐌𝐚𝐱 𝐥𝐨𝐚𝐧 𝐚𝐦𝐨𝐮𝐧𝐭 𝐢𝐬 𝟏𝟎𝐌 𝐛𝐚𝐛𝐲.`));
        }
        
        if (userBank.loan > 0) {
            return reply(fancy("❌ 𝐘𝐨𝐮 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐡𝐚𝐯𝐞 𝐚𝐧 𝐚𝐜𝐭𝐢𝐯𝐞 𝐥𝐨𝐚𝐧 𝐛𝐚𝐛𝐲."));
        }
        
        // Add to bank balance instead of cash
        userBank.loan = amount;
        userBank.loanTime = Date.now();
        userBank.bank += amount; // Loan amount goes to bank balance
        
        userBank.transactionHistory.unshift({
            type: "loan_taken",
            amount: amount,
            time: Date.now(),
            note: "𝐍𝐞𝐰 𝐥𝐨𝐚𝐧 𝐚𝐩𝐩𝐫𝐨𝐯𝐞𝐝"
        });
        
        await saveDB(userID, userBank, userMoney);
        
        return reply(
`✅ 𝐋𝐨𝐚𝐧 𝐀𝐩𝐩𝐫𝐨𝐯𝐞𝐝: ${fancy(formatMoney(amount))}
💰 𝐍𝐞𝐰 𝐁𝐚𝐧𝐤 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${fancy(formatMoney(userBank.bank))}
⚠️ 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭: 𝟐% 𝐩𝐞𝐫 𝐡𝐨𝐮𝐫
📅 𝐏𝐚𝐲 𝐪𝐮𝐢𝐜𝐤𝐥𝐲 𝐛𝐚𝐛𝐲!

𝐓𝐨 𝐜𝐡𝐞𝐜𝐤: 𝐛𝐚𝐧𝐤 𝐥𝐨𝐚𝐧 𝐬𝐭𝐚𝐭𝐮𝐬
𝐓𝐨 𝐩𝐚𝐲: 𝐛𝐚𝐧𝐤 𝐥𝐨𝐚𝐧 𝐩𝐚𝐲 <𝐚𝐦𝐨𝐮𝐧𝐭>`
        );

      case "history":
      case "log":
        if (!userBank.transactionHistory || userBank.transactionHistory.length === 0) {
            return reply(fancy("📊 𝐍𝐨 𝐭𝐫𝐚𝐧𝐬𝐚𝐜𝐭𝐢𝐨𝐧 𝐡𝐢𝐬𝐭𝐨𝐫𝐲 𝐲𝐞𝐭 𝐛𝐚𝐛𝐲."));
        }
        
        let historyText = "📊 𝐋𝐚𝐬𝐭 𝟏𝟎 𝐓𝐫𝐚𝐧𝐬𝐚𝐜𝐭𝐢𝐨𝐧𝐬:\n";
        historyText += "━━━━━━━━━━━━━━━\n";
        
        userBank.transactionHistory.slice(0, 10).forEach((t, i) => {
            const date = new Date(t.time).toLocaleTimeString();
            let symbol = "📝";
            if (t.type === "deposit") symbol = "💛";
            else if (t.type === "withdraw") symbol = "💵";
            else if (t.type === "interest") symbol = "💎";
            else if (t.type === "loan_taken") symbol = "💰";
            else if (t.type === "loan_payment") symbol = "✅";
            else if (t.type === "loan_interest") symbol = "⚠️";
            else if (t.type === "transfer_out") symbol = "📤";
            else if (t.type === "transfer_in") symbol = "📥";
            
            historyText += `${symbol} ${fancy(t.type)}: ${fancy(formatMoney(t.amount))} [${fancy(date)}]\n`;
            if (t.note) historyText += `   📝 ${fancy(t.note)}\n`;
        });
        
        return reply(historyText);

      case "transfer":
        let recipientID = event.messageReply ? event.messageReply.senderID : (event.mentions ? Object.keys(event.mentions)[0] : args[2]);
        if (!recipientID || isNaN(amount) || amount <= 0) return reply(fancy("❌ 𝐔𝐬𝐚𝐠𝐞: 𝐛𝐚𝐧𝐤 𝐭𝐫𝐚𝐧𝐬𝐟𝐞𝐫 <𝐚𝐦𝐨𝐮𝐧𝐭> @𝐭𝐚𝐠 𝐛𝐚𝐛𝐲."));
        if (recipientID === userID) return reply(fancy("❌ 𝐘𝐨𝐮 𝐜𝐚𝐧'𝐭 𝐬𝐞𝐧𝐝 𝐭𝐨 𝐲𝐨𝐮𝐫𝐬𝐞𝐥𝐟 𝐛𝐚𝐛𝐲."));
        if (userBank.bank < amount) return reply(fancy("❌ 𝐍𝐨𝐭 𝐞𝐧𝐨𝐮𝐠𝐡 𝐛𝐚𝐧𝐤 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 𝐛𝐚𝐛𝐲."));

        let targetData = await usersData.get(recipientID);
        if (!targetData.data) targetData.data = {};
        if (!targetData.data.bankData) targetData.data.bankData = { bank: 0, lastInterest: Date.now(), loan: 0, transactionHistory: [] };
        
        const recipientName = await usersData.getName(recipientID);
        
        userBank.bank -= amount;
        targetData.data.bankData.bank += amount;
        
        // Log transactions for both
        userBank.transactionHistory.unshift({
            type: "transfer_out",
            amount: amount,
            time: Date.now(),
            note: `𝐓𝐨: ${recipientName}`
        });
        
        targetData.data.bankData.transactionHistory.unshift({
            type: "transfer_in",
            amount: amount,
            time: Date.now(),
            note: `𝐅𝐫𝐨𝐦: ${userName}`
        });

        await saveDB(userID, userBank, userMoney);
        await usersData.set(recipientID, { data: targetData.data });
        
        return reply(
`✅ 𝐓𝐫𝐚𝐧𝐬𝐟𝐞𝐫𝐫𝐞𝐝: ${fancy(formatMoney(amount))}
👤 𝐓𝐨: ${fancy(recipientName)}
💰 𝐘𝐨𝐮𝐫 𝐁𝐚𝐧𝐤: ${fancy(formatMoney(userBank.bank))}`
        );

      case "top":
      case "richlist":
        const allUsers = await usersData.getAll();
        const sorted = allUsers
            .filter(u => u.data && u.data.bankData && u.data.bankData.bank > 0)
            .sort((a, b) => b.data.bankData.bank - a.data.bankData.bank)
            .slice(0, 10);

        if (sorted.length === 0) {
            return reply(fancy("📊 𝐍𝐨 𝐫𝐢𝐜𝐡 𝐮𝐬𝐞𝐫𝐬 𝐲𝐞𝐭 𝐛𝐚𝐛𝐲."));
        }

        let leaderboard = "🏆 𝐓𝐨𝐩 𝟏𝟎 𝐑𝐢𝐜𝐡 𝐁𝐚𝐛𝐢𝐞𝐬 🏆\n";
        leaderboard += "━━━━━━━━━━━━━━━\n";
        
        for (let i = 0; i < sorted.length; i++) {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
            leaderboard += `${medal} ${fancy(sorted[i].name || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧")}\n`;
            leaderboard += `   💰 ${fancy(formatMoney(sorted[i].data.bankData.bank))}\n`;
        }
        
        // Add user's rank
        const userRank = allUsers.findIndex(u => u.userID === userID) + 1;
        if (userRank > 0 && userRank > 10) {
            leaderboard += `━━━━━━━━━━━━━━━\n📊 𝐘𝐨𝐮𝐫 𝐑𝐚𝐧𝐤: #${fancy(userRank)}`;
        }
        
        return reply(leaderboard);

      default:
        return reply(
`𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬:
━━━━━━━━━━━━━━━
💳 𝐝𝐞𝐩𝐨𝐬𝐢𝐭 <𝐚𝐦𝐨𝐮𝐧𝐭>
💵 𝐰𝐢𝐭𝐡𝐝𝐫𝐚𝐰 <𝐚𝐦𝐨𝐮𝐧𝐭>
📊 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 / 𝐛𝐚𝐥
💎 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭
💰 𝐥𝐨𝐚𝐧 <𝐚𝐦𝐨𝐮𝐧𝐭> (𝐌𝐚𝐱 𝟏𝟎𝐌)
💸 𝐥𝐨𝐚𝐧 𝐩𝐚𝐲 <𝐚𝐦𝐨𝐮𝐧𝐭>
📜 𝐡𝐢𝐬𝐭𝐨𝐫𝐲 / 𝐥𝐨𝐠
👥 𝐭𝐫𝐚𝐧𝐬𝐟𝐞𝐫 <𝐚𝐦𝐨𝐮𝐧𝐭> @𝐭𝐚𝐠
🏆 𝐭𝐨𝐩 / 𝐫𝐢𝐜𝐡𝐥𝐢𝐬𝐭

✨ 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: 𝐛𝐚𝐧𝐤 𝐥𝐨𝐚𝐧 𝟓𝐌`
        );
    }
  }
};