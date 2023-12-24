import { NodeOption } from 'shoukaku';

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

export type BlindtestOptions = {
	/**
	 * Array of URL links of songs.
	 * - The number of songs in the list determines the number of rounds the blindtest will have.
	 */
	songs: string[];

	/**
	 * Enforcing a specific number of rounds.
	 * - Caution: If the number of rounds exceeds the number of songs, it will result in errors.
	 */
	round?: number;
} & Partial<GameOptions>;
