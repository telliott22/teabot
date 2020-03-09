const { App } = require("@slack/bolt");
const store = require("./store");
const axios = require("axios");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});

// app.event("app_home_opened", ({ event, say }) => {
//   // Look up the user from DB
//   let user = store.getUser(event.user);

//   if (!user) {
//     user = {
//       user: event.user,
//       channel: event.channel
//     };
//     store.addUser(user);

//     say(
//       "Hi "+event.user+"! In the future humans don't drink tea. So I've travelled back in time to assist 21st century darjeeling deliverance! When you're going to make a hot beverage, type `/tea-time` and I'll message everyone your colleagues to ask if they would like to partake! Beep bop beep"
//     );

//     //I've spent 10,000 years assisting in darjeeling deliverance
//   } else {
//     //randomise robot jokes
//     say("Hi again! ");

//     //Did you know? In the year 8,020 Tea will be outlawed
//     //Ironically, oats go instict in the year 8,020 and the world reverts back to archaic mamalian milk.
//   }
// });

// The echo command simply echoes on command
app.command("/tea-time", async ({ command, ack, say }) => {
  ack();

  store.setMakingTea(true);

  let teaMaker = {
    username: command.user_name,
    id: command.id
  };

  say("I'm asking everyone in your team, I'll message back in 60 seconds");

  // let userIds = ["U06E0G998", "U6Z0CLB9D", "UQDQXCS1F"];
  
  let userIds = ['U6Z0CLB9D'];
  
  //   try {
  //       let users = await app.client.users.list({
  //         token: process.env.SLACK_BOT_TOKEN
  //       });

  //       console.log(users);
  //   } catch (error) {}

  try {
    for (let x in userIds) {
      let userId = userIds[x];

      await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: userId,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                teaMaker.username +
                " is making a some teas. Do you want a tea/coffee?"
            }
          },
          {
            type: "actions",
            elements: [
              {
                action_id: "openModal",
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Yes please!",
                  emoji: true
                }
              }
            ]
          }
        ]
      });
    }

    setTimeout(async () => {
      store.setMakingTea(false);

      let responseMessageObject = [];

      responseMessageObject.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `You're a star ${teaMaker.username}, can you make teas for the following:`
        }
      });

      let orders = await store.getOrders();

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];

        responseMessageObject.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: order.details + " for " + order.user
          }
        });
      }

      say({ blocks: responseMessageObject });

      store.resetOrders();
    }, 60000);
  } catch (error) {
    console.log(error.data);
  }
});

app.action("openModal", async ({ body, action, ack, say }) => {
  ack();

  let makingTeaStatus = store.getMakingTea();

  let user = body.user.name;

  if (makingTeaStatus) {
    try {
      const result = await app.client.views.open({
        token: process.env.SLACK_BOT_TOKEN,
        trigger_id: body.trigger_id,
        // View payload
        view: {
          type: "modal",
          // View identifier
          callback_id: "tea-modal",
          title: {
            type: "plain_text",
            text: "tea_bot"
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Last time you had ..."
              },
              accessory: {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Same again!"
                },
                action_id: "button_abc"
              }
            },
            {
              type: "input",
              block_id: "input_c",
              label: {
                type: "plain_text",
                text: "What do you want this time?"
              },
              element: {
                type: "plain_text_input",
                action_id: "dreamy_input",
                multiline: true
              }
            }
          ],
          submit: {
            type: "plain_text",
            text: "Submit"
          }
        }
      });

      // console.log(result);
    } catch (error) {
      console.log(error);
    }
  } else {
    say(
      "Sorry " +
        user +
        ", you've missed out. Why don't you make the tea you lazy ****. Type `/tea-time` to ask around"
    );
  }
});

app.view("tea-modal", async ({ ack, body, view, context }) => {
  ack();

  // console.log(view);

  let makingTeaStatus = store.getMakingTea();

  let user = body.user.name;

  let order = view["state"]["values"]["input_c"]["dreamy_input"]["value"];

  if (makingTeaStatus) {
    store.addToOrders({ details: order, user: user });

    app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: body.user.id,
      text: "Thanks for your order!"
    });
  } else {
    app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: body.user.id,
      text:
        "Sorry " +
        user +
        ", you've missed out. Why don't you make the tea you lazy ****. Type `/tea-time` to ask around"
    });
  }
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
