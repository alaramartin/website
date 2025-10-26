import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";

interface SearchProps {
    search: string;
    setSearch: (search: string) => void;
}

export default function SearchBar({ search, setSearch }: SearchProps) {
    return (
        <div className="text-center flex items-center justify-center gap-2">
            <input
                type="search"
                id="searchbar"
                maxLength={100}
                placeholder="Search for blog post title or content"
                className="text-textbrown border-2 border-lightred/50 focus:border-darkburgundy focus:outline-none p-1 rounded-xl transition-all duration-50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <label
                htmlFor="searchbar"
                className="text-textbrown cursor-pointer inline-flex items-center p-1"
            >
                <MagnifyingGlassIcon size={18} weight="bold" />
            </label>
        </div>
    );
}
