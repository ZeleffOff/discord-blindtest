import { Kazagumo } from 'kazagumo';
import Spotify from 'kazagumo-spotify';
import { Connectors, NodeOption } from 'shoukaku';
import { BlindtestOptions, Options } from '../types/Blindtest';
import { Client, Interaction, Message } from 'discord.js';
import Game from './Game';

class Blindtest {
	private readonly client: Client;
	private readonly kazagumo: Kazagumo;
	private readonly options: Options;

	/**
	 * @param client - Discord#Client
	 * @param nodes - Array of Lavalink nodes
	 * @param kazagumo - If your project already has an instance of kazagumo
	 */
	constructor(client: Client, options: Options, kazagumo?: Kazagumo) {
		this.client = client;
		this.options = options;

		this.kazagumo =
			kazagumo ??
			new Kazagumo(
				{
					defaultSearchEngine: 'spotify',
					plugins: [new Spotify(this.options.spotifyCredentials)],
					send: (guildId, payload) => {
						const guild = client.guilds.cache.get(guildId);
						if (guild) guild.shard.send(payload);
					},
				},
				new Connectors.DiscordJS(this.client),
				this.options.nodes
			);
	}

	public async createGame(
		interaction: Interaction | Message,
		blindtestOptions: BlindtestOptions
	) {
		try {
			const game = new Game(interaction, this.kazagumo);
			await game.init(blindtestOptions);

			return game;
		} catch (error) {
			console.error('[Blindtest#start]', error);
		}
	}
}

export default Blindtest;
