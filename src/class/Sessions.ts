import { Collection } from 'discord.js';
import Blindtest from './Blindtest';
type BlindtestSession = {
	songs: string[];
	score: { user: string; score: number }[];
	stop: () => void;
};

class BlindtestSessions extends Collection<string, BlindtestSession> {}

export default BlindtestSessions;
