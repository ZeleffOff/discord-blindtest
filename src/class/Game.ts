import { CreatePlayerOptions, Kazagumo, KazagumoTrack } from 'kazagumo';
import {
	ChannelType,
	Guild,
	GuildMember,
	Interaction,
	Message,
	TextBasedChannel,
	VoiceBasedChannel,
} from 'discord.js';
import Player from './Player';
import { BlindtestOptions } from '../types/Blindtest';

class Game {
	private readonly interaction: Interaction | Message;
	private readonly kazagumo: Kazagumo;
	private cooldowns: Set<string> = new Set();

	private player!: Player;
	private gameHost!: GuildMember | null;
	private gameGuild!: Guild | null;
	private gameChannel!: TextBasedChannel | null;
	private gameVoice!: VoiceBasedChannel | null;

	private currentRound: number = 0;
	private tracks: KazagumoTrack[] = [];

	private pauseDuration: number = 5; // Break time before the start of the next round
	private listeningDuration: number = 10; // Listening time
	private round: number = 5; // Total round
	private userCooldown: number = 3; // Cooldown when a user gives a response

	constructor(interaction: Interaction | Message, kazagumo: Kazagumo) {
		this.interaction = interaction;
		if (!this.interaction) throw Error('Interaction not found.');

		this.kazagumo = kazagumo;
	}

	async start() {
		while (this.round > this.currentRound) {
			const track = this.tracks[this.currentRound];
			await this.gameHandler(track, this.listeningDuration * 1000);

			await this.waitForNextRound(this.pauseDuration * 1000);
			this.currentRound++;
		}
	}

	private async waitForNextRound(cooldown: number): Promise<void> {
		this.interaction.channel?.send({
			content: `Prochain round dans \`${cooldown / 1000} secondes\`.`,
		});
		return new Promise((resolve) => setTimeout(resolve, cooldown));
	}

	private async gameHandler(
		track: KazagumoTrack,
		listeningDuration: number
	): Promise<void> {
		await this.player.listen(track);

		const collector = this.gameChannel?.createMessageCollector({
			filter: (i) => {
				// Anti bot
				if (i.author.bot || !i.member?.voice.channel) return false;

				// Anti spam
				this.manageCooldown(i.author.id, this.userCooldown * 1000);

				return true;
			},
			time: listeningDuration,
		});

		return new Promise((resolve) => {
			collector?.on('collect', (message) => {
				if (message.content === 'test') message.reply('passed.');
			});

			collector?.on('end', () => {
				this.player.stopListening();
				resolve();
			});
		});
	}

	private manageCooldown(user_id: string, cooldown: number) {
		if (this.cooldowns.has(user_id)) return false;
		else this.cooldowns.add(user_id);

		setTimeout(() => this.cooldowns.delete(user_id), cooldown);
	}

	public async init(blindtestOptions: BlindtestOptions): Promise<void> {
		if (!blindtestOptions) throw Error('Blindtest options required.');
		else if (!blindtestOptions.songs.length) throw Error('Songs required.');
		else if (
			blindtestOptions.round &&
			blindtestOptions.songs.length < blindtestOptions.round
		)
			throw Error('Nombre de round supérieur au nombre de musique.');

		this.listeningDuration = blindtestOptions.listeningDuration ?? 30;
		this.pauseDuration = blindtestOptions.pauseDuration ?? 5;
		this.gameHost = this.interaction.member as GuildMember;

		this.gameGuild = this.interaction.guild;
		if (!this.gameGuild)
			throw Error('The blindtest can only be played within a guild.');

		this.gameChannel = this.interaction.channel;
		if (!this.gameChannel || this.gameChannel.type !== ChannelType.GuildText)
			throw Error('The blindtest channel must be have GuildText type.');

		this.gameVoice = this.gameHost.voice.channel;
		if (!this.gameVoice)
			throw Error("Can't start blindtest because VoiceChannel not found.");

		const options: CreatePlayerOptions = {
			textId: `${this.gameChannel}`,
			voiceId: `${this.gameVoice.id}`,
			guildId: `${this.gameGuild.id}`,
		};

		this.player = new Player(this.kazagumo, options);
		this.tracks = await this.fetchSongs(blindtestOptions.songs);
		this.round = this.round ?? this.tracks.length;
	}

	private async fetchSongs(tracks: string[]): Promise<KazagumoTrack[]> {
		const fetchedTracks: KazagumoTrack[] = [];

		for (let i = 0; i < tracks.length; i++) {
			const result = await this.kazagumo.search(tracks[i]);
			const track = result.tracks[0];

			if (!track) continue;
			fetchedTracks.push(track);
		}

		return fetchedTracks;
	}
}

export default Game;
