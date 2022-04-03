import {Client, Options} from 'discord.js';
import 'dotenv/config';

import {Database} from './db';

const main = async () => {
  const client = new Client({
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES'],
    makeCache: Options.cacheWithLimits({
      ApplicationCommandManager: 0,
      BaseGuildEmojiManager: 0,
      GuildBanManager: 0,
      GuildInviteManager: 0,
      GuildStickerManager: 0,
      MessageManager: 0,
      PresenceManager: 0,
      ReactionManager: 0,
      ReactionUserManager: 0,
      StageInstanceManager: 0,
      ThreadManager: 0,
      ThreadMemberManager: 0,
      UserManager: 0,
      VoiceStateManager: 0,
    }),
  });

  const db = new Database();
  await db.connect();

  client.on('guildMemberAdd', async m => {
    if (m.user.bot) {
      return;
    }

    const hasSigned = await db.checkIfUserSigned(m.user.id);
    if (hasSigned) {
      await m.roles.add(process.env.SIGNATURE_ROLE);
    }
  });

  client.login();
};

main().catch(console.error);
