import { PlayerId } from "../domain/GameState";

export function toLobby(playerId: PlayerId): string {
    return `/lobby?player=${playerId}`;
}