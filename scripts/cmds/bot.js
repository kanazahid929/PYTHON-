const axios = require('axios');
const baseApiUrl = async () => {
    return "https://noobs-api.top/dipto";
};

// Monospace Bold Font Function
function formatFont(text) {
    const fonts = {
        'a':'𝙖','b':'𝙗','c':'𝙘','d':'𝙙','e':'𝙚','f':'𝙛','g':'𝙜','h':'𝙝','i':'𝙞','j':'𝙟','k':'𝙠','l':'𝙡','m':'𝙢',
        'n':'𝙣','o':'𝙤','p':'𝙥','q':'𝙦','r':'𝙧','s':'𝙨','t':'𝙩','u':'𝙪','v':'𝙫','w':'𝙬','x':'𝙭','y':'𝙮','z':'𝙯',
        'A':'𝘼','B':'𝘽','C':'𝘾','D':'𝘿','E':'𝙀','F':'𝙁','G':'𝙂','H':'𝙃','I':'𝙄','J':'𝙅','K':'𝙆','L':'𝙇','M':'𝙈',
        'N':'𝙉','O':'𝙊','P':'𝙋','Q':'𝙌','R':'𝙍','S':'𝙎','T':'𝙏','U':'𝙐','V':'𝙑','W':'𝙒','X':'𝙓','Y':'𝙔','Z':'𝙕'
    };
    return text.split('').map(c => fonts[c] || c).join('');
}

// Random replies এক জায়গায় রাখা
  const randomReplies = [
        "😚",
        "দূরে যা, তোর কোনো কাজ নাই, শুধু 𝗯𝗯𝘆 𝗯𝗯𝘆 করিস",
        "আমি তো অন্ধ কিছু দেখি না🐸",
        "𝗧𝗮𝗿𝗽𝗼𝗿 𝗯𝗼𝗹𝗼_🙂",
        "Hae go bolo, shunchi toh! 😇",
        "bolo baby😒",
        "What's up?",
        "Bolo jaan ki korte pari tumar jonno",
        "Meow🐤",
        "Bolo Babu, তুমি কি আমাকে ভালোবাসো? 🙈",
        "ফ্রেন্ড রিকোয়েস্ট দিলে ৫ টাকা দিবো 😗",
        "Hop beda😾,Boss বল boss😼",
        "এমবি কিনে দাও না_🥺🥺",
        "🐤🐤",
        "𝙏𝙪𝙢𝙖𝙧 𝙜𝙛 𝙣𝙖𝙞, 𝙩𝙖𝙮 𝙖𝙢𝙠 𝙙𝙖𝙠𝙨𝙤? 😂😂😂",
        "🙂🙂🙂",
        "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘",
        "mb ney bye",
        "bye",
        "Ki chai tumar? 😼",
        "🍺 এই নাও জুস খাও..!𝗕𝗯𝘆 বলতে বলতে হাপায় গেছো না 🥲",
        "বার বার Disturb করেছিস কোনো 😾, আমার জানু এর সাথে ব্যাস্ত আসি 😋",
        "আরে Bolo আমার জান, কেমন আসো? 😚",
        "চুপ থাক নাই তো তোর দাত ভেংগে দিবো কিন্তু"
];

module.exports.config = {
    name: "bby",
    aliases: ["baby", "bbe", "babe", "bbu"],
    version: "7.0.0",
    author: "dipto । Modified By —͟͞͞𝐓𝐀𝐌𝐈𝐌⸙",
    countDown: 0,
    role: 0,
    description: "Better than all SimSimi with 20+ Random Replies and Serif Bold Italic font",
    category: "chat",
    guide: {
        en: "{pn} [anyMessage] OR teach [Message] - [Reply]"
    }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
    const link = `${await baseApiUrl()}/baby`;
    const uid = event.senderID;
    const name = await usersData.getName(uid);

    try {
        if (!args[0]) {
            const randomReply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
            const message = `♡ ${name} ♡\n\n${formatFont(randomReply)}`;
            
            return api.sendMessage({
                body: message,
                mentions: [{
                    tag: `♡ ${name} ♡`,
                    id: uid,
                    fromIndex: 0,
                    length: `♡ ${name} ♡`.length
                }]
            }, event.threadID, event.messageID);
        }

        const input = args.join(" ").toLowerCase();
        if (args[0] === 'teach') {
            const [comd, command] = input.split(/\s*-\s*/);
            const final = comd.replace("teach ", "");
            if (!command) return api.sendMessage(formatFont("Invalid format Baby!"), event.threadID, event.messageID);
            await axios.get(`${link}?teach=${encodeURIComponent(final)}&reply=${encodeURIComponent(command)}&senderID=${uid}`);
            return api.sendMessage(formatFont(`✅ Done Baby! I learned that response.`), event.threadID, event.messageID);
        }

        const res = (await axios.get(`${link}?text=${encodeURIComponent(input)}&senderID=${uid}&font=1`)).data.reply;
        return api.sendMessage(formatFont(res), event.threadID, (err, info) => {
            if(info) global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, author: uid });
        }, event.messageID);

    } catch (e) {
        api.sendMessage("Error occurred Baby!", event.threadID);
    }
};

module.exports.onReply = async ({ api, event }) => {
    try {
        const res = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body)}&senderID=${event.senderID}&font=1`)).data.reply;
        return api.sendMessage(formatFont(res), event.threadID, (err, info) => {
            if(info) global.GoatBot.onReply.set(info.messageID, { commandName: "bby", author: event.senderID });
        }, event.messageID);
    } catch (err) {
        return api.sendMessage("API Error Baby!", event.threadID);
    }
};

module.exports.onChat = async ({ api, event, usersData }) => {
    try {
        const body = event.body ? event.body.toLowerCase() : "";
        const prefixes = ["baby", "bby", "bot", "jan", "babu", "janu", "bbu", "eren"];
        const startsWithPrefix = prefixes.some(p => body.startsWith(p));

        if (startsWithPrefix) {
            const name = await usersData.getName(event.senderID);
            const arr = body.replace(/^\S+\s*/, "");
            
            if (!arr) {
                const randomReply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
                const message = `♡ ${name} ⸙\n\n${formatFont(randomReply)}`;
                
                return api.sendMessage({
                    body: message,
                    mentions: [{
                        tag: `♡ ${name} ⸙`,
                        id: event.senderID,
                        fromIndex: 0,
                        length: `♡ ${name} ⸙`.length
                    }]
                }, event.threadID, (err, info) => {
                    if(info) global.GoatBot.onReply.set(info.messageID, { commandName: "bby", author: event.senderID });
                }, event.messageID);
            }
            
            const res = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;
            return api.sendMessage(formatFont(res), event.threadID, (err, info) => {
                if(info) global.GoatBot.onReply.set(info.messageID, { commandName: "bby", author: event.senderID });
            }, event.messageID);
        }
    } catch (err) {
        console.log(err);
    }
};
