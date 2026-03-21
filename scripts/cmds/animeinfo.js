const axios = require("axios");

module.exports = {
    config: {
        name: "animeinfo",
        aliases: ["inf", "ainfo"],
        version: "1.0.0",
        author: "𓆩𝐂.𝐄.𝐎⸙𝐓𝐀𝐌𝐈𝐌𓆪",
        countDown: 5,
        role: 0,
        description: "Provides info about any anime you type",
        category: "anime",
    },

    onStart: async function({ event, args, api }) {
        if (!args[0]) {
            return api.sendMessage("❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐲𝐩𝐞 𝐭𝐡𝐞 𝐧𝐚𝐦𝐞 𝐨𝐟 𝐭𝐡𝐞 𝐚𝐧𝐢𝐦𝐞.", event.threadID, event.messageID);
        }

        const animeName = args.join(" ");

        try {
            // AniList API call
            const response = await axios.post("https://graphql.anilist.co", {
                query: `
                    query ($search: String) {
                        Media(search: $search, type: ANIME) {
                            title {
                                romaji
                                english
                                native
                            }
                            description
                            episodes
                            duration
                            genres
                            averageScore
                            status
                            season
                            startDate { year month day }
                            coverImage { large }
                        }
                    }
                `,
                variables: {
                    search: animeName
                }
            });

            const anime = response.data.data.Media;

            const infoMessage = `
📌 𝐓𝐢𝐭𝐥𝐞 ${anime.title.romaji || anime.title.english || anime.title.native}
🎬 𝐄𝐩𝐢𝐬𝐨𝐝𝐞𝐬 ${anime.episodes || "Unknown"}
⏱️ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧 ${anime.duration ? anime.duration + " min" : "Unknown"}
📊 𝐒𝐜𝐨𝐫𝐞 ${anime.averageScore || "Unknown"}
📚 𝐆𝐞𝐧𝐫𝐞𝐬: ${anime.genres.join(", ")}
🗓️ 𝐒𝐞𝐚𝐬𝐨𝐧 ${anime.season || "Unknown"} (${anime.startDate.year || "?"})
📖 𝐒𝐭𝐚𝐭𝐮𝐬 ${anime.status || "Unknown"}
📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧 ${anime.description ? anime.description.replace(/<[^>]*>/g, "") : "No description available."}
`;

            // If cover image available, send with image
            if (anime.coverImage && anime.coverImage.large) {
                return api.sendMessage({ body: infoMessage, attachment: await global.utils.getStreamFromURL(anime.coverImage.large) }, event.threadID, event.messageID);
            } else {
                return api.sendMessage(infoMessage, event.threadID, event.messageID);
            }

        } catch (err) {
            console.log(err);
            return api.sendMessage("❌ 𝑆𝑜𝑚𝑒𝑡ℎ𝑖𝑛𝑔 𝑤𝑒𝑛𝑡 𝑤𝑟𝑜𝑛𝑔. 𝑃𝑙𝑒𝑎𝑠𝑒 𝑡𝑟𝑦 𝑎𝑔𝑎𝑖𝑛.", event.threadID, event.messageID);
        }
    }
};
