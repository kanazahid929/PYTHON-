/**
 * ╔══════════════════════════════════════════════════════╗
 * ║              🐐  𝐂𝐌𝐃  —  𝐆𝐨𝐚𝐭𝐁𝐨𝐭 𝐂𝐨𝐦𝐦𝐚𝐧𝐝             ║
 * ║         𝐋𝐨𝐚𝐝 · 𝐔𝐧𝐥𝐨𝐚𝐝 · 𝐈𝐧𝐬𝐭𝐚𝐥𝐥 · 𝐑𝐞𝐥𝐨𝐚𝐝 𝐀𝐥𝐥         ║
 * ╠══════════════════════════════════════════════════════╣
 * ║  Author   :  ♡—͟͞͞ᴛꫝ֟፝ؖ۬ᴍɪᴍ ⸙                          ║
 * ║  𝐕𝐞𝐫𝐬𝐢𝐨𝐧  :  𝟏.𝟏𝟕                                    ║
 * ║  𝐑𝐨𝐥𝐞     :  𝐎𝐰𝐧𝐞𝐫 (𝟐)                               ║
 * ╚══════════════════════════════════════════════════════╝
 */

"use strict";

const axios    = require("axios");
const { execSync } = require("child_process");
const fs       = require("fs-extra");
const path     = require("path");
const cheerio  = require("cheerio");

const { client }                      = global;
const { configCommands }              = global.GoatBot;
const { log, loading, removeHomeDir } = global.utils;

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

/** Extract the hostname from any URL string. */
const getDomain = (url) => {
  const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im);
  return match?.[1] ?? null;
};

/** Returns true if the string is a valid URL. */
const isURL = (str) => {
  try { new URL(str); return true; }
  catch { return false; }
};

// ─────────────────────────────────────────────
//  Module export
// ─────────────────────────────────────────────

