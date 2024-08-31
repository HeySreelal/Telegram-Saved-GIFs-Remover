const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = "<YOUR_API_ID>";
const apiHash = "<YOUR_API_HASH>";
const stringSession = new StringSession("");

const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
});

(async () => {
    await client.start({
        phoneNumber: async () => await input.text("📞 Please enter your number: "),
        password: async () => await input.text("🔑 Please enter your password: "),
        phoneCode: async () =>
            await input.text("📲 Please enter the code you received: "),
        onError: (err) => console.log(err),
    });

    console.log("💾 Session saved:");
    console.log(client.session.save());

    let totalRemoved = 0;

    while (true) {
        const gifs = await client.invoke(new Api.messages.GetSavedGifs({}));
        const len = gifs.gifs.length;

        if (len === 0) {
            console.log(`🎉 All saved GIFs have been removed. Total removed: ${totalRemoved}`);
            break;
        }

        console.log(`Found ${len} saved GIFs.\m🛸 Starting the removal loop.`);

        for (let i = 0; i < len; i++) {
            const gif = gifs.gifs[i];

            const api = new Api.messages.SaveGif({
                unsave: true,
                id: gif,
            });

            try {
                await client.invoke(api);
                totalRemoved++;
                console.info(`ℹ️ Removed ${i + 1}/${len}:  ${gif.id}`);
                await sleep(500);
            } catch (error) {
                console.error(`❌ Failed to remove GIF ${gif.id}`);
                console.error(error);
            }
        }
    }

    console.log("🔌 Done. Disconnecting now.");
    client.disconnect();
})();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
