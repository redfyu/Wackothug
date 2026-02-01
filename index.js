import "dotenv/config";
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { Bytez } from "bytez";

const { Client, LocalAuth } = pkg;

/* ================= BYTEZ SETUP ================= */
const sdk = new Bytez(process.env.BYTEZ_KEY);

// CHAT MODEL (DO NOT CHANGE)
const chatModel = sdk.model("openai/gpt-4.1");

// IMAGE MODEL (DO NOT CHANGE)
const imageModel = sdk.model("dreamlike-art/dreamlike-photoreal-2.0");

/* ================= WHATSAPP CLIENT ================= */
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  }
});

/* ================= EVENTS ================= */
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("📲 Scan QR to login");
});

client.on("ready", () => {
  console.log("😎 I am Wackothug — your AI ready to help, let’s be friends!");
});

/* ================= MESSAGE HANDLER ================= */
client.on("message", async (msg) => {
  const text = msg.body.trim();

  // typing indicator
  await client.sendPresenceAvailable();
  await client.sendTyping(msg.from);

  /* ---------- COMMANDS ---------- */
  if (text === "/commands") {
    return msg.reply(`
🔥 *Wackothug Dashboard*

/commands  – show commands
/image     – generate image
/investors – investor info
/loyal     – loyalty message
/status    – system status

💬 Any normal message = AI chat
    `);
  }

  if (text === "/investors") {
    return msg.reply("📉 No current investors yet.");
  }

  if (text === "/loyal") {
    return msg.reply(
      "🖤 Loyal to Mr WACKO & Mr Hacker — creators of Wackothug.\nIt’s really a pleasure."
    );
  }

  if (text === "/status") {
    return msg.reply(`
🟢 *System Status*
AI Chat: Online
Images: Online
Mode: Public
Engine: Bytez
    `);
  }

  /* ---------- IMAGE GENERATION ---------- */
  if (text.startsWith("/image ")) {
    const prompt = text.replace("/image ", "");

    await msg.reply("🎨 Generating image… please wait");

    const result = await imageModel.run(prompt);

    if (result.error) {
      return msg.reply("❌ Image generation failed.");
    }

    return msg.reply(result.output);
  }

  /* ---------- AI CHAT (DEFAULT) ---------- */
  if (!text.startsWith("/")) {
    const result = await chatModel.run({
      messages: [
        {
          role: "system",
          content:
            "You are Wackothug, a cool, friendly, smart AI bro."
        },
        { role: "user", content: text }
      ]
    });

    if (result.error) {
      return msg.reply("❌ AI error, try again.");
    }

    return msg.reply(result.output);
  }
});

client.initialize();
