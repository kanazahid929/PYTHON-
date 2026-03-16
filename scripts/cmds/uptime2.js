const os = require("os");

module.exports = {
  config: {
    name: "uptime2",
    aliases: ["upt2", "stats", "up2"],
    version: "7.1",
    author: "—͟͞͞𝐒𝐀𝐈𝐅",
    role: 0,
    category: "utility",
    shortDescription: {
      en: "Elite System Diagnostics"
    },
    guide: {
      en: "{p}uptime2"
    }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      const pingStart = Date.now();
      api.setMessageReaction("☄️", event.messageID, () => {}, true);

      const makeBar = (percent) => {
        const filled = Math.floor(percent / 10);
        const empty = 10 - filled;
        return "▬▬".repeat(filled) + "▭▭".repeat(empty);
      };

      const makeFrame = (percent, icon) => {
        return `✨ 𝐒𝐲𝐬𝐭𝐞𝐦 𝐀𝐧𝐚𝐥𝐲𝐳𝐢𝐧𝐠... ${icon}\n\n` +
               `┏━━━━━━━━━━━━━━━━━━━━┓\n` +
               `   ${makeBar(percent)} ${percent}%\n` +
               `┗━━━━━━━━━━━━━━━━━━━━┛\n` +
               `𝐏𝐥𝐞𝐚𝐬𝐞 𝐖𝐚𝐢𝐭 𝐀 𝐌𝐨𝐦𝐞𝐧𝐭...`;
      };

      const icons = ["☄️", "🪐", "🎀", "💫"];
      const steps = [15, 45, 75, 100];

      // Baby, here is where we use event.messageID to ensure it replies to the sender
      const loadingMsg = await api.sendMessage(makeFrame(0, "📡"), event.threadID, event.messageID);

      for (let i = 0; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 500));
        await api.editMessage(makeFrame(steps[i], icons[i]), loadingMsg.messageID);
      }

      const allUsers = await usersData.getAll();
      const rawThreads = await threadsData.getAll();
      const groups = rawThreads.filter(t => t.isGroup);
      const activeGroups = groups.filter(t => t.memberCount > 1);

      const ping = Date.now() - pingStart;

      const totalSeconds = Math.floor(process.uptime());
      const d = Math.floor(totalSeconds / 86400);
      const h = Math.floor((totalSeconds % 86400) / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const freeRam = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
      const usedRam = (totalRam - freeRam).toFixed(2);
      const ramPercent = ((usedRam / totalRam) * 100).toFixed(1);

      const cpus = os.cpus();
      const cpuModel = cpus[0]?.model?.trim() || "Unknown CPU";
      const cpuCores = cpus.length;
      const cpuSpeed = (cpus[0]?.speed / 1000).toFixed(2);

      const cpuUsage = process.cpuUsage();
      const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1e6 / process.uptime() * 100).toFixed(1);

      const memUsage = process.memoryUsage();
      const heapUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
      const heapTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(2);
      const rss = (memUsage.rss / 1024 / 1024).toFixed(2);
      const external = (memUsage.external / 1024 / 1024).toFixed(2);

      const platform = os.platform();
      const osType = os.type();
      const osRelease = os.release();
      const arch = os.arch();
      const hostname = os.hostname();
      const nodeVersion = process.version;

      const loadAvg = os.loadavg().map(v => v.toFixed(2));

      const nets = os.networkInterfaces();
      let ipAddress = "N/A";
      for (const iface of Object.values(nets)) {
        for (const addr of iface) {
          if (addr.family === "IPv4" && !addr.internal) {
            ipAddress = addr.address;
            break;
          }
        }
        if (ipAddress !== "N/A") break;
      }

      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
      const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "2-digit", year: "numeric" });
      const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

      const finalStats =
        `👑 ━━ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐒𝐈𝐆𝐇𝐓 ━━ 👑\n\n` +
        `╔══ ⏱ 𝐔𝐏𝐓𝐈𝐌𝐄 & 𝐓𝐈𝐌𝐄 ══╗\n` +
        `⏳ 𝐔𝐩𝐭𝐢𝐦𝐞    : ${d}𝐃 ${h}𝐇 ${m}𝐌 ${s}𝐒\n` +
        `📡 𝐏𝐢𝐧𝐠      : ${ping}𝐦𝐬\n` +
        `📅 𝐃𝐚𝐭𝐞      : ${dateStr}\n` +
        `⏰ 𝐓𝐢𝐦𝐞      : ${timeStr}\n\n` +
        `╔══ 🧠 𝐌𝐄𝐌𝐎𝐑𝐘 ══╗\n` +
        `🔋 𝐑𝐀𝐌        : ${usedRam}𝐆𝐁 / ${totalRam}𝐆𝐁 (${ramPercent}%)\n` +
        `🟢 𝐅𝐫𝐞𝐞 𝐑𝐀𝐌  : ${freeRam}𝐆𝐁\n` +
        `📦 𝐇𝐞𝐚𝐩 𝐔𝐬𝐞𝐝 : ${heapUsed}𝐌𝐁 / ${heapTotal}𝐌𝐁\n` +
        `💾 𝐑𝐒𝐒        : ${rss}𝐌𝐁\n` +
        `🔌 𝐄𝐱𝐭𝐞𝐫𝐧𝐚𝐥  : ${external}𝐌𝐁\n\n` +
        `╔══ ⚙️ 𝐂𝐏𝐔 ══╗\n` +
        `🖥 𝐌𝐨𝐝𝐞𝐥     : ${cpuModel}\n` +
        `🔢 𝐂𝐨𝐫𝐞𝐬     : ${cpuCores} 𝐂𝐨𝐫𝐞𝐬 @ ${cpuSpeed}𝐆𝐇𝐳\n` +
        `📊 𝐂𝐏𝐔 𝐔𝐬𝐚𝐠𝐞 : ${cpuPercent}%\n` +
        `📈 𝐋𝐨𝐚𝐝 𝐀𝐯𝐠  : ${loadAvg[0]} | ${loadAvg[1]} | ${loadAvg[2]}\n\n` +
        `╔══ 🖥 𝐎𝐒 & 𝐑𝐔𝐍𝐓𝐈𝐌𝐄 ══╗\n` +
        `🐧 𝐎𝐒         : ${osType} ${osRelease}\n` +
        `🔧 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦  : ${platform} (${arch})\n` +
        `🏠 𝐇𝐨𝐬𝐭𝐧𝐚𝐦𝐞  : ${hostname}\n` +
        `🌐 𝐈𝐏         : ${ipAddress}\n` +
        `💚 𝐍𝐨𝐝𝐞.𝐣𝐬   : ${nodeVersion}\n\n` +
        `╔══ 👥 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐒 ══╗\n` +
        `👥 𝐓𝐨𝐭𝐚𝐥 𝐔𝐬𝐞𝐫𝐬   : ${allUsers.length} 𝐔𝐬𝐞𝐫𝐬\n` +
        `💬 𝐓𝐨𝐭𝐚𝐥 𝐆𝐫𝐨𝐮𝐩𝐬  : ${groups.length} 𝐆𝐫𝐨𝐮𝐩𝐬\n` +
        `✅ 𝐀𝐜𝐭𝐢𝐯𝐞 𝐆𝐫𝐨𝐮𝐩𝐬 : ${activeGroups.length} 𝐆𝐫𝐨𝐮𝐩𝐬\n\n` +
        `👤 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 : —͟͞͞𝐒𝐀𝐈𝐅\n` +
        `━━━━━━━━━━━━━━━━━━━━━━`;

      await new Promise(r => setTimeout(r, 400));
      await api.editMessage(finalStats, loadingMsg.messageID);
      api.setMessageReaction("🎀", event.messageID, () => {}, true);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ 𝐄𝐫𝐫𝐨𝐫: 𝐒𝐲𝐬𝐭𝐞𝐦 𝐑𝐞𝐭𝐫𝐢𝐞𝐯𝐚𝐥 𝐅𝐚𝐢𝐥𝐞𝐝!", event.threadID, event.messageID);
    }
  }
};