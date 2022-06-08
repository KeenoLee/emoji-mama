import { Request, Response } from 'express';
import { PlayerService } from './playerService';

export class PlayerController {
    private playerService: PlayerService;
    constructor(playerService: PlayerService) {
        this.playerService = playerService;
    }

    record = async (req: Request, res: Response) => {
        let { playerName, score } = req.body;
        if (!playerName) {
            res.status(400).json({ error: 'missing player name' });
            return;
        }
        // any limitation imposed on the player name??????????

        this.playerService.record(playerName, score);
    }
}