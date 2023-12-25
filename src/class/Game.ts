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
	private gameHost!: GuildMember;
	private gameGuild!: Guild;
	private gameChannel!: TextBasedChannel;
	private gameVoice!: VoiceBasedChannel;

	private currentRound: number = 0;
	private tracks: KazagumoTrack[] = [];

	private pauseDuration: number = 5; // Cooldown in seconds before the start of the next round.
	private listeningDuration: number = 10; // Listening time
	private round: number = 5; // Total round
	private userCooldown: number = 3; // Cooldown when a user gives a response

	/**
	 *
	 * @param interaction - Discord#Interaction | Discord#Message
	 * @param kazagumo - Kazagumo Instance
	 */
	constructor(interaction: Interaction | Message, kazagumo: Kazagumo) {
		this.interaction = interaction;
		if (!this.interaction) throw Error('Interaction not found.');

		this.kazagumo = kazagumo;
	}

	/**
	 * Launch the game and manage the rounds.
	 */
	async start() {
		while (this.round > this.currentRound) {
			const track = this.tracks[this.currentRound];
			await this.gameHandler(track, this.listeningDuration * 1000);

			await this.waitForNextRound(this.pauseDuration * 1000);
			this.currentRound++;
		}
	}

	/**
	 * Waiting time before starting the next round
	 * @param cooldown - Cooldown in seconds.
	 */
	private async waitForNextRound(cooldown: number): Promise<void> {
		this.interaction.channel?.send({
			content: `Prochain round dans \`${cooldown / 1000} secondes\`.`,
		});
		return new Promise((resolve) => setTimeout(resolve, cooldown));
	}

	/**
	 * Game management is done here.
	 * @param track - Track to play
	 * @param listeningDuration - Listening time
	 */
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

	/**
	 * When the user sends a response, they will be given a cooldown.
	 * During this time, his answers will no longer be taken into account.
	 * @param user_id - ID of user
	 * @param cooldown - User Cooldown
	 */
	private manageCooldown(user_id: string, cooldown: number): Boolean {
		if (this.cooldowns.has(user_id)) return false;
		else this.cooldowns.add(user_id);

		setTimeout(() => this.cooldowns.delete(user_id), cooldown);
		return true;
	}

	/**
	 * Blindtest initialization method.
	 * Define all the variables necessary for the smooth running of the game.
	 * @param BlindtestOptions - Options of blindtest.
	 */
	public async init(blindtestOptions: BlindtestOptions): Promise<void> {
		this.checkBlindtestOptions(blindtestOptions);

		this.listeningDuration = blindtestOptions.listeningDuration ?? 30;
		this.pauseDuration = blindtestOptions.pauseDuration ?? 5;
		this.gameHost = this.interaction.member as GuildMember;

		const gameGuild = this.interaction.guild;
		const gameChannel = this.interaction.channel;
		const gameVoice = this.gameHost.voice.channel;

		if (!gameGuild)
			throw Error('The blindtest can only be played within a guild.');
		this.gameGuild = gameGuild;

		if (!gameChannel || gameChannel.type !== ChannelType.GuildText)
			throw Error('The blindtest channel must be have GuildText type.');
		this.gameChannel = gameChannel;

		if (!gameVoice)
			throw Error("Can't start blindtest because VoiceChannel not found.");
		this.gameVoice = gameVoice;

		const playerOptions: CreatePlayerOptions = {
			textId: `${this.gameChannel}`,
			voiceId: `${this.gameVoice.id}`,
			guildId: `${this.gameGuild.id}`,
		};

		this.player = new Player(this.kazagumo, playerOptions);
		this.tracks = await this.checkTracks(blindtestOptions);
		this.round = this.round ?? this.tracks.length;
	}

	/**
	 * Gets music from youtube and checks if they exist.
	 * If the forcePlay option is set to true, and music is not found. It will return an error.
	 * @param blindtestOptions - Options of blindtest
	 */
	private async checkTracks(
		blindtestOptions: BlindtestOptions
	): Promise<KazagumoTrack[]> {
		const tracksResult = await this.fetchSongs(blindtestOptions.songs);
		if (!tracksResult.tracks.length) throw Error('No tracks founded.');
		else if (
			!blindtestOptions.forcePlay &&
			tracksResult.notFoundTracks.length
		) {
			throw Error(
				`One or more songs could not be found.\n- Tracks not found: ${tracksResult.notFoundTracks.join(
					', '
				)}`
			);
		}

		return tracksResult.tracks;
	}

	/**
	 * Check if options of blindtest is valid.
	 * @param blindtestOptions - Options of blindtest
	 */
	private checkBlindtestOptions(
		blindtestOptions: BlindtestOptions
	): BlindtestOptions {
		if (!blindtestOptions) throw Error('Blindtest options required.');
		else if (!blindtestOptions.songs.length) throw Error('Songs required.');
		else if (
			blindtestOptions.round &&
			blindtestOptions.songs.length < blindtestOptions.round
		)
			throw Error('Nombre de round supérieur au nombre de musique.');

		return blindtestOptions;
	}

	/**
	 * Search for BlindtestOptions#songs music from youtube.
	 * Returns found and unfound music.
	 * @param tracks - List of music played
	 */
	private async fetchSongs(
		tracks: string[]
	): Promise<{ tracks: KazagumoTrack[]; notFoundTracks: string[] }> {
		const fetchedTracks: KazagumoTrack[] = [];
		const noFetchedTracks: string[] = [];

		for (let i = 0; i < tracks.length; i++) {
			const result = await this.kazagumo.search(tracks[i]);
			const track = result.tracks[0];

			if (!track) {
				noFetchedTracks.push(tracks[i]);
				continue;
			}

			fetchedTracks.push(track);
		}

		return { tracks: fetchedTracks, notFoundTracks: noFetchedTracks };
	}
}

export default Game;
