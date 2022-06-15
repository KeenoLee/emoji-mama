import { Request, Response } from 'express';
import { PlayerService } from './playerService';

export class PlayerController {
    private playerService: PlayerService;
    constructor(playerService: PlayerService) {
        this.playerService = playerService;
    }

    record = async (req: Request, res: Response) => {
        let { playerName, playerScore } = req.body;
        if (!playerName) {
            res.status(400).json({ error: 'missing player name' });
            return;
        }
        // any limitation imposed on the player name??????????

        this.playerService.record(playerName, playerScore);
    }

    getTopTenPlayers = async (req: Request, res: Response) => {
        let topTen = await this.playerService.getTopTenPlayers();
        // console.log(topTen);
        res.json({ "topTen": topTen });
    }
}