import {Client, GuildMember, Options} from 'discord.js';
import 'dotenv/config';

import {Database} from './db';

const ROLE_MENUS = [
  {
    name: 'pronouns',
    text: 'Select your pronouns from the dropdown below',
    roles: [
      {
        name: 'He/Him',
        id: '960334072905867304',
      },
      {
        name: 'She/Her',
        id: '960334104811929670',
      },
      {
        name: 'They/Them',
        id: '960334135870771270',
      },
      {
        name: 'Ask Pronouns',
        id: '960334670380285982',
      },
    ],
  },
];

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

  client.on('ready', () => console.log('Ready'));

  client.on('interactionCreate', async i => {
    if (!i.inGuild() || !i.member) {
      return;
    }

    switch (i.type) {
      case 'MESSAGE_COMPONENT': {
        const member = i.member as GuildMember;
        if (i.isButton()) {
          const [kind, ...state] = i.customId.split(':');
          switch (kind) {
            case 'menu': {
              const menuName = state[0];
              const menu = ROLE_MENUS.find(m => m.name === menuName);
              if (!menu) {
                return;
              }

              await i.reply({
                ephemeral: true,
                content: menu.text,
                components: [
                  {
                    type: 'ACTION_ROW',
                    components: [
                      {
                        type: 'SELECT_MENU',
                        customId: `roles:${menu.name}`,
                        minValues: 0,
                        maxValues: menu.roles.length,
                        options: menu.roles.map(r => ({
                          label: r.name,
                          value: r.id,
                          default: member.roles.cache.has(r.id),
                        })),
                      },
                    ],
                  },
                ],
              });
              return;
            }

            case 'action': {
              switch (state[0]) {
                case 'check_signature_role': {
                  if (member.roles.cache.has(process.env.SIGNATURE_ROLE)) {
                    await i.reply({
                      content:
                        ':white_check_mark: You already have the signature role!',
                      ephemeral: true,
                    });

                    return;
                  }

                  const hasSigned = await db.checkIfUserSigned(
                    i.member!.user.id
                  );
                  if (hasSigned) {
                    await member.roles.add(process.env.SIGNATURE_ROLE);
                  }

                  await i.reply({
                    content: hasSigned
                      ? ':white_check_mark: Thank you for signing! You have been giving the signature role!'
                      : ":x: You haven't signed the banner! Head over to https://thankyoudiscord.com to sign it and receive your role",
                    ephemeral: true,
                  });

                  return;
                }
              }
            }
          }

          return;
        }

        if (i.isSelectMenu()) {
          const [kind, ...state] = i.customId.split(':');
          switch (kind) {
            case 'roles': {
              const menuName = state[0];
              const menu = ROLE_MENUS.find(m => m.name === menuName);

              if (!menu) {
                return;
              }

              const origRoles = [...member.roles.cache.keys()];
              const allMenuRoles = menu.roles.map(r => r.id);

              const remvRoles = allMenuRoles.filter(
                r => !i.values.includes(r) && origRoles.includes(r)
              );
              const addRoles = allMenuRoles.filter(
                r => i.values.includes(r) && !origRoles.includes(r)
              );

              const roleDiff = Array.from(
                new Set(
                  origRoles.concat(i.values).filter(r => !remvRoles.includes(r))
                )
              );

              await member.roles.set(roleDiff);

              const msg = ['Roles Updated!'];
              if (addRoles.length) {
                msg.push(
                  `**Added Roles**:\n${addRoles
                    .map(r => `<@&${r}>`)
                    .join('\n')}`
                );
              }

              if (remvRoles.length) {
                msg.push(
                  `**Removed Roles**:\n${remvRoles
                    .map(r => `<@&${r}>`)
                    .join('\n')}`
                );
              }

              await i.reply({
                ephemeral: true,
                content:
                  msg.length === 1
                    ? ':x: Roles left unchanged'
                    : msg.join('\n\n'),
              });
            }
          }
        }
        break;
      }

      case 'APPLICATION_COMMAND': {
        if (!i.isCommand()) {
          return;
        }

        const cmdName = i.commandName;
        switch (cmdName) {
          case 'leaderboard': {
            const leaderboardSize = 10;

            const user = i.user.id;
            const lead = await db.topNReferralsIncludingUser(
              leaderboardSize,
              user
            );

            const you = lead.find(l => l.userid === user);
            let youGTlen = false;
            if (you) {
              if (you.position > leaderboardSize + 1) {
                lead.pop();
                youGTlen = true;
              }
            }

            const msg = lead.map(u =>
              u.userid === i.user.id
                ? `**${u.position.toLocaleString()}. ${u.username}#${
                    u.discriminator
                  }** (**${u.referralcount}**)`
                : `**${u.position.toLocaleString()}.** ${u.username}#${
                    u.discriminator
                  } (**${u.referralcount}**)`
            );

            if (you) {
              if (youGTlen) {
                msg.push(
                  '...',
                  `**${you.position.toLocaleString()}. ${you.username}#${
                    you.discriminator
                  }** (**${you.referralcount}**)`
                );
              }
            } else {
              msg.push('', "You haven't referred anyone!");
            }

            await i.reply({
              content: '**-- Referral Leaderboard --**\n' + msg.join('\n'),
            });

            break;
          }

          case 'position': {
            const position = await db.getUserPosition(i.user.id);

            if (!position) {
              await i.reply({
                content:
                  ":x: You haven't signed the banner yet! Head over to <https://thankyoudiscord.com> to sign the banner, and try running the command again",
                ephemeral: true,
              });

              return;
            }

            const pluralRules = new Intl.PluralRules('en-US', {
              type: 'ordinal',
            });
            const ordinalToCardinal = (n: number) =>
              n.toLocaleString() +
              {
                zero: '',
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                many: '',
              }[pluralRules.select(n)];

            await i.reply({
              content: `You are **${ordinalToCardinal(
                position
              )}** on the banner`,
            });
            break;
          }
        }
      }
    }
  });

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
