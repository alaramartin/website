import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";

interface SearchProps {
    placeholderText: string;
    search: string;
    setSearch: (search: string) => void;
}

export default function SearchBar({
    placeholderText,
    search,
    setSearch,
}: SearchProps) {
    return (
        <div className="text-center flex items-center justify-center gap-2">
            <input
                type="text"
                id="searchbar"
                maxLength={100}
                placeholder={placeholderText}
                aria-label={placeholderText}
                className="text-bodytext border-2 border-lighthighlight/50 focus:border-accent focus:outline-none p-1 rounded-xl transition-all duration-50 w-xl text-center"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
            />
            <label
                htmlFor="searchbar"
                className="text-bodytext cursor-pointer inline-flex items-center p-1"
            >
                <MagnifyingGlassIcon size={18} weight="bold" />
            </label>
            <button
                onClick={() => setSearch("")}
                className={`text-bodytext text-sm inline-flex cursor-pointer m-2 hover:underline rounded-xl`}
            >
                Clear Search
            </button>
        </div>
    );
}
