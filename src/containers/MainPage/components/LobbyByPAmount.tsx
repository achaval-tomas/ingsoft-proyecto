import { useState } from "react";
import FilledButton from "../../../components/FilledButton";

type SearchProps = {
    onSearch: (searchQuery: number | "") => void;
}

function SearchLobbyByPlayerAmount({ onSearch }: SearchProps) {
    const [searchQuery, setSearchQueryState] = useState<number | "">("");

    const handleSearch = () => {
        onSearch(searchQuery);
    };

    return (
        <div className="flex items-center mb-4">
            <input
                type="number"
                placeholder="Buscar sala"
                value={searchQuery}
                onChange={(e) => setSearchQueryState(parseInt(e.target.value))}
                className="mr-2 p-2 border rounded-md w-80"
            />
            <FilledButton onClick={handleSearch}>
                <p>Buscar</p>
            </FilledButton>
        </div>
    );
}

export default SearchLobbyByPlayerAmount;