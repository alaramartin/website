interface NotesProps {
    notes: string[];
    // left-side timeline cards are right-aligned on desktop, so their bullets
    // are mirrored onto the right edge to line up with the rest of the card
    side?: "left" | "right";
}

export default function Notes({ notes, side = "right" }: NotesProps) {
    return (
        <ul className="italic my-4 text-bodytext/70 space-y-0.5">
            {notes.map((note, index) => {
                return (
                    <li
                        key={note.substring(0, 3) + index}
                        className={`flex gap-2 ${
                            side === "left" ? "md:flex-row-reverse" : ""
                        }`}
                    >
                        <span aria-hidden="true">•</span>
                        <span>{note}</span>
                    </li>
                );
            })}
        </ul>
    );
}
