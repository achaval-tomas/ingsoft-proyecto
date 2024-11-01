import { PlayerId } from "../domain/GameState";

export function toInitial(): string {
    return "/";
}

export function toLobby(playerId: PlayerId): string {
    return `/lobby?player=${playerId}`;
}

export function toLobbyList(playerId: PlayerId): string {
    return `/lobbies?player=${playerId}`;
}

export function toPlay(playerId: PlayerId): string {
    return `/play?player=${playerId}`;
}