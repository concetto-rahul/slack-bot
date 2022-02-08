const { WebClient } = require("@slack/web-api");
const { createEventAdapter } = require("@slack/events-api");
const dotenv = require("dotenv").config();

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackToken = process.env.SLACK_TOKEN;
const port = process.env.SLACK_PORT || 3000;

const slackEvents = createEventAdapter(slackSigningSecret);
const slackClient = new WebClient(slackToken);

// slackClient.chat.postMessage({
//   channel: "test1-12",
//   text: `Heelo Every one this is chat bot`,
// });
const channelName = "case-1234-test";
const teamID = "T030MBT1AUR";
const boatID = "B032L0XJQ48";
const userID = "U030B1VJULU";
// const channelData = res.channel; [ 'U030B1VJULU', 'U031RLFGU76', 'U03220EAY3B' ]
slackClient.conversations
  .kick({
    channel: "C031GUD94TZ",
    user: "U031RLFGU76",
  })
  .then((res) => console.log("leave res", res))
  .catch((error) => console.log("leave error", error.data));

// const list = slackClient.conversations
//   .members({ channel: "C031GUD94TZ" })
//   .then((res) => {
//     console.log("ress list members", res);
//   });
// const list = slackClient.conversations.list().then((res) => {
//   console.log("ress list channels", res.channels);
// });
// console.log("listlist", list);
// slackClient.conversations
//   .create({
//     is_private: false,
//     name: channelName,
//     description: `the very beginning of the #${channelName} channel. Description include case 12548788`,
//   })
//   .then((res) => {
//     console.log("conversations resss", res);
//     if (res.channel) {
//       const channelData = res.channel;
//       slackClient.conversations.invite({
//         channel: channelData.id,
//         users: userID,
//       });
//     }
//   })
//   .catch((err) => {
//     console.log("conversations err", err.data);
//   });

slackEvents.on("message", (event) => {
  console.log(`message.channels`, event);
  if (event.bot_id) {
    // (async () => {
    //   try {
    //     await slackClient.chat.postMessage({
    //       channel: event.channel,
    //       text: `Removed reaction <@${event.user}>! :${event.text}:`,
    //     });
    //   } catch (error) {
    //     console.log(error.data);
    //   }
    // })();
  }
});

slackEvents.on("reaction_added", (event) => {
  console.log(
    `Got reaction_added from user ${event.user}: ${event.reaction}`,
    event
  );
  (async () => {
    try {
      await fetchMessage(event.item.channel, event.item.ts, "add");
      // await slackClient.chat.postMessage({ channel: event.item.channel, text: `Added reaction <@${event.user}>! :${event.reaction}:` })
    } catch (error) {
      console.log("reaction_added", error.data);
    }
  })();
});

slackEvents.on("reaction_removed", (event) => {
  console.log(
    `Got reaction_removed from user ${event.user}: ${event.reaction}`,
    event
  );
  (async () => {
    try {
      await fetchMessage(event.item.channel, event.item.ts, "remove");
      // await slackClient.chat.postMessage({ channel: event.item.channel, text: `Removed reaction <@${event.user}>! :${event.reaction}:` })
    } catch (error) {
      console.log("reaction_removed", error.data);
    }
  })();
});

slackEvents.on("error", console.error);

slackEvents.start(port).then(() => {
  console.log(`Server started on port ${port}`);
});

async function fetchMessage(id, ts, action) {
  console.log(id, ts, action);
  await slackClient.conversations
    .history({
      channel: id,
      latest: ts,
      inclusive: true,
      limit: 1,
    })
    .then((response) => {
      if (response.messages) {
        const messageData = response.messages[0];
        console.log("messageDatamessageData", messageData);
        // const teamID = messageData.team;
        // const userID = messageData.user;
        // let channelName = messageData.text;
        // channelName = channelName.replace(/ /g, "-").toLowerCase();
        // if (action === "add") {
        //   slackClient.conversations
        //     .create({
        //       name: channelName,
        //       description: `the very beginning of the #${channelName} channel. Description include case 12548788`,
        //       team_id: teamID,
        //     })
        //     .then((res) => {
        //       console.log("resresres", res);
        //     })
        //     .catch((err) => {
        //       console.log("resresres", err.data);
        //     })
        //     .finally(() => {});
        // } else if (action === "remove") {
        // }
      }
    })
    .catch((error) => {
      console.log("fetchMessage error", error);
    });
}
