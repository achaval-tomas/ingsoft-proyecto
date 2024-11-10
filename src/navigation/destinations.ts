import { PlayerId } from "../domain/GameState";

export function toInitial(): string {
    return "/";
}

export function toLobby(lobbyId: string, playerId: PlayerId): string {
    return `/lobby/${lobbyId}?player=${playerId}`;
}

export function toLobbyList(playerId: PlayerId): string {
    return `/lobbies?player=${playerId}`;
}

export function toPlay(playerId: PlayerId): string {
    return `/play?player=${playerId}`;
}