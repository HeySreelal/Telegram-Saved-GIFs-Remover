const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

(async () => {
    // Get and validate API ID
    let apiIdInput = await input.text("📄 Please enter your API ID: ");
    const apiId = parseInt(apiIdInput, 10);
    if (isNaN(apiId)) {
        console.error("❌ Invalid API ID. It should be a number.");
        process.exit(1); 
    }

    // Get and validate API Hash
    const apiHash = await input.text("🔑 Please enter your API Hash: ");
    if (!apiHash || apiHash.length < 32) {
        console.error("❌ Invalid API Hash. It should be a valid hash string.");
        process.exit(1); 
    }

    // Get string session if available
    const stringSessionInput = await input.text("🗝️ Do you have a string session key? (Leave empty if not): ");
    
    // Use existing or empty session
    const stringSession = new StringSession(stringSessionInput || ""); 
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    if (stringSessionInput) {
        // If string session is provided, connect directly
        await client.connect();
        console.log("✅ Connected using the provided string session.");
    } else {
        // If no string session, go through login process
        await client.start({
            phoneNumber: async () => await input.text("📞 Please enter your phone number: "),
            password: async () => await input.text("🔐 Please enter your password: "),
            phoneCode: async () =>
                await input.text("📲 Please enter the code you received: "),
            onError: (err) => console.log(err),
        });
        console.log("💾 Session saved:");
        console.log(client.session.save());
    }

    let totalRemoved = 0;

    while (true) {
        const gifs = await client.invoke(new Api.messages.GetSavedGifs({}));
        const len = gifs.gifs.length;

        if (len === 0) {
            console.log(`🎉 All saved GIFs have been removed. Total removed: ${totalRemoved}`);
            break;
        }

        console.log(`Found ${len} saved GIFs.\n🛸 Starting the removal loop.`);

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
