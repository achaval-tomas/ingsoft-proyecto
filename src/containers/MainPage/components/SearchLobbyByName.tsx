import { useState } from "react";
import FilledButton from "../../../components/FilledButton";

export interface SearchLobbyByNameProps {
    onSearch: (searchQuery: string) => void;
}

export default function SearchLobbyByName({ onSearch }: SearchLobbyByNameProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        onSearch(searchQuery);
    };

    return (
        <div className="flex items-center mb-4">
            <input
                type="text"
                placeholder="Buscar sala"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mr-2 p-2 border rounded-md w-80"
            />
            <FilledButton onClick={handleSearch}>
                <p>Buscar</p>
            </FilledButton>
        </div>
    );
}


