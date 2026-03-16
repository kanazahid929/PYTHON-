const moment = require("moment-timezone");

// Fancy Font Helper Baby
function fancy(text) {
    const map = {
        'a': '𝒂','b': '𝒃','c': '𝒄','d': '𝒅','e': '𝒆','f': '𝒇','g': '𝒈','h': '𝒉','i': '𝒊','j': '𝒋','k': '𝒌','l': '𝒍','m': '𝒎','n': '𝒏','o': '𝒐','p': '𝒑','q': '𝗊','r': '𝒓','s': '𝒔','t': '𝒕','u': '𝒖','v': '𝒗','w': '𝒘','x': '𝒙','y': '𝒚','z': '𝒛',
        'A': '𝑨','B': '𝑩','C': '𝑪','D': '𝑫','E': '𝑬','F': '𝑭','G': '𝑮','H': '𝑯','I': '𝑰','J': '𝑱','K': '𝑲','L': '𝑳','M': '𝑴','N': '𝑵','O': '𝑶','P': '𝑷','Q': '𝑸','R': '𝑹','S': '𝑺','T': '𝑻','U': '𝑼','V': '𝑽','W': '𝒘','X': '𝑿','Y': '𝒀','Z': '𝒁',
        '0': '𝟎','1': '𝟏','2': '𝟐','3': '𝟑','4': '𝟒','5': '𝟓','6': '𝟔','7': '𝟕','8': '𝟖','9': '𝟗', '.': '.'
    };
    return text.toString().split('').map(char => map[char] || char).join('');
}

// Shorthand Formatter Baby
function formatMoney(amount) {
    const units = [
        { v: 1e12, s: "𝑻" }, { v: 1e9, s: "𝑩" }, { v: 1e6, s: "𝑴" }, { v: 1e3, s: "𝑲" }
    ];
    for (let u of units) {
        if (Math.abs(amount) >= u.v) return fancy((amount / u.v).toFixed(2)) + u.s;
    }
    return fancy(Math.floor(amount).toLocaleString());
}

module.exports = {
    config: {
        name: "daily",
        version: "2.0",
        author: "Saif & Gemini",
        countDown: 5,
        role: 0,
        description: {
            en: "Receive your daily rewards baby"
        },
        category: "game",
        guide: {
            en: "{pn} | {pn} info"
        },
        envConfig: {
            rewardFirstDay: {
                coin: 1000, // Starting at 1k Baby
                exp: 250
            }
        }
    },

    langs: {
        en: {
            monday: "𝑴𝒐𝒏𝒅𝒂𝒚",
            tuesday: "𝑻𝒖𝒆𝒔𝒅𝒂𝒚",
            wednesday: "𝑾𝒆𝒅𝒏𝒆𝒔𝒅𝒂𝒚",
            thursday: "𝑻𝒉𝒖𝒓𝒔𝒅𝒂𝒚",
            friday: "𝑭𝒓𝒊𝒅𝒂𝒚",
            saturday: "𝑺𝒂𝒕𝒖𝒓𝒅𝒂𝒚",
            sunday: "𝑺𝒖𝒏𝒅𝒂𝒚",
            alreadyReceived: "❌ 𝑶𝒉 𝒃𝒂𝒃𝒚, 𝒚𝒐𝒖 𝒂𝒍𝒓𝒆𝒂𝒅𝒚 𝒄𝒍𝒂𝒊𝒎𝒆𝒅 𝒚𝒐𝒖𝒓 𝒈𝒊𝒇𝒕 𝒕𝒐𝒅𝒂𝒚!",
            received: "🎁 𝑫𝒂𝒊𝒍𝒚 𝑹𝒆𝒘𝒂𝒓𝒅 𝑩𝒂𝒃𝒚! 𝒀𝒐𝒖 𝒈𝒐𝒕 %1 𝒄𝒐𝒊𝒏𝒔 𝒂𝒏𝒅 %2 𝒆𝒙𝒑!"
        }
    },

    onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
        const reward = envCommands[commandName].rewardFirstDay;
        const { senderID } = event;

        if (args[0] == "info") {
            let msg = `📅 ${fancy("𝑾𝒆𝒆𝒌𝒍𝒚 𝑹𝒆𝒘𝒂𝒓𝒅 𝑳𝒊𝒔𝒕 𝑩𝒂𝒃𝒚")}\n━━━━━━━━━━━━━━━\n`;
            for (let i = 1; i < 8; i++) {
                const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** (i - 1));
                const dayName = i == 7 ? getLang("sunday") :
                                i == 6 ? getLang("saturday") :
                                i == 5 ? getLang("friday") :
                                i == 4 ? getLang("thursday") :
                                i == 3 ? getLang("wednesday") :
                                i == 2 ? getLang("tuesday") : getLang("monday");
                msg += `${dayName}: ${formatMoney(getCoin)} 𝒄𝒐𝒊𝒏𝒔\n`;
            }
            return message.reply(msg);
        }

        const dateTime = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
        const date = new Date();
        const currentDay = date.getDay(); // 0: Sunday, 1: Monday...
        const dayIndex = currentDay === 0 ? 7 : currentDay;

        const userData = await usersData.get(senderID);
        if (userData.data.lastTimeGetReward === dateTime)
            return message.reply(getLang("alreadyReceived"));

        const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** (dayIndex - 1));
        const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** (dayIndex - 1));

        userData.data.lastTimeGetReward = dateTime;
        await usersData.set(senderID, {
            money: userData.money + getCoin,
            exp: userData.exp + getExp,
            data: userData.data
        });

        return message.reply(getLang("received", formatMoney(getCoin), fancy(getExp)));
    }
};
