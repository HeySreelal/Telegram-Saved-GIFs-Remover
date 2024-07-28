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
        phoneNumber: async () => await input.text("Please enter your number: "),
        password: async () => await input.text("Please enter your password: "),
        phoneCode: async () =>
            await input.text("Please enter the code you received: "),
        onError: (err) => console.log(err),
    });

    console.log(client.session.save())

    const gifs = await client.invoke(new Api.messages.GetSavedGifs({}));

    const len = gifs.gifs.length;
    console.log(`Found ${len} saved GIFs`);

    console.log(`🛸 Starting the removal loop.`);

    for (let i = 0; i < len; i++) {
        // Type: TypeDocument
        const gif = gifs.gifs[i];

        const api = new Api.messages.SaveGif({
            unsave: true,
            id: gif,
        });

        try {
            await client.invoke(api);
            console.info(`ℹ️ Removed ${i + 1}/${len}:  ${gif.id}`);
            await sleep(500);
        } catch (error) {
            console.error(`Failed to remove GIF ${gif.id}`);
            console.error(error);
        }
    }
    console.log("Done, disconnecting now.");
    client.disconnect();
})();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}