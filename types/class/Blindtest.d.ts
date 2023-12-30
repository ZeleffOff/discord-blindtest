import { Kazagumo } from 'kazagumo';
import { BlindtestOptions, Options } from '../../types/types';
import { Client, Interaction, Message } from 'discord.js';
import Game from './Game';
declare class Blindtest {
    private readonly client;
    private readonly kazagumo;
    private readonly options;
    /**
     * @param client - Discord#Client
     * @param nodes - Array of Lavalink nodes
     * @param kazagumo - If your project already has an instance of kazagumo
     */
    constructor(client: Client, options: Options, kazagumo?: Kazagumo);
    createGame(interaction: Interaction | Message, blindtestOptions: BlindtestOptions): Promise<Game | undefined>;
}
export default Blindtest;
