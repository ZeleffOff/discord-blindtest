import { SpotifyOptions } from 'kazagumo-spotify/dist/Plugin';
import { NodeOption } from 'shoukaku';

/**
 * Options for Blindtest class.
 */
export type Options = {
	spotifyCredentials: SpotifyOptions;
	nodes: NodeOption[];
	messages: BlindtestMessages;
};

/**
 * Blindtest messages
 */
type BlindtestMessages = {
	nextRoundCooldownMessage: string;
	foundedDataMessage: string;
};

/**
 * Game options.
 */
type GameOptions = {
	/** Listening song duration in seconds.
	 * - default: 30 seconds
	 */
	listeningDuration: number;

	/** Duration of the break before starting the next round in seconds.
	 * - default: 5 seconds
	 */
	pauseDuration: number;

	/** Cooldown duration when a user gives a response in seconds.
	 * - default: 3 seconds
	 */
	userCooldown: number;
};

/**
 * Blindtest options.
 */
export type BlindtestOptions = {
	/**
	 * Array of URL links of songs.
	 * - The number of songs in the list determines the number of rounds the blindtest will have.
	 */
	songs: string[];

	/**
	 * If a music from the songs[] list is not found.
	 * - true - Run the blindtest anyway.
	 * - false - Returns an error.
	 */
	forcePlay?: boolean;
} & Partial<GameOptions>;

/**
 * Game score.
 */
type Score = {
	[k: string]: number;
};
