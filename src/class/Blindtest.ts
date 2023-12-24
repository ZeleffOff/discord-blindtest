import { Client, Interaction, Message } from 'discord.js';
import { Connectors, NodeOption } from 'shoukaku';
import { Kazagumo } from 'kazagumo';
import { BlindtestOptions } from '../types/Blindtest';
import BlindtestSessions from './Sessions';
import Game from './Game';

class Blindtest {
	private readonly client: Client;
	private readonly kazagumo: Kazagumo;
	private readonly nodes: NodeOption[];
	private cooldowns: Set<string> = new Set();

	public sessions: BlindtestSessions = new BlindtestSessions();

	/**
	 * @param client - Discord#Client
	 * @param nodes - Array of Lavalink nodes
	 * @param kazagumo - If your project already has an instance of kazagumo
	 */
	constructor(client: Client, nodes: NodeOption[], kazagumo?: Kazagumo) {
		this.client = client;
		this.nodes = nodes;

		this.kazagumo =
			kazagumo ??
			new Kazagumo(
				{
					defaultSearchEngine: 'youtube',
					send: (guildId, payload) => {
						const guild = client.guilds.cache.get(guildId);
						if (guild) guild.shard.send(payload);
					},
				},
				new Connectors.DiscordJS(this.client),
				this.nodes
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
			console.error('[Blindtest#start] Error:', error);
		}
	}
}

export default Blindtest;
