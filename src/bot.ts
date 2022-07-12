import { userClientAuth } from "./config/config.js";
import { Worker } from "worker_threads";
import { maskify } from "./layer.js";
const worker = new Worker("./dist/twitter_worker.js");
const userClient = userClientAuth();

const authorIdQueue: any[] = [];

async function sendTweet() {
  while (true) {
    console.log(authorIdQueue);
    const chineasePhrase = "we're just getting started 操你妈逼";
    const englishPhrase = "we're just getting started mfer";
    const spanishPhrase = "we're just getting started hijo de tu puta madre";

    if (authorIdQueue.length > 0) {
      const currentTweetObj: any = authorIdQueue.shift();
      let mferPhrase;
      if (currentTweetObj.isChinease) {
        mferPhrase = chineasePhrase;
      } else if (currentTweetObj.isSpanish) {
        mferPhrase = spanishPhrase;
      } else {
        mferPhrase = englishPhrase;
      }
      if (currentTweetObj.imageBuffer && currentTweetObj.mferfy) {
        const mergedImageBuffer = await maskify(
          currentTweetObj.imageBuffer,
          currentTweetObj.imageUrl
        );
        const mediaIds = await userClient.v1.uploadMedia(mergedImageBuffer, {
          mimeType: "png",
        });
        await userClient.v1.reply(`${mferPhrase}`, currentTweetObj.tweetId, {
          media_ids: mediaIds,
        });
      } else {
        await userClient.v1.reply(`${mferPhrase}`, currentTweetObj.tweetId);
      }
    }

    await new Promise((r) => setTimeout(r, 20000));
  }
}

function addTweetId(tweetId: any) {
  authorIdQueue.push(tweetId);
}

worker.on("message", (msg) => {
  console.log("message recieved");
  addTweetId(msg);
});

sendTweet();