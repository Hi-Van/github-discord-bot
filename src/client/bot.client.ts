import { Client, Guild } from "discord.js";
import { deployCommands } from "../commands/deploy-commands";
import { commands } from "../commands/index";
import { config } from "../config/discord.config";

class Discord {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: ["Guilds", "GuildMessages", "DirectMessages"],
    });

    this.client.once("ready", this.readyHandler);
    this.client.on("guildAvailable", this.guildCreateHandler);
    this.client.on("interactionCreate", this.interactionCreateHandler);

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
}

export default Discord;
