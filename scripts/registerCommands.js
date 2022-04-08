const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v10');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = '929216713210355803';
const APPLICATION_ID = '960237321482043424';

const restClient = new REST({
  version: 10,
}).setToken(DISCORD_TOKEN);

/** @type {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody[]} */
const commands = [
  {
    name: 'leaderboard',
    description: 'View the referral leaderboard',
  },
  {
    name: 'position',
    description: 'Get your position on the banner',
  },
];

restClient
  .put(Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID), {
    body: commands,
  })
  .then(console.log);
