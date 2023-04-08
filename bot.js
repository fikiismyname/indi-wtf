const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const axios = require("axios");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.initialize();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  const command = "/dukun";
  const urlRegex = /^https?:\/\//i;

  if (msg.body.startsWith(command)) {
    const url = msg.body.split(" ")[1];

    if (!urlRegex.test(url)) {
      return msg.reply(
        "❌ URL tidak valid. Pastikan menggunakan protokol http:// atau https://"
      );
    }

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
});
