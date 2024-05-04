import { ChannelType, Client, Guild, Message } from "discord.js";
import { deployCommands } from "../commands/deploy-commands";
import { commands } from "../commands/index";
import { config } from "../config/discord.config";
import * as crypto from "crypto";

class Discord {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: ["Guilds", "GuildMessages", "DirectMessages"],
    });

    this.client.once("ready", this.readyHandler);

    this.client.on("guildAvailable", this.guildCreateHandler);
    this.client.on("interactionCreate", this.interactionCreateHandler);
    this.client.on("messageCreate", this.messsageCreateHandler);

    this.client.login(config.DISCORD_TOKEN);
  }

  private readyHandler = (client: Client) => {
    console.log(`${client.user?.username} is online`);
  };

  private guildCreateHandler = async (guild: Guild) => {
    await deployCommands({ guildId: guild.id });
  };

  private interactionCreateHandler = async (interaction: any) => {
    if (!interaction.isCommand()) {
      return;
    }

    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
      commands[commandName as keyof typeof commands].execute(interaction);
    }
  };

  private messsageCreateHandler = async (message: Message) => {
    if (message.author.bot || !message.guild) {
      return;
    }

    switch (message.channel.type) {
      case ChannelType.GuildText: {
        const mentionsBot = !message.mentions.has(this.client.user!, {
          ignoreEveryone: true,
        });
        if (mentionsBot) {
          return;
        }

        const thread = await message.startThread({
          name: crypto.randomUUID().toString(),
          autoArchiveDuration: 60,
          rateLimitPerUser: 3,
          reason: `Conversation between ${message.author.tag} and ${this.client.user?.tag}`,
        });

        thread.send("message detected!");
        break;
      }

      case ChannelType.PublicThread:
      case ChannelType.PrivateThread: {
        const thread = message.channel;

        thread.send("Message detected!");
        break;
      }

      default: {
        message.channel.send(
          "I'm sorry, I can only reply to text channels and threads."
        );
      }
    }
  };
}

export default Discord;
