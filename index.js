const { WebClient } = require("@slack/web-api");
const { createEventAdapter } = require("@slack/events-api");
const dotenv = require("dotenv").config();

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackToken = process.env.SLACK_TOKEN;
const port = process.env.SLACK_PORT || 3000;

const slackEvents = createEventAdapter(slackSigningSecret);
const slackClient = new WebClient(slackToken);

// slackClient.chat.postMessage({
//   channel: "C031RHJ0AT0",
//   text: `Case 000594280`,
// });

slackEvents.on("message", (event) => {
  console.log(`message.channels`, event);
  if (event.bot_id) {
    const channelName = convertTextToSlackName(event.text);
    slackClient.conversations.create({
      name: channelName,
    });
  }
});

slackEvents.on("reaction_added", (event) => {
  console.log(`reaction_added from user ${event.user}: ${event.reaction}`);
  if (event.user && event.item && event.item.ts) {
    userChannelAction("added", event.user, event.item);
  }
});

slackEvents.on("reaction_removed", (event) => {
  if (event.user && event.item && event.item.ts) {
    userChannelAction("removed", event.user, event.item);
  }
});

slackEvents.on("error", console.error);

slackEvents.start(port).then(() => {
  console.log(`Server started on port ${port}`);
});

function convertTextToSlackName(text, type = "") {
  if (type == "channel") {
  } else {
    return text.replace(/ /g, "-").toLowerCase();
  }
}

async function userChannelAction(action, userId, channelData) {
  try {
    const messageList = await slackClient.conversations.history({
      channel: channelData.channel,
      latest: channelData.ts,
      inclusive: true,
      limit: 1,
    });
    const message = (messageList.messages && messageList.messages[0]) || null;
    if (message) {
      const channelName = convertTextToSlackName(message.text);

      const channelList = await slackClient.conversations.list();
      const channelData =
        (channelList &&
          channelList.channels &&
          channelList.channels.find((res) => res.name == channelName)) ||
        null;
      if (channelData) {
        if (action == "added") {
          await slackClient.conversations.invite({
            channel: channelData.id,
            users: userId,
          });
        } else if (action == "removed") {
          await slackClient.conversations.kick({
            channel: channelData.id,
            user: userId,
          });
        }
      }
    }
  } catch (err) {
    console.log("userChannelAction error", err);
  }
}