import { useState } from "react";

export interface LobbyElement {
    min_players: number;
    max_players: number;
    lobby_owner: string;
    players: string;
    lobby_id: string;
    lobby_name: string;
    player_amount: number;
}

interface LobbyListProps {
    joinHandler: (id: string) => void;
    lobbyList: LobbyElement[];
    onSearch: (searchQuery: string) => void
}

export default function LobbyList({ lobbyList, joinHandler, onSearch }: LobbyListProps) {
    const [searchQuery, setSearchQueryState] = useState<string>("")
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const search = e.target.value;
        setSearchQueryState(search);
        onSearch && onSearch(search)
        console.log(search)
    }

    console.log(lobbyList)
    const items = lobbyList.map(lobby =>
        <tr
            className="my-2 p-2 border"
            key={lobby.lobby_id}
        >
            <td className="text-center">{lobby.lobby_name}</td>
            <td className="text-center">{lobby.player_amount}</td>
            <td>
                <button
                    className="p-1 rounded bg-primary-600 hover:bg-primary-500"
                    onClick={() => joinHandler(lobby.lobby_id)}
                >
                    Unirse
                </button>
            </td>
        </tr>,
    );

    return  <div>
        {/* this input might be in another component with the one that filters by player amount */}
            <input
                className="mr-2 p-2 border rounded-md w-80"
                type="text"
                placeholder="Buscar sala"
                value={searchQuery}
                onChange={handleChange}
            />
            <table className="w-screen">
                <thead>
                    <tr>
                        <th>Nombre de la sala</th>
                        <th>Cantidad de jugadores</th>
                    </tr>
                </thead>
                <tbody>
                    {items}
                </tbody>
            </table>
            </div>;
}
