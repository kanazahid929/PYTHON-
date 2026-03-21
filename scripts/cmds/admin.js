const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

// 🌸 FULL STYLISH FONT (Letters + Numbers)
function stylish(text) {
	const map = {
		a:"𝐚", b:"𝐛", c:"𝐜", d:"𝐝", e:"𝐞", f:"𝐟", g:"𝐠",
		h:"𝐡", i:"𝐢", j:"𝐣", k:"𝐤", l:"𝐥", m:"𝐦", n:"𝐧",
		o:"𝐨", p:"𝐩", q:"𝐪", r:"𝐫", s:"𝐬", t:"𝐭", u:"𝐮",
		v:"𝐯", w:"𝐰", x:"𝐱", y:"𝐲", z:"𝐳",
		A:"𝐀", B:"𝐁", C:"𝐂", D:"𝐃", E:"𝐄", F:"𝐅", G:"𝐆",
		H:"𝐇", I:"𝐈", J:"𝐉", K:"𝐊", L:"𝐋", M:"𝐌", N:"𝐍",
		O:"𝐎", P:"𝐏", Q:"𝐐", R:"𝐑", S:"𝐒", T:"𝐓", U:"𝐔",
		V:"𝐕", W:"𝐖", X:"𝐗", Y:"𝐘", Z:"𝐙",
		0:"𝟎",1:"𝟏",2:"𝟐",3:"𝟑",4:"𝟒",
		5:"𝟓",6:"𝟔",7:"𝟕",8:"𝟖",9:"𝟗"
	};
	return text.split("").map(c => map[c] || c).join("");
}

// 👑 MULTIPLE MAIN ADMINS
const MAIN_ADMIN = [
	"100076339585458",
	"100000317130398"
];

module.exports = {
	config: {
		name: "admin",
		version: "4.0",
		author: "𝐍𝐓𝐊𝐡𝐚𝐧𝐠 ✦ 𝐌𝐨𝐝𝐢𝐟𝐢𝐞𝐝 𝐁𝐲 ♡—͟͞͞𝐓𝐀𝐌𝐈𝐌⸙",
		countDown: 5,
		role: 0,
		category: "System",
		shortDescription: "Manage Bot Admins",
		longDescription: "Add • Remove • List Admins",
		guide: {
			en:
				"{pn} add @user / uid\n" +
				"{pn} remove @user / uid\n" +
				"{pn} list"
		}
	},

	onStart: async function ({ message, args, usersData, event }) {
		const sub = args[0];

		// 🔐 SECURITY CHECK (Only Main Admin Can Add/Remove)
		if ((sub === "add" || sub === "remove") && !MAIN_ADMIN.includes(event.senderID)) {
			return message.reply("⛔ 𝐎𝐍𝐋𝐘 𝐌𝐀𝐈𝐍 𝐀𝐃𝐌𝐈𝐍 𝐂𝐀𝐍 𝐌𝐀𝐍𝐀𝐆𝐄!");
		}

		// ➕ ADD ADMIN
		if (sub === "add") {
			if (!args[1] && !event.messageReply && !Object.keys(event.mentions).length)
				return message.reply("⚠️ 𝐌𝐞𝐧𝐭𝐢𝐨𝐧 𝐎𝐫 𝐆𝐢𝐯𝐞 𝐔𝐈𝐃!");

			let uids = [];
			if (Object.keys(event.mentions).length)
				uids = Object.keys(event.mentions);
			else if (event.messageReply)
				uids = [event.messageReply.senderID];
			else
				uids = args.filter(id => !isNaN(id));

			const added = [];
			const already = [];

			for (const uid of uids) {
				if (config.adminBot.includes(uid))
					already.push(uid);
				else {
					config.adminBot.push(uid);
					added.push(uid);
				}
			}

			writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

			const addedText = await Promise.all(
				added.map(async uid => {
					const name = await usersData.getName(uid);
					return `• ${stylish(name)} (${stylish(uid)})`;
				})
			);

			return message.reply(
`👑 𝐀𝐃𝐌𝐈𝐍 𝐀𝐃𝐃𝐄𝐃
━━━━━━━━━━━━━━
${addedText.join("\n") || "𝐍𝐨 𝐍𝐞𝐰 𝐀𝐝𝐦𝐢𝐧"}`);
		}

		// ➖ REMOVE ADMIN
		if (sub === "remove") {
			if (!args[1] && !event.messageReply && !Object.keys(event.mentions).length)
				return message.reply("⚠️ 𝐌𝐞𝐧𝐭𝐢𝐨𝐧 𝐎𝐫 𝐆𝐢𝐯𝐞 𝐔𝐈𝐃!");

			let uids = [];
			if (Object.keys(event.mentions).length)
				uids = Object.keys(event.mentions);
			else if (event.messageReply)
				uids = [event.messageReply.senderID];
			else
				uids = args.filter(id => !isNaN(id));

			const removed = [];

			for (const uid of uids) {
				if (config.adminBot.includes(uid)) {
					config.adminBot.splice(config.adminBot.indexOf(uid), 1);
					removed.push(uid);
				}
			}

			writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

			const removedText = await Promise.all(
				removed.map(async uid => {
					const name = await usersData.getName(uid);
					return `• ${stylish(name)} (${stylish(uid)})`;
				})
			);

			return message.reply(
`🗑️ 𝐀𝐃𝐌𝐈𝐍 𝐑𝐄𝐌𝐎𝐕𝐄𝐃
━━━━━━━━━━━━━━
${removedText.join("\n") || "𝐍𝐨 𝐀𝐝𝐦𝐢𝐧 𝐑𝐞𝐦𝐨𝐯𝐞𝐝"}`);
		}

		// 📜 LIST ADMIN (Everyone Can See)
		if (sub === "list") {
			const list = await Promise.all(
				config.adminBot.map(async uid => {
					const name = await usersData.getName(uid);
					return `• ${stylish(name)} (${stylish(uid)})`;
				})
			);

			return message.reply(
`👑 𝐀𝐃𝐌𝐈𝐍 𝐋𝐈𝐒𝐓
━━━━━━━━━━━━━━
${list.join("\n") || "𝐍𝐨 𝐀𝐝𝐦𝐢𝐧 𝐅𝐨𝐮𝐧𝐝"}`);
		}

		return message.reply("⚙️ 𝐔𝐬𝐞: add / remove / list");
	}
};
