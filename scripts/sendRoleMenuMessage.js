const {config} = require('dotenv');
const {ComponentType, ButtonStyle, Routes} = require('discord-api-types/v10');
const {REST} = require('@discordjs/rest');
const path = require('path');

config({path: path.join(process.cwd(), '.env'), override: true});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '960300029975871538';

const restClient = new REST({
  version: 10,
}).setToken(DISCORD_TOKEN);

/** @type {import('discord-api-types/v10').RESTPostAPIChannelMessageJSONBody} */
const mainMenu = {
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

/** @type {import('discord-api-types/v10').RESTPostAPIChannelMessageJSONBody[]} */
const menus = [mainMenu];

for (const menu of menus) {
  restClient
    .post(Routes.channelMessages(CHANNEL_ID), {
      body: menu,
    })
    .then(console.log);
}
