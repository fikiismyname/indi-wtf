const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const axios = require("axios");

// Create a function to check if a website can be accessed from Telkom Indonesia's network
async function checkWebsite(msg, url) {
  const apiUrl = `https://indi.wtf/api/v1/check?url=${url}`;

  try {
    const response = await axios.get(apiUrl);
    const responseData = response.data;

    const rootDomain = new URL(url).hostname;
    const successMessage = `✅ Situs ${rootDomain} dapat diakses dari jaringan Telkom Indonesia!\n✅ Bebas dari daftar TrustPositif.\n✅ Tidak mengalami penyegatan data.`;
    const errorMessage = `❌ Situs ${rootDomain} tidak dapat diakses dari jaringan Telkom Indonesia!\n❌ Diindikasi masuk ke dalam daftar TrustPositif.\n❌ Mengalami penyegatan data.`;

    const message = responseData.success ? successMessage : errorMessage;
    msg.reply(message);
  } catch (error) {
    console.error(error);
    msg.reply(
      `❌ Terjadi kesalahan saat memeriksa situs ${url}. Mohon coba lagi nanti.`
    );
  }
}

// Create a class for the WhatsApp bot
class WhatsAppBot {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    this.client.initialize();

    this.client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on("authenticated", () => {
      console.log("AUTHENTICATED");
    });

    this.client.on("ready", () => {
      console.log("Client is ready!");
    });

    this.client.on("message", async (msg) => {
      const command = "/dukun";
      const urlRegex = /^https?:\/\//i;

      if (msg.body.startsWith(command)) {
        const message = msg.body.toLowerCase();
        const url = message.split(" ")[1];

        if (message === `${command} --help`) {
          const helpMessage = `ℹ️ Cara menggunakan Dukun Internet:\n\n1. Ketik "${command} <alamat website>" untuk memeriksa apakah website dapat diakses dari jaringan Telkom Indonesia tanpa diblokir oleh TrustPositif.\n\n   Contoh: ${command} https://google.com\n\n2. Ketik "${command} --help" untuk menampilkan pesan bantuan ini.`;
          return msg.reply(helpMessage);
        }

        if (!urlRegex.test(url)) {
          return msg.reply(
            "❌ URL tidak valid. Pastikan menggunakan protokol http:// atau https://"
          );
        }

        // Call the checkWebsite function to check if the website can be accessed
        await checkWebsite(msg, url);
      }
    });
  }
}

// Instantiate the WhatsApp bot
const bot = new WhatsAppBot();
