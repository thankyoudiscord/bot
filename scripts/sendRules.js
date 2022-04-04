const {config} = require('dotenv');
const {ComponentType, ButtonStyle, Routes} = require('discord-api-types/v10');
const {REST} = require('@discordjs/rest');
const path = require('path');

config({path: path.join(process.cwd(), '.env'), override: true});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '960277863167299686';

const restClient = new REST({
  version: 10,
}).setToken(DISCORD_TOKEN);

/** @type {import('discord-api-types/v10').RESTPostAPIChannelMessageJSONBody} */
const rules = {
  embeds: [
    {
      title: '👋 Hey there!',
      description:
        "Thank you for joining us here for the Thank You Discord project! In order to foster and maintain a healthy community, we have some rules to keep everything in order.  If you're confused about a rule or need any other help, feel free to contact a staff member!",
      color: 5793266,
    },
    {
      title: '📋 Rules',
      description:
        "**Rule 1:** Follow Discord's [Terms of Service](https://discord.com/terms) and [Community Guidelines](https://discord.com/guidelines).\n\n**Rule 2:** No spamming, misusing channels, or advertising of unrelated content. This includes messages sent in DMs.\n\n**Rule 3:** No discriminative messages. Politics and drama have no place in this server. Please do not bring in drama from other servers.\n\n**Rule 4:** Please be helpful and supportive! Harassment of any kind will not be tolerated.\n\n**Rule 6:** Follow and respect staff members and their instructions.\n\n**Additional Notes:**\n- This server is English-only, so please speak English to the best of your ability.\n- Feel free to DM a mod if you notice an incident like this go unnoticed, but leave moderation to the moderators.",
      color: 5793266,
    },
  ],

  content: 'Use the buttons below to assign roles!',
  components: [
    {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          custom_id: 'action:check_signature_role',
          style: ButtonStyle.Success,
          label: 'Check Signature Status',
        },
        {
          type: ComponentType.Button,
          custom_id: 'menu:pronouns',
          style: ButtonStyle.Primary,
          label: 'Pronouns',
        },
      ],
    },
  ],
};

restClient
  .post(Routes.channelMessages(CHANNEL_ID), {
    body: rules,
  })
  .then(console.log);
