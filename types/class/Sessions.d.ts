import { Collection } from 'discord.js';
type BlindtestSession = {
    songs: string[];
    score: {
        user: string;
        score: number;
    }[];
    stop: () => void;
};
declare class BlindtestSessions extends Collection<string, BlindtestSession> {
}
export default BlindtestSessions;