module.exports = {

  // ── Config ──────────────────────────────────
  config: {
    name:      "cmd",
    version:   "1.17",
    author:    "♡—͟͞͞ᴛꫝ֟፝ؖ۬ᴍɪᴍ ⸙",
    countDown: 5,
    role:      2,
    description: {
      vi: "Quản lý các tệp lệnh của bạn",
      en: "Manage your command files",
    },
    category: "owner",
    guide: {
      vi:
        "   {pn} load <tên file lệnh>\n" +
        "   {pn} loadAll\n" +
        "   {pn} install <url> <tên file lệnh>: Tải xuống và cài đặt một tệp lệnh từ url (raw)\n" +
        "   {pn} install <tên file lệnh> <code>: Cài đặt lệnh từ code trực tiếp",
      en:
        "   {pn} load <command file name>\n" +
        "   {pn} loadAll\n" +
        "   {pn} install <url> <command file name>: Download & install from a raw URL\n" +
        "   {pn} install <command file name> <code>: Install from inline code",
    },
  },

  // ── Language strings ─────────────────────────
  langs: {
    vi: {
      missingFileName:        "⚠️ | 𝐕𝐮𝐢 𝐥ò𝐧𝐠 𝐧𝐡ậ𝐩 𝐯à𝐨 𝐭ê𝐧 𝐥ệ𝐧𝐡 𝐛ạ𝐧 𝐦𝐮ố𝐧 𝐫𝐞𝐥𝐨𝐚𝐝",
      loaded:                 "✅ | Đã 𝐥𝐨𝐚𝐝 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 \"%1\" 𝐭𝐡à𝐧𝐡 𝐜ô𝐧𝐠",
      loadedError:            "❌ | 𝐋𝐨𝐚𝐝 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 \"%1\" 𝐭𝐡ấ𝐭 𝐛ạ𝐢 𝐯ớ𝐢 𝐥ỗ𝐢\𝐧%2: %3",
      loadedSuccess:          "✅ | Đã 𝐥𝐨𝐚𝐝 𝐭𝐡à𝐧𝐡 𝐜ô𝐧𝐠 (%1) 𝐜𝐨𝐦𝐦𝐚𝐧𝐝",
      loadedFail:             "❌ | 𝐋𝐨𝐚𝐝 𝐭𝐡ấ𝐭 𝐛ạ𝐢 (%1) 𝐜𝐨𝐦𝐦𝐚𝐧𝐝\𝐧%2",
      openConsoleToSeeError:  "👀 | 𝐇ã𝐲 𝐦ở 𝐜𝐨𝐧𝐬𝐨𝐥𝐞 để 𝐱𝐞𝐦 𝐜𝐡𝐢 𝐭𝐢ế𝐭 𝐥ỗ𝐢",
      missingCommandNameUnload: "⚠️ | 𝐕𝐮𝐢 𝐥ò𝐧𝐠 𝐧𝐡ậ𝐩 𝐯à𝐨 𝐭ê𝐧 𝐥ệ𝐧𝐡 𝐛ạ𝐧 𝐦𝐮ố𝐧 𝐮𝐧𝐥𝐨𝐚𝐝",
      unloaded:               "✅ | Đã 𝐮𝐧𝐥𝐨𝐚𝐝 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 \"%1\" 𝐭𝐡à𝐧𝐡 𝐜ô𝐧𝐠",
      unloadedError:          "❌ | 𝐔𝐧𝐥𝐨𝐚𝐝 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 \"%1\" 𝐭𝐡ấ𝐭 𝐛ạ𝐢 𝐯ớ𝐢 𝐥ỗ𝐢\𝐧%2: %3",
      missingUrlCodeOrFileName: "⚠️ | 𝐕𝐮𝐢 𝐥ò𝐧𝐠 𝐧𝐡ậ𝐩 𝐯à𝐨 𝐮𝐫𝐥 𝐡𝐨ặ𝐜 𝐜𝐨𝐝𝐞 𝐯à 𝐭ê𝐧 𝐟𝐢𝐥𝐞 𝐥ệ𝐧𝐡 𝐛ạ𝐧 𝐦𝐮ố𝐧 𝐜à𝐢 đặ𝐭",
      missingUrlOrCode:       "⚠️ | 𝐕𝐮𝐢 𝐥ò𝐧𝐠 𝐧𝐡ậ𝐩 𝐯à𝐨 𝐮𝐫𝐥 𝐡𝐨ặ𝐜 𝐜𝐨𝐝𝐞 𝐜ủ𝐚 𝐭ệ𝐩 𝐥ệ𝐧𝐡 𝐛ạ𝐧 𝐦𝐮ố𝐧 𝐜à𝐢 đặ𝐭",
      missingFileNameInstall: "⚠️ | 𝐕𝐮𝐢 𝐥ò𝐧𝐠 𝐧𝐡ậ𝐩 𝐯à𝐨 𝐭ê𝐧 𝐟𝐢𝐥𝐞 để 𝐥ư𝐮 𝐥ệ𝐧𝐡 (đ𝐮ô𝐢 .𝐣𝐬)",
      invalidUrl:             "⚠️ | 𝐕𝐮𝐢 𝐥ò𝐧𝐠 𝐧𝐡ậ𝐩 𝐯à𝐨 𝐮𝐫𝐥 𝐡ợ𝐩 𝐥ệ",
      invalidUrlOrCode:       "⚠️ | 𝐊𝐡ô𝐧𝐠 𝐭𝐡ể 𝐥ấ𝐲 đượ𝐜 𝐦ã 𝐥ệ𝐧𝐡",
      alreadExist:            "⚠️ | 𝐅𝐢𝐥𝐞 𝐥ệ𝐧𝐡 đã 𝐭ồ𝐧 𝐭ạ𝐢, 𝐛ạ𝐧 𝐜ó 𝐜𝐡ắ𝐜 𝐜𝐡ắ𝐧 𝐦𝐮ố𝐧 𝐠𝐡𝐢 đè?\𝐧𝐓𝐡ả 𝐜ả𝐦 𝐱ú𝐜 𝐛ấ𝐭 𝐤ì 𝐯à𝐨 𝐭𝐢𝐧 𝐧𝐡ắ𝐧 𝐧à𝐲 để 𝐭𝐢ế𝐩 𝐭ụ𝐜",
      installed:              "✅ | Đã 𝐜à𝐢 đặ𝐭 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 \"%1\" 𝐭𝐡à𝐧𝐡 𝐜ô𝐧𝐠, 𝐟𝐢𝐥𝐞 đượ𝐜 𝐥ư𝐮 𝐭ạ𝐢 %2",
      installedError:         "❌ | 𝐂à𝐢 đặ𝐭 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 \"%1\" 𝐭𝐡ấ𝐭 𝐛ạ𝐢 𝐯ớ𝐢 𝐥ỗ𝐢\𝐧%2: %3",
      missingFile:            "⚠️ | 𝐊𝐡ô𝐧𝐠 𝐭ì𝐦 𝐭𝐡ấ𝐲 𝐭ệ𝐩 𝐥ệ𝐧𝐡 \"%1\"",
      invalidFileName:        "⚠️ | 𝐓ê𝐧 𝐭ệ𝐩 𝐥ệ𝐧𝐡 𝐤𝐡ô𝐧𝐠 𝐡ợ𝐩 𝐥ệ",
      unloadedFile:           "✅ | Đã 𝐮𝐧𝐥𝐨𝐚𝐝 𝐥ệ𝐧𝐡 \"%1\"",
    },
    en: {
      missingFileName:        "⚠️ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐭𝐡𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐧𝐚𝐦𝐞 𝐲𝐨𝐮 𝐰𝐚𝐧𝐭 𝐭𝐨 𝐫𝐞𝐥𝐨𝐚𝐝",
      loaded:                 "✅ | 𝐋𝐨𝐚𝐝𝐞𝐝 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 \"%1\" 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲",
      loadedError:            "❌ | 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐥𝐨𝐚𝐝 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 \"%1\" 𝐰𝐢𝐭𝐡 𝐞𝐫𝐫𝐨𝐫\𝐧%2: %3",
      loadedSuccess:          "✅ | 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐥𝐨𝐚𝐝𝐞𝐝 (%1) 𝐜𝐨𝐦𝐦𝐚𝐧𝐝(𝐬)",
      loadedFail:             "❌ | 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐥𝐨𝐚𝐝 (%1) 𝐜𝐨𝐦𝐦𝐚𝐧𝐝(𝐬)\𝐧%2",
      openConsoleToSeeError:  "👀 | 𝐎𝐩𝐞𝐧 𝐜𝐨𝐧𝐬𝐨𝐥𝐞 𝐟𝐨𝐫 𝐟𝐮𝐥𝐥 𝐞𝐫𝐫𝐨𝐫 𝐝𝐞𝐭𝐚𝐢𝐥𝐬",
      missingCommandNameUnload: "⚠️ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐭𝐡𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐧𝐚𝐦𝐞 𝐲𝐨𝐮 𝐰𝐚𝐧𝐭 𝐭𝐨 𝐮𝐧𝐥𝐨𝐚𝐝",
      unloaded:               "✅ | 𝐔𝐧𝐥𝐨𝐚𝐝𝐞𝐝 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 \"%1\" 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲",
      unloadedError:          "❌ | 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐮𝐧𝐥𝐨𝐚𝐝 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 \"%1\" 𝐰𝐢𝐭𝐡 𝐞𝐫𝐫𝐨𝐫\𝐧%2: %3",
      missingUrlCodeOrFileName: "⚠️ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐭𝐡𝐞 𝐔𝐑𝐋 𝐨𝐫 𝐜𝐨𝐝𝐞 𝐚𝐧𝐝 𝐭𝐡𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐟𝐢𝐥𝐞 𝐧𝐚𝐦𝐞",
      missingUrlOrCode:       "⚠️ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐭𝐡𝐞 𝐔𝐑𝐋 𝐨𝐫 𝐜𝐨𝐝𝐞 𝐨𝐟 𝐭𝐡𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐟𝐢𝐥𝐞",
      missingFileNameInstall: "⚠️ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐭𝐡𝐞 𝐟𝐢𝐥𝐞 𝐧𝐚𝐦𝐞 𝐭𝐨 𝐬𝐚𝐯𝐞 𝐭𝐡𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 (𝐰𝐢𝐭𝐡 .𝐣𝐬 𝐞𝐱𝐭𝐞𝐧𝐬𝐢𝐨𝐧)",
      invalidUrl:             "⚠️ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐔𝐑𝐋",
      invalidUrlOrCode:       "⚠️ | 𝐔𝐧𝐚𝐛𝐥𝐞 𝐭𝐨 𝐫𝐞𝐭𝐫𝐢𝐞𝐯𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐜𝐨𝐝𝐞",
      alreadExist:            "⚠️ | 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐟𝐢𝐥𝐞 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐞𝐱𝐢𝐬𝐭𝐬. 𝐀𝐫𝐞 𝐲𝐨𝐮 𝐬𝐮𝐫𝐞 𝐲𝐨𝐮 𝐰𝐚𝐧𝐭 𝐭𝐨 𝐨𝐯𝐞𝐫𝐰𝐫𝐢𝐭𝐞 𝐢𝐭?\𝐧𝐑𝐞𝐚𝐜𝐭 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐜𝐨𝐧𝐭𝐢𝐧𝐮𝐞",
      installed:              "✅ | 𝐈𝐧𝐬𝐭𝐚𝐥𝐥𝐞𝐝 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 \"%1\" 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 — 𝐬𝐚𝐯𝐞𝐝 𝐚𝐭 %2",
      installedError:         "❌ | 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐢𝐧𝐬𝐭𝐚𝐥𝐥 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 \"%1\" 𝐰𝐢𝐭𝐡 𝐞𝐫𝐫𝐨𝐫\𝐧%2: %3",
      missingFile:            "⚠️ | 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐟𝐢𝐥𝐞 \"%1\" 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝",
      invalidFileName:        "⚠️ | 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐟𝐢𝐥𝐞 𝐧𝐚𝐦𝐞",
      unloadedFile:           "✅ | 𝐔𝐧𝐥𝐨𝐚𝐝𝐞𝐝 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 \"%1\"",
    },
  },

  // ── onStart ──────────────────────────────────
  onStart: async ({
    args, message, api,
    threadModel, userModel, dashBoardModel, globalModel,
    threadsData, usersData, dashBoardData, globalData,
    event, commandName, getLang,
  }) => {

    const { loadScripts, unloadScripts } = global.utils;
    const subCmd = args[0]?.toLowerCase();

    // ── load <fileName> ──────────────────────
    if (subCmd === "load" && args.length === 2) {
      if (!args[1]) return message.reply(getLang("missingFileName"));

      const result = loadScripts(
        "cmds", args[1], log, configCommands, api,
        threadModel, userModel, dashBoardModel, globalModel,
        threadsData, usersData, dashBoardData, globalData, getLang,
      );

      if (result.status === "success") {
        message.reply(getLang("loaded", result.name));
      } else {
        message.reply(
          getLang("loadedError", result.name, result.error.name, result.error.message)
          + "\n" + result.error.stack,
        );
        console.log(result.errorWithThoutRemoveHomeDir);
      }
    }

    // ── loadAll  |  load <f1> <f2> … ────────
    else if (subCmd === "loadall" || (subCmd === "load" && args.length > 2)) {
      const filesToLoad = subCmd === "loadall"
        ? fs.readdirSync(__dirname)
            .filter(f =>
              f.endsWith(".js") &&
              !f.match(/(eg)\.js$/g) &&
              (process.env.NODE_ENV === "development" || !f.match(/(dev)\.js$/g)) &&
              !configCommands.commandUnload?.includes(f),
            )
            .map(f => f.split(".")[0])
        : args.slice(1);

      const successes = [];
      const failures  = [];

      for (const name of filesToLoad) {
        const result = loadScripts(
          "cmds", name, log, configCommands, api,
          threadModel, userModel, dashBoardModel, globalModel,
          threadsData, usersData, dashBoardData, globalData, getLang,
        );
        result.status === "success"
          ? successes.push(name)
          : failures.push(`  ❗ ${name} → ${result.error.name}: ${result.error.message}`);
      }

      const parts = [];
      if (successes.length) parts.push(getLang("loadedSuccess", successes.length));
      if (failures.length)  parts.push(
        getLang("loadedFail", failures.length, failures.join("\n"))
        + "\n" + getLang("openConsoleToSeeError"),
      );

      message.reply(parts.join("\n"));
    }

    // ── unload <fileName> ────────────────────
    else if (subCmd === "unload") {
      if (!args[1]) return message.reply(getLang("missingCommandNameUnload"));

      const result = unloadScripts("cmds", args[1], configCommands, getLang);
      message.reply(
        result.status === "success"
          ? getLang("unloaded", result.name)
          : getLang("unloadedError", result.name, result.error.name, result.error.message),
      );
    }

    // ── install <url|code> <fileName> ────────
    else if (subCmd === "install") {
      let url      = args[1];
      let fileName = args[2];
      let rawCode;

      if (!url || !fileName)
        return message.reply(getLang("missingUrlCodeOrFileName"));

      // Swap if user passed fileName before URL
      if (url.endsWith(".js") && !isURL(url)) {
        [url, fileName] = [fileName, url];
      }

      // ── Source: remote URL ────────────────
      if (/https?:\/\/(?:www\.|(?!www))/.test(url)) {
        global.utils.log.dev("install", "url", url);

        if (!fileName?.endsWith(".js"))
          return message.reply(getLang("missingFileNameInstall"));

        const domain = getDomain(url);
        if (!domain) return message.reply(getLang("invalidUrl"));

        // Normalise paste-site URLs to raw endpoints
        if (domain === "pastebin.com") {
          url = url
            .replace(/https:\/\/pastebin\.com\/(?!raw\/)(.*?)\/?\s*$/, "https://pastebin.com/raw/$1")
            .replace(/\/$/, "");
        } else if (domain === "github.com") {
          url = url.replace(
            /https:\/\/github\.com\/(.*)\/blob\/(.*)/,
            "https://raw.githubusercontent.com/$1/$2",
          );
        }

        rawCode = (await axios.get(url)).data;

        if (domain === "savetext.net") {
          const $ = cheerio.load(rawCode);
          rawCode  = $("#content").text();
        }
      }

      // ── Source: inline code ───────────────
      else {
        global.utils.log.dev("install", "code", args.slice(1).join(" "));

        if (args[args.length - 1].endsWith(".js")) {
          fileName = args[args.length - 1];
          rawCode  = event.body.slice(
            event.body.indexOf("install") + 7,
            event.body.indexOf(fileName) - 1,
          );
        } else if (args[1].endsWith(".js")) {
          fileName = args[1];
          rawCode  = event.body.slice(event.body.indexOf(fileName) + fileName.length + 1);
        } else {
          return message.reply(getLang("missingFileNameInstall"));
        }
      }

      if (!rawCode) return message.reply(getLang("invalidUrlOrCode"));

      // File already exists → ask for confirmation
      if (fs.existsSync(path.join(__dirname, fileName))) {
        return message.reply(getLang("alreadExist"), (err, info) => {
          global.GoatBot.onReaction.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            type:      "install",
            author:    event.senderID,
            data:      { fileName, rawCode },
          });
        });
      }

      // Write & load
      const result = loadScripts(
        "cmds", fileName, log, configCommands, api,
        threadModel, userModel, dashBoardModel, globalModel,
        threadsData, usersData, dashBoardData, globalData, getLang, rawCode,
      );

      message.reply(
        result.status === "success"
          ? getLang("installed", result.name, path.join(__dirname, fileName).replace(process.cwd(), ""))
          : getLang("installedError", result.name, result.error.name, result.error.message),
      );
    }

    else {
      message.SyntaxError();
    }
  },

  // ── onReaction ───────────────────────────────
  onReaction: async ({
    Reaction, message, event, api,
    threadModel, userModel, dashBoardModel, globalModel,
    threadsData, usersData, dashBoardData, globalData, getLang,
  }) => {
    const { loadScripts } = global.utils;
    const { author, data: { fileName, rawCode } } = Reaction;

    if (event.userID !== author) return;

    const result = loadScripts(
      "cmds", fileName, log, configCommands, api,
      threadModel, userModel, dashBoardModel, globalModel,
      threadsData, usersData, dashBoardData, globalData, getLang, rawCode,
    );

    message.reply(
      result.status === "success"
        ? getLang("installed", result.name, path.join(__dirname, fileName).replace(process.cwd(), ""))
        : getLang("installedError", result.name, result.error.name, result.error.message),
    );
  },
};

