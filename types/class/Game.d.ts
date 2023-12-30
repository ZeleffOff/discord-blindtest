import { Kazagumo, KazagumoTrack } from 'kazagumo';
import { Interaction, Message } from 'discord.js';
import { BlindtestOptions } from '../../types/types';
import BlindtestSessions from './Sessions';
declare class Game {
    private readonly interaction;
    private readonly kazagumo;
    private cooldowns;
    sessions: BlindtestSessions;
    private score;
    private player;
    private gameHost;
    private gameGuild;
    private gameChannel;
    private gameVoice;
    private tracks;
    private pauseDuration;
    private listeningDuration;
    private userCooldown;
    totalRound: number;
    currentRound: number;
    private trackDataFound;
    /**
     *
     * @param interaction - Discord#Interaction | Discord#Message
     * @param kazagumo - Kazagumo Instance
     */
    constructor(interaction: Interaction | Message, kazagumo: Kazagumo);
    /**
     * Launch the game and manage the rounds.
     */
    start(): Promise<void>;
    private sendResponse;
    /**
     * Stop the blindtest and send score.
     * @param sendScore
     */
    stop(sendScore: boolean): {
        userId: string;
        score: number;
    }[];
    /**
     * Waiting time before starting the next round
     * @param cooldown - Cooldown in seconds.
     */
    private waitForNextRound;
    /**
     * Game management is done here.
     * @param track - Track to play
     * @param listeningDuration - Listening time
     */
    private gameHandler;
    private checkAnswer;
    private updateScore;
    private checkSimilarity;
    /**
     * When the user sends a response, they will be given a cooldown.
     * During this time, his answers will no longer be taken into account.
     * @param user_id - ID of user
     * @param cooldown - User Cooldown
     */
    private manageCooldown;
    /**
     * Blindtest initialization method.
     * Define all the variables necessary for the smooth running of the game.
     * @param BlindtestOptions - Options of blindtest.
     */
    init(blindtestOptions: BlindtestOptions): Promise<void>;
    /**
     * Gets music from youtube and checks if they exist.
     * If the forcePlay option is set to true, and music is not found. It will return an error.
     * @param blindtestOptions - Options of blindtest
     */
    private checkTracks;
    /**
     * Check if options of blindtest is valid.
     * @param blindtestOptions - Options of blindtest
     */
    private checkBlindtestOptions;
    /**
     * Search for BlindtestOptions#songs music from youtube.
     * Returns found and unfound music.
     * @param tracks - List of music played
     */
    private fetchSongs;
    get leaderboard(): {
        userId: string;
        score: number;
    }[];
    get currentTrack(): KazagumoTrack;
}
export default Game;
