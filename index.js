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

    const gifs = await client.invoke(new Api.messages.GetSavedGifs({}));
    console.log(`Found ${gifs.gifs.length} saved GIFs`);
    for (const gif of gifs.gifs) {
        const api = new Api.messages.SaveGif({
            unsave: true,
            id: gif,
        });

        try {
            await client.invoke(api);
        } catch (error) {
            console.error(`Failed to remove GIF ${id}`);
            console.error(error);
        }
    }
    console.log("Done, disconnecting now.");
    client.disconnect();
})();