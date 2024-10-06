import { PlayerId } from "../domain/GameState";

export function toInitial(): string {
    return "/";
}

export function toLobby(playerId: PlayerId): string {
    return `/lobby?player=${playerId}`;
}

export function toHome(playerId: PlayerId): string {
    return `/home?player=${playerId}`;
}