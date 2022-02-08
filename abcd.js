const { WebClient } = require("@slack/web-api");
const { createEventAdapter } = require("@slack/events-api");
const dotenv = require("dotenv").config();

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackToken = process.env.SLACK_TOKEN;
const port = process.env.SLACK_PORT || 3000;

const slackEvents = createEventAdapter(slackSigningSecret);
const slackClient = new WebClient(slackToken);

// const botInfo = slackClient.apiCall("auth.test");

// slackClient.conversations.create({
//   is_private: true,
//   name: "case-123-testcase",
//   description:
//     "the very beginning of the #case-123-testcase channel. Description inclide case 123",
//   org_wide: true,
// });
// slackClient.chat.postMessage({ channel: channel, text: `Helloabcd ! :tada:` })

slackEvents.on("reaction_added", (event) => {
  console.log(
    `Got reaction_added from user ${event.user}: ${event.reaction}`,
    event
  );
  (async () => {
    try {
      fetchMessage(event.item.channel, event.item.ts, "add");
      // await slackClient.chat.postMessage({ channel: event.item.channel, text: `Added reaction <@${event.user}>! :${event.reaction}:` })
    } catch (error) {
      console.log(error.data)
    }
  })();
});

slackEvents.on("reaction_removed", (event) => {
  console.log(
    `Got reaction_removed from user ${event.user}: ${event.reaction}`,
    event
  );
  // (async () => {
  //   try {
  //     await slackClient.chat.postMessage({ channel: event.item.channel, text: `Removed reaction <@${event.user}>! :${event.reaction}:` })
  //   } catch (error) {
  //     console.log(error.data)
  //   }
  // })();
});

slackEvents.on("message", (event) => {
  console.log(`message.channels`, event);
  // (async () => {
  //   try {
  //     await slackClient.chat.postMessage({ channel: event.channel, text: `Removed reaction <@${event.user}>! :${event.text}:` })
  //   } catch (error) {
  //     console.log(error.data)
  //   }
  // })();
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
        const messageData = response.messages;
        const teamID = messageData.team;
        const userID = messageData.user;
        let channelName = messageData.text;
        channelName = channelName.replace(" ", "-").toLowerCase();
        console.log("channelName", teamID, userID, channelName);
      }
    })
    .catch((error) => {
      console.log("fetchMessage error", error);
    });
}
