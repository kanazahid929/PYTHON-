const axios = require("axios");

module.exports = {
  config: {
    name: "github",
    aliases: ["gitinfo", "gh"],
    version: "3.0",
    author: "Tamim × GPT-5",
    countDown: 5,
    role: 0,
    shortDescription: "GitHub profile information",
    longDescription: "Fetch detailed GitHub user information with avatar preview",
    category: "tools",
    guide: "{p}github <username>"
  },

  onStart: async function ({ message, args }) {
    const username = args[0];

    if (!username)
      return message.reply("⚠️ Please provide a GitHub username.\nExample: github torvalds");

    try {
      const res = await axios.get(`https://api.github.com/users/${username}`, {
        headers: { "User-Agent": "request" }
      });

      const d = res.data;

      const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });

      const msg = `
╭━━━〔 𝗚𝗜𝗧𝗛𝗨𝗕 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 〕━━━╮
┃ 👤 Name: ${d.name || "Not available"}
┃ 💻 Username: ${d.login}
┃ 📦 Public Repos: ${d.public_repos}
┃ 👥 Followers: ${d.followers}
┃ ➕ Following: ${d.following}
┃ 🌍 Location: ${d.location || "Not specified"}
┃ 🏢 Company: ${d.company || "Not specified"}
┃ 📝 Bio: ${d.bio || "No bio provided"}
┃ 📅 Created: ${formatDate(d.created_at)}
┃ 🔄 Updated: ${formatDate(d.updated_at)}
┃ 🔗 Profile: ${d.html_url}
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

      await message.reply({
        body: msg.trim(),
        attachment: await global.utils.getStreamFromURL(d.avatar_url)
      });

    } catch (err) {
      if (err.response && err.response.status === 404) {
        return message.reply("❌ User not found. Please check the username.");
      }

      return message.reply("⚠️ Unable to fetch data from GitHub. Try again later.");
    }
  }
};
