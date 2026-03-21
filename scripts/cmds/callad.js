const { getStreamsFromAttachment } = global.utils;

const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];
const ADMIN_THREAD_ID = "9551835831552936"; // Admin group ID

module.exports = {
	config: {
		name: "callad",
		version: "2.5",
		author: "—͟͞͞𝐓𝐀𝐌𝐈𝐌",
		countDown: 5,
		role: 0,
		category: "contacts admin",
		description: {
			vi: "Gửi báo cáo / góp ý / báo lỗi cho Admin",
			en: "Send report / feedback / bug to Admin"
		},
		guide: {
			vi: "{pn} <nội dung>",
			en: "{pn} <message>"
		}
	},

	langs: {
		vi: {
			missingMessage: "⚠️ | Vui lòng nhập nội dung cần gửi cho Admin!",
			sendByGroup: "\n👥 𝐆𝐫𝐨𝐮𝐩: %1\n🆔 𝐓𝐡𝐫𝐞𝐚𝐝 𝐈𝐃: %2",
			sendByUser: "\n👤 𝐒𝐨𝐮𝐫𝐜𝐞: Private Message",
			content: "\n\n📝 𝐍𝐎̣̂𝐈 𝐃𝐔𝐍𝐆:\n━━━━━━━━━━━━━━━━━━\n%1\n━━━━━━━━━━━━━━━━━━\n💬 Reply tin nhắn này để phản hồi",
			success: "✅ 𝐲𝐨𝐮𝐫 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐬𝐞𝐧𝐭 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐭𝐨 𝐚𝐝𝐦𝐢𝐧",
			failed: "❌ | Không thể gửi báo cáo. Vui lòng thử lại!",
			reply: "📨 𝐏𝐇𝐀̉𝐍 𝐇𝐎̂̀𝐈 𝐓𝐔̛̀ 𝐀𝐃𝐌𝐈𝐍 (%1)\n━━━━━━━━━━━━━━━━━━\n%2\n━━━━━━━━━━━━━━━━━━\n💬 Reply để tiếp tục trò chuyện",
			replySuccess: "✅ | Đã gửi phản hồi tới Admin!",
			feedback: "📩 𝐔𝐒𝐄𝐑 𝐅𝐄𝐄𝐃𝐁𝐀𝐂𝐊: %1\n🆔 𝐈𝐃: %2%3\n\n📝 𝐍𝐨̣̂𝐢 𝐝𝐮𝐧𝐠:\n━━━━━━━━━━━━━━━━━━\n%4\n━━━━━━━━━━━━━━━━━━\n💬 Reply để gửi lại cho người dùng",
			replyUserSuccess: "✅ | Đã gửi phản hồi cho người dùng!"
		},
		en: {
			missingMessage: "⚠️ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐬𝐞𝐧𝐝 𝐭𝐨 𝐀𝐝𝐦𝐢𝐧!",
			sendByGroup: "\n👥 𝐆𝐫𝐨𝐮𝐩: %1\n🆔 𝐓𝐡𝐫𝐞𝐚𝐝 𝐈𝐃: %2",
			sendByUser: "\n👤 𝐒𝐨𝐮𝐫𝐜𝐞: Private Message",
			content: "\n\n📝 𝐂𝐎𝐍𝐓𝐄𝐍𝐓:\n━━━━━━━━━━━━━━━━━━\n%1\n━━━━━━━━━━━━━━━━━━\n💬 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐫𝐞𝐬𝐩𝐨𝐧𝐝",
			success: "✅ 𝐲𝐨𝐮𝐫 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐬𝐞𝐧𝐭 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐭𝐨 𝐚𝐝𝐦𝐢𝐧",
			failed: "❌ | 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭ｏ 𝐬𝐞𝐧𝐝 𝐫𝐞𝐩𝐨𝐫𝐭!",
			reply: "📨 𝐑𝐄𝐏𝐋𝐘 𝐅𝐑𝐎𝐌 𝐀𝐃𝐌𝐈𝐍 (%1)\n━━━━━━━━━━━━━━━━━━\n%2\n━━━━━━━━━━━━━━━━━━\n💬 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐜𝐨𝐧𝐭𝐢𝐧𝐮𝐞 𝐜𝐡𝐚𝐭𝐭𝐢𝐧𝐠",
			replySuccess: "✅ | 𝐑𝐞𝐩𝐥𝐲 𝐬𝐞𝐧𝐭 𝐭𝐨 𝐀𝐝𝐦𝐢𝐧!",
			feedback: "📩 𝐔𝐒𝐄𝐑 𝐅𝐄𝐄𝐃𝐁𝐀𝐂𝐊: %1\n🆔 𝐔𝐬𝐞𝐫 𝐈𝐃: %2%3\n\n📝 𝐂𝐨𝐧𝐭𝐞𝐧𝐭:\n━━━━━━━━━━━━━━━━━━\n%4\n━━━━━━━━━━━━━━━━━━\n💬 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐮𝐬𝐞𝐫",
			replyUserSuccess: "✅ | 𝐑𝐞𝐩𝐥𝐲 𝐬𝐞𝐧𝐭 𝐭𝐨 𝐮𝐬𝐞𝐫!"
		}
	},

	onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
		if (!args[0]) return message.reply(getLang("missingMessage"));

		const { senderID, threadID, isGroup } = event;
		const senderName = await usersData.getName(senderID);
		const groupInfo = isGroup ? await threadsData.get(threadID) : {};

		const header =
			"╭───⟡ 𝐂𝐀𝐋𝐋 𝐀𝐃𝐌𝐈𝐍 ⟡───╮\n" +
			`👤 𝐔𝐬𝐞𝐫: ${senderName}\n` +
			`🆔 𝐈𝐃: ${senderID}` +
			(isGroup
				? getLang("sendByGroup", groupInfo.threadName, threadID)
				: getLang("sendByUser")) +
			"\n╰────────────────────╯";

		const formMessage = {
			body: header + getLang("content", args.join(" ")),
			mentions: [{ id: senderID, tag: senderName }],
			attachment: await getStreamsFromAttachment(
				[...event.attachments, ...(event.messageReply?.attachments || [])]
					.filter(item => mediaTypes.includes(item.type))
			)
		};

		try {
			const info = await api.sendMessage(formMessage, ADMIN_THREAD_ID);
			global.GoatBot.onReply.set(info.messageID, {
				commandName,
				messageID: info.messageID,
				threadID,
				messageIDSender: event.messageID,
				type: "userCallAdmin"
			});
			message.reply(getLang("success"));
		} catch (e) {
			console.error(e);
			message.reply(getLang("failed"));
		}
	},

	onReply: async ({ args, event, api, message, Reply, usersData, threadsData, commandName, getLang }) => {
		const { type, threadID, messageIDSender } = Reply;
		const senderName = await usersData.getName(event.senderID);
		const { isGroup } = event;

		const attachment = await getStreamsFromAttachment(
			event.attachments.filter(i => mediaTypes.includes(i.type))
		);

		switch (type) {
			case "userCallAdmin": {
				api.sendMessage(
					{
						body: getLang("reply", senderName, args.join(" ")),
						mentions: [{ id: event.senderID, tag: senderName }],
						attachment
					},
					threadID,
					(err, info) => {
						if (err) return message.reply(err.message);
						message.reply(getLang("replyUserSuccess"));
						global.GoatBot.onReply.set(info.messageID, {
							commandName,
							messageID: info.messageID,
							messageIDSender: event.messageID,
							threadID: event.threadID,
							type: "adminReply"
						});
					},
					messageIDSender
				);
				break;
			}

			case "adminReply": {
				let groupExtra = "";
				if (isGroup) {
					const t = await threadsData.get(event.threadID);
					groupExtra = getLang("sendByGroup", t.threadName, event.threadID);
				}

				api.sendMessage(
					{
						body: getLang("feedback", senderName, event.senderID, groupExtra, args.join(" ")),
						mentions: [{ id: event.senderID, tag: senderName }],
						attachment
					},
					ADMIN_THREAD_ID,
					(err, info) => {
						if (err) return message.reply(err.message);
						message.reply(getLang("replySuccess"));
						global.GoatBot.onReply.set(info.messageID, {
							commandName,
							messageID: info.messageID,
							messageIDSender: event.messageID,
							threadID: event.threadID,
							type: "userCallAdmin"
						});
					},
					messageIDSender
				);
				break;
			}
		}
	}
};
