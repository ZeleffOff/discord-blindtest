import {
	CreatePlayerOptions,
	Kazagumo,
	KazagumoPlayer,
	KazagumoTrack,
} from 'kazagumo';

class Player {
	private kazagumo: Kazagumo;
	private player: KazagumoPlayer | null = null;
	private playerOptions: CreatePlayerOptions;

	constructor(kazagumo: Kazagumo, playerOptions: CreatePlayerOptions) {
		this.kazagumo = kazagumo;
		if (!this.kazagumo) throw Error('Kazagumo Player required.');

		this.playerOptions = playerOptions;
		if (!this.playerOptions) throw Error('Kazagumo Player Options required.');
	}

	async listen(track: KazagumoTrack): Promise<KazagumoTrack> {
		let player = this.player;
		if (!player) player = await this.createPlayer(this.playerOptions);

		if (!track) throw Error(`Kazagumo Track Required.`);

		await player.play(track, { replaceCurrent: true });
		return track;
	}

	public stopListening() {
		if (!this.player)
			throw Error('[Blindtest#stopListening] Error: No player found.');
		this.player.shoukaku.stopTrack();
	}

	private async createPlayer(
		options: CreatePlayerOptions
	): Promise<KazagumoPlayer> {
		if (!options) throw Error('Blindtest#createPlayer options required.');

		this.player = await this.kazagumo.createPlayer(options);
		return this.player;
	}
}

export default Player;
