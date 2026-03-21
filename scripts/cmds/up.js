const { createCanvas } = require("canvas");
const fs = require("fs");
const os = require("os");
const path = require("path");

module.exports = {
  config: {
    name: "up",
    aliases: ["dashboard", "status"],
    version: "4.0",
    author: "𝐓𝐀𝐌𝐈𝐌",
    role: 0,
    countDown: 5,
    shortDescription: { en: "Cyberpunk system status card" },
    longDescription: { en: "Displays uptime, RAM, CPU, ping with a cyberpunk-styled holographic card" },
    category: "system",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    const uptimeBot = process.uptime();
    const uptimeSystem = os.uptime();

    const formatTime = sec => {
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      return `${d}d ${h}h ${m}m ${s}s`;
    };

    const totalMem = os.totalmem() / 1024 / 1024;
    const freeMem = os.freemem() / 1024 / 1024;
    const usedMem = totalMem - freeMem;
    const ramPercent = ((usedMem / totalMem) * 100).toFixed(1);
    const cpuModel = os.cpus()[0].model;
    const cores = os.cpus().length;
    const platform = `${os.platform()} (${os.arch()})`;
    const hostname = os.hostname();
    const ping = event.timestamp ? Date.now() - event.timestamp : "N/A";
    const botMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const nodeVer = process.version;

    // ── Canvas Setup ──────────────────────────────────────────────
    const W = 680, H = 520;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // ── Background ────────────────────────────────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#050811");
    bgGrad.addColorStop(0.5, "#0a0f1e");
    bgGrad.addColorStop(1, "#06090f");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Scanlines overlay
    ctx.save();
    for (let y = 0; y < H; y += 4) {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, y, W, 2);
    }
    ctx.restore();

    // Corner grid dots (cyberpunk texture)
    ctx.save();
    ctx.fillStyle = "rgba(0,255,255,0.06)";
    for (let x = 10; x < W; x += 22) {
      for (let y = 10; y < H; y += 22) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // ── Neon side accent bars ─────────────────────────────────────
    const makeEdgeGlow = (x1, y1, x2, y2, color) => {
      const g = ctx.createLinearGradient(x1, y1, x2, y2);
      g.addColorStop(0, "transparent");
      g.addColorStop(0.5, color);
      g.addColorStop(1, "transparent");
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };
    makeEdgeGlow(0, 0, 0, H, "rgba(0,255,255,0.9)");       // left cyan
    makeEdgeGlow(W, 0, W, H, "rgba(255,0,255,0.9)");       // right magenta
    makeEdgeGlow(0, 0, W, 0, "rgba(0,255,255,0.5)");       // top
    makeEdgeGlow(0, H - 1, W, H - 1, "rgba(255,0,255,0.5)"); // bottom

    // ── Outer card border with neon glow ──────────────────────────
    const cx = 22, cy = 22, cw = W - 44, ch = H - 44;
    ctx.save();
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 28;
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 1.5;
    roundRect(ctx, cx, cy, cw, ch, 8);
    ctx.stroke();
    ctx.restore();

    // Inner card fill
    ctx.save();
    const cardFill = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
    cardFill.addColorStop(0, "rgba(0,30,50,0.75)");
    cardFill.addColorStop(1, "rgba(5,10,25,0.85)");
    ctx.fillStyle = cardFill;
    roundRect(ctx, cx, cy, cw, ch, 8);
    ctx.fill();
    ctx.restore();

    // ── Header bar ────────────────────────────────────────────────
    ctx.save();
    const hBar = ctx.createLinearGradient(cx, cy, cx + cw, cy);
    hBar.addColorStop(0, "rgba(0,255,255,0.15)");
    hBar.addColorStop(0.5, "rgba(0,255,255,0.05)");
    hBar.addColorStop(1, "rgba(255,0,255,0.15)");
    ctx.fillStyle = hBar;
    roundRect(ctx, cx, cy, cw, 48, 8);
    ctx.fill();
    ctx.restore();

    // Header separator line
    ctx.save();
    const sepGrad = ctx.createLinearGradient(cx, 0, cx + cw, 0);
    sepGrad.addColorStop(0, "transparent");
    sepGrad.addColorStop(0.3, "#00ffff");
    sepGrad.addColorStop(0.7, "#ff00ff");
    sepGrad.addColorStop(1, "transparent");
    ctx.strokeStyle = sepGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 48);
    ctx.lineTo(cx + cw, cy + 48);
    ctx.stroke();
    ctx.restore();

    // ── Title ─────────────────────────────────────────────────────
    ctx.save();
    ctx.font = "bold 19px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    // Glitch shadow layers
    ctx.fillStyle = "rgba(255,0,255,0.5)";
    ctx.fillText("◈ SYSTEM // STATUS", cx + 20 + 2, cy + 24);
    ctx.fillStyle = "rgba(0,255,255,0.5)";
    ctx.fillText("◈ SYSTEM // STATUS", cx + 20 - 2, cy + 24);
    ctx.fillStyle = "#e0ffff";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 14;
    ctx.fillText("◈ SYSTEM // STATUS", cx + 20, cy + 24);
    ctx.restore();

    // Version badge
    ctx.save();
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    ctx.fillStyle = "#ff00ff";
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 8;
    ctx.fillText("v4.0 ◉ ONLINE", cx + cw - 14, cy + 24);
    ctx.restore();

    // ── Data rows ─────────────────────────────────────────────────
    const labels = [
      "⬡ BOT UPTIME",
      "⬡ SYS UPTIME",
      "⬡ CPU MODEL",
      "⬡ RAM USAGE",
      "⬡ PLATFORM",
      "⬡ NODE.JS",
      "⬡ HOSTNAME",
      "⬡ PING",
      "⬡ BOT MEMORY",
      "⬡ DEVELOPER"
    ];

    const values = [
      formatTime(uptimeBot),
      formatTime(uptimeSystem),
      `${cpuModel} ×${cores}`,
      `${usedMem.toFixed(0)} / ${totalMem.toFixed(0)} MB`,
      platform,
      nodeVer,
      hostname,
      `${ping} ms`,
      `${botMemory} MB`,
      "𝐓𝐀𝐌𝐈𝐌"
    ];

    // Alternating label colors: cyan / magenta / yellow-green
    const labelColors = [
      "#00ffff", "#ff00ff", "#aaff00", "#ff6600",
      "#00e5ff", "#ffdd00", "#39ff14", "#ff00aa",
      "#00cfff", "#ff9900"
    ];

    const rowStartY = cy + 64;
    const rowH = 34;
    const labelX = cx + 20;
    const valueX = cx + 200;
    const maxValW = cw - 200 - 160; // leave space for ring on right

    labels.forEach((label, i) => {
      const y = rowStartY + i * rowH;

      // Row highlight on even rows
      if (i % 2 === 0) {
        ctx.save();
        ctx.fillStyle = "rgba(0,255,255,0.025)";
        ctx.fillRect(cx + 4, y - 12, cw - 8, rowH - 2);
        ctx.restore();
      }

      // Label
      ctx.save();
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = labelColors[i];
      ctx.shadowColor = labelColors[i];
      ctx.shadowBlur = 10;
      ctx.fillText(label, labelX, y + 4);
      ctx.restore();

      // Arrow
      ctx.save();
      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillText("▸", labelX + 130, y + 4);
      ctx.restore();

      // Value
      ctx.save();
      ctx.font = "12.5px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#c8f0ff";
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 6;
      // Truncate long values
      let val = values[i];
      while (ctx.measureText(val).width > maxValW && val.length > 8) {
        val = val.slice(0, -4) + "…";
      }
      ctx.fillText(val, valueX, y + 4);
      ctx.restore();
    });

    // ── RAM Ring (Holographic) ────────────────────────────────────
    const ringCX = cx + cw - 82;
    const ringCY = cy + 148;
    const ringR = 58;
    const startA = -Math.PI / 2;
    const endA = startA + (2 * Math.PI * ramPercent / 100);

    // Track ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(ringCX, ringCY, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 9;
    ctx.stroke();
    ctx.restore();

    // Inner glow ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(ringCX, ringCY, ringR - 10, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,255,255,0.05)";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();

    // Progress arc
    const ringGrad = ctx.createLinearGradient(
      ringCX - ringR, ringCY - ringR,
      ringCX + ringR, ringCY + ringR
    );
    ringGrad.addColorStop(0, "#00ffff");
    ringGrad.addColorStop(0.5, "#00aaff");
    ringGrad.addColorStop(1, "#ff00ff");

    ctx.save();
    ctx.beginPath();
    ctx.arc(ringCX, ringCY, ringR, startA, endA);
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 22;
    ctx.stroke();
    ctx.restore();

    // Ring center text
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 16px monospace";
    ctx.fillStyle = "#00ffff";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 16;
    ctx.fillText(`${ramPercent}%`, ringCX, ringCY - 8);
    ctx.font = "9px monospace";
    ctx.fillStyle = "rgba(180,220,255,0.7)";
    ctx.shadowBlur = 0;
    ctx.fillText("RAM", ringCX, ringCY + 10);
    ctx.restore();

    // Ring label
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "bold 10px monospace";
    ctx.fillStyle = "#ff00ff";
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 8;
    ctx.fillText("⟁ MEMORY", ringCX, ringCY + ringR + 18);
    ctx.restore();

    // ── Footer ────────────────────────────────────────────────────
    // Footer separator
    ctx.save();
    const footSep = ctx.createLinearGradient(cx, 0, cx + cw, 0);
    footSep.addColorStop(0, "transparent");
    footSep.addColorStop(0.4, "#ff00ff");
    footSep.addColorStop(0.6, "#00ffff");
    footSep.addColorStop(1, "transparent");
    ctx.strokeStyle = footSep;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy + ch - 32);
    ctx.lineTo(cx + cw, cy + ch - 32);
    ctx.stroke();
    ctx.restore();

    // Footer text
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 13px monospace";
    // Glitch effect
    ctx.fillStyle = "rgba(255,0,255,0.4)";
    ctx.fillText("⚡ ALL SYSTEMS NOMINAL — BOT IS RUNNING ⚡", W / 2 + 1, cy + ch - 16);
    ctx.fillStyle = "rgba(0,255,255,0.4)";
    ctx.fillText("⚡ ALL SYSTEMS NOMINAL — BOT IS RUNNING ⚡", W / 2 - 1, cy + ch - 16);
    ctx.fillStyle = "#e0ffff";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 12;
    ctx.fillText("⚡ ALL SYSTEMS NOMINAL — BOT IS RUNNING ⚡", W / 2, cy + ch - 16);
    ctx.restore();

    // ── Corner Decorations ────────────────────────────────────────
    drawCorner(ctx, cx, cy, 18, "#00ffff");                 // top-left
    drawCorner(ctx, cx + cw, cy, 18, "#00ffff", true);      // top-right
    drawCorner(ctx, cx, cy + ch, 18, "#ff00ff", false, true); // bottom-left
    drawCorner(ctx, cx + cw, cy + ch, 18, "#ff00ff", true, true); // bottom-right

    // ── Save & Send ───────────────────────────────────────────────
    const buffer = canvas.toBuffer("image/png");
    const filePath = path.join(os.tmpdir(), `status_cyber_${Date.now()}.png`);
    await fs.promises.writeFile(filePath, buffer);

    await api.sendMessage(
      { attachment: fs.createReadStream(filePath) },
      event.threadID,
      event.messageID
    );

    fs.unlink(filePath, () => {});
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCorner(ctx, x, y, size, color, flipX = false, flipY = false) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2;
  ctx.lineCap = "square";
  const dx = flipX ? -size : size;
  const dy = flipY ? -size : size;
  ctx.beginPath();
  ctx.moveTo(x + dx, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + dy);
  ctx.stroke();
  ctx.restore();
}
