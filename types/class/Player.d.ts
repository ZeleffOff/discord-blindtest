import { CreatePlayerOptions, Kazagumo, KazagumoTrack } from 'kazagumo';
declare class Player {
    private kazagumo;
    private player;
    private playerOptions;
    constructor(kazagumo: Kazagumo, playerOptions: CreatePlayerOptions);
    listen(track: KazagumoTrack): Promise<KazagumoTrack>;
    stopListening(destroy: boolean): void;
    private createPlayer;
}
export default Player;