// ═══════════════════════════════════════════════
//  ⚠  Internal utilities — do not obfuscate
// ═══════════════════════════════════════════════

const packageAlready = [];
const SPINNER        = "\\|/-";
let   spinnerCount   = 0;

/**
 * Load (or hot-reload) a script from the given folder.
 * Optionally writes `rawCode` to disk before loading.
 *
 * @param {"cmds"|"events"} folder
 * @param {string}  fileName     - without .js extension
 * @param {*}       log
 * @param {object}  configCommands
 * @param {*}       api
 * @param {...*}    models       - threadModel, userModel, dashBoardModel, globalModel
 * @param {*}       threadsData
 * @param {*}       usersData
 * @param {*}       dashBoardData
 * @param {*}       globalData
 * @param {Function} getLang
 * @param {string}  [rawCode]   - if provided, written to disk first
 * @returns {{ status: "success"|"failed", name: string, command?: object, error?: Error }}
 */
function loadScripts(
  folder, fileName, log, configCommands, api,
  threadModel, userModel, dashBoardModel, globalModel,
  threadsData, usersData, dashBoardData, globalData,
  getLang, rawCode,
) {
  const storageCommandFilesPath = global.GoatBot[
    folder === "cmds" ? "commandFilesPath" : "eventCommandsFilesPath"
  ];

  try {
    // ── Write raw code to disk if provided ───
    if (rawCode) {
      fileName = fileName.replace(/\.js$/, "");
      fs.writeFileSync(
        path.normalize(`${process.cwd()}/scripts/${folder}/${fileName}.js`),
        rawCode,
      );
    }

    const { GoatBot } = global;
    const { onFirstChat: allOnFirstChat, onChat: allOnChat, onEvent: allOnEvent, onAnyEvent: allOnAnyEvent } = GoatBot;

    // ── Resolve folder-specific identifiers ──
    const folderMeta = {
      cmds:   { typeEnvCommand: "envCommands",  setMap: "commands",      commandType: "command" },
      events: { typeEnvCommand: "envEvents",    setMap: "eventCommands", commandType: "event command" },
    };
    const { typeEnvCommand, setMap, commandType } = folderMeta[folder];

    // ── Resolve file path (dev / prod) ───────
    const basePath   = `${process.cwd()}/scripts/${folder}/${fileName}`;
    const devPath    = path.normalize(`${basePath}.dev.js`);
    const prodPath   = path.normalize(`${basePath}.js`);
    const pathCommand =
      process.env.NODE_ENV === "development" && fs.existsSync(devPath) ? devPath : prodPath;

    // ── Auto-install missing npm packages ────
    const REQUIRE_REGEX = /require\s*\(\s*[`'"]([^`'"]+)[`'"]\s*\)/g;
    const fileContent   = fs.readFileSync(pathCommand, "utf8");
    const rawPackages   = [...fileContent.matchAll(REQUIRE_REGEX)].map(m => m[1]);

    const externalPackages = rawPackages
      .filter(p => !p.startsWith("/") && !p.startsWith("./") && !p.startsWith("../") && !p.startsWith(__dirname))
      .map(p => p.startsWith("@") ? p.split("/").slice(0, 2).join("/") : p.split("/")[0]);

    for (const packageName of externalPackages) {
      if (packageAlready.includes(packageName)) continue;
      packageAlready.push(packageName);

      if (!fs.existsSync(`${process.cwd()}/node_modules/${packageName}`)) {
        let spinner;
        try {
          spinner = setInterval(() => {
            spinnerCount++;
            loading.info("PACKAGE", `Installing ${packageName} ${SPINNER[spinnerCount % SPINNER.length]}`);
          }, 80);
          execSync(`npm install ${packageName} --save`, { stdio: "pipe" });
          clearInterval(spinner);
          process.stderr.clearLine();
        } catch (err) {
          clearInterval(spinner);
          process.stderr.clearLine();
          throw new Error(`Can't install package ${packageName}`);
        }
      }
    }

    // ── Cache-bust & reload old command ──────
    const oldCommand     = require(pathCommand);
    const oldCommandName = oldCommand?.config?.name;

    if (!oldCommandName) {
      const existingLocation = GoatBot[setMap].get(oldCommandName)?.location;
      if (existingLocation !== pathCommand)
        throw new Error(
          `${commandType} name "${oldCommandName}" already exists in "${removeHomeDir(existingLocation || "")}"`,
        );
    }

    // Remove old aliases
    if (oldCommand.config?.aliases) {
      const oldAliases = [].concat(oldCommand.config.aliases);
      for (const alias of oldAliases) GoatBot.aliases.delete(alias);
    }

    delete require.cache[require.resolve(pathCommand)];

    // ── Load fresh command ────────────────────
    const command       = require(pathCommand);
    command.location    = pathCommand;
    const configCommand = command.config;

    if (!configCommand || typeof configCommand !== "object")
      throw new Error("config of command must be an object");

    const scriptName = configCommand.name;
    if (!scriptName) throw new Error("Name of command is missing!");
    if (!command.onStart) throw new Error("Function onStart is missing!");
    if (typeof command.onStart !== "function") throw new Error("Function onStart must be a function!");

    // ── Sync onChat / onEvent / onAnyEvent lists ──
    const spliceIfFound = (arr, target) => {
      const idx = arr.findIndex(item => item === target);
      if (idx !== -1) arr.splice(idx, 1);
    };

    spliceIfFound(allOnChat,     oldCommandName);
    spliceIfFound(allOnEvent,    oldCommandName);
    spliceIfFound(allOnAnyEvent, oldCommandName);

    // onFirstChat needs special handling (it stores objects, not plain names)
    const firstChatIdx = allOnFirstChat.findIndex(item => item === oldCommandName);
    let oldOnFirstChat;
    if (firstChatIdx !== -1) {
      oldOnFirstChat = allOnFirstChat[firstChatIdx];
      allOnFirstChat.splice(firstChatIdx, 1);
    }

    // ── Run onLoad if defined ─────────────────
    command.onLoad?.({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData });

    // ── Register aliases ──────────────────────
    if (configCommand.aliases) {
      const aliases = [].concat(configCommand.aliases);
      for (const alias of aliases) {
        if (aliases.filter(a => a === alias).length > 1)
          throw new Error(`Duplicate alias "${alias}" in ${commandType} "${scriptName}" (${removeHomeDir(pathCommand)})`);
        if (GoatBot.aliases.has(alias))
          throw new Error(
            `Alias "${alias}" already used by ${commandType} "${GoatBot.aliases.get(alias)}" (${removeHomeDir(GoatBot[setMap].get(GoatBot.aliases.get(alias))?.location || "")})`,
          );
        GoatBot.aliases.set(alias, scriptName);
      }
    }

    // ── Merge envGlobal & envConfig ───────────
    const { envGlobal, envConfig } = configCommand;

    if (envGlobal) {
      if (typeof envGlobal !== "object" || Array.isArray(envGlobal))
        throw new Error("envGlobal must be a plain object");
      Object.assign(configCommands.envGlobal, envGlobal);
    }

    if (envConfig && typeof envConfig === "object" && !Array.isArray(envConfig)) {
      configCommands[typeEnvCommand][scriptName] = {
        ...(configCommands[typeEnvCommand][scriptName] ?? {}),
        ...envConfig,
      };
    }

    // ── Update GoatBot maps ───────────────────
    GoatBot[setMap].delete(oldCommandName);
    GoatBot[setMap].set(scriptName, command);

    // Remove from unload list if present
    const unloadKey  = folder === "cmds" ? "commandUnload" : "commandEventUnload";
    const unloadList = configCommands[unloadKey] || [];
    const unloadIdx  = unloadList.indexOf(`${fileName}.js`);
    if (unloadIdx !== -1) unloadList.splice(unloadIdx, 1);
    configCommands[unloadKey] = unloadList;

    fs.writeFileSync(client.dirConfigCommands, JSON.stringify(configCommands, null, 2));

    // ── Register chat/event hooks ─────────────
    if (command.onChat)      allOnChat.push(scriptName);
    if (command.onFirstChat) allOnFirstChat.push({ commandName: scriptName, threadIDsChattedFirstTime: oldOnFirstChat?.threadIDsChattedFirstTime ?? [] });
    if (command.onEvent)     allOnEvent.push(scriptName);
    if (command.onAnyEvent)  allOnAnyEvent.push(scriptName);

    // ── Update file-path storage ──────────────
    const existingIdx = storageCommandFilesPath.findIndex(item => item.filePath === pathCommand);
    if (existingIdx !== -1) storageCommandFilesPath.splice(existingIdx, 1);
    storageCommandFilesPath.push({
      filePath:    pathCommand,
      commandName: [scriptName, ...(configCommand.aliases ?? [])],
    });

    return { status: "success", name: fileName, command };

  } catch (err) {
    // Preserve original stack before path-stripping
    const originalError    = new Error();
    originalError.name     = err.name;
    originalError.message  = err.message;
    originalError.stack    = err.stack;

    if (err.stack) err.stack = removeHomeDir(err.stack);
    fs.writeFileSync(global.client.dirConfigCommands, JSON.stringify(configCommands, null, 2));

    return {
      status:                    "failed",
      name:                      fileName,
      error:                     err,
      errorWithThoutRemoveHomeDir: originalError,
    };
  }
}

/**
 * Unload a script from memory and mark it as unloaded in config.
 *
 * @param {"cmds"|"events"} folder
 * @param {string}  fileName      - without .js extension
 * @param {object}  configCommands
 * @param {Function} getLang
 * @returns {{ status: "success", name: string }}
 */
function unloadScripts(folder, fileName, configCommands, getLang) {
  const pathCommand = path.normalize(`${process.cwd()}/scripts/${folder}/${fileName}.js`);

  if (!fs.existsSync(pathCommand)) {
    const err  = new Error(getLang("missingFile", `${fileName}.js`));
    err.name   = "FileNotFound";
    throw err;
  }

  const command     = require(pathCommand);
  const commandName = command.config?.name;

  if (!commandName)
    throw new Error(getLang("invalidFileName", `${fileName}.js`));

  const { GoatBot } = global;
  const { onChat: allOnChat, onEvent: allOnEvent, onAnyEvent: allOnAnyEvent } = GoatBot;

  // Remove from listener lists
  const spliceIfFound = (arr, target) => {
    const idx = arr.findIndex(item => item === target);
    if (idx !== -1) arr.splice(idx, 1);
  };
  spliceIfFound(allOnChat,     commandName);
  spliceIfFound(allOnEvent,    commandName);
  spliceIfFound(allOnAnyEvent, commandName);

  // Delete aliases
  const aliases = [].concat(command.config.aliases ?? []);
  for (const alias of aliases) GoatBot.aliases.delete(alias);

  // Remove from cache & map
  const setMap = folder === "cmds" ? "commands" : "eventCommands";
  delete require.cache[require.resolve(pathCommand)];
  GoatBot[setMap].delete(commandName);

  log.master("UNLOADED", getLang("unloaded", commandName));

  // Persist unloaded state
  const unloadKey  = folder === "cmds" ? "commandUnload" : "commandEventUnload";
  const unloadList = configCommands[unloadKey] ?? [];
  if (!unloadList.includes(`${fileName}.js`)) unloadList.push(`${fileName}.js`);
  configCommands[unloadKey] = unloadList;

  fs.writeFileSync(global.client.dirConfigCommands, JSON.stringify(configCommands, null, 2));

  return { status: "success", name: fileName };
}

// ─────────────────────────────────────────────
//  Expose utilities globally
// ─────────────────────────────────────────────
global.utils.loadScripts   = loadScripts;
global.utils.unloadScripts = unloadScripts;
