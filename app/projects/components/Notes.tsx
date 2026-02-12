interface NotesProps {
    notes: string[];
}

export default function Notes({ notes }: NotesProps) {
    return (
        <ul className="list-disc list-inside italic mx-6 md:mx-20 my-6 text-bodytext/70">
            {notes.map((note, index) => {
                return <li key={note.substring(0, 3) + index}>{note}</li>;
            })}
        </ul>
    );
}
