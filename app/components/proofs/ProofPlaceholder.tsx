import type { ReactNode } from "react";

// Generic "coming soon" proof card used for adjectives whose real content isn't built yet
// (girl who codes, rock climber, cat petter, sweet treat lover).
export default function ProofPlaceholder({
    icon,
    title,
    blurb,
}: {
    icon: ReactNode;
    title: string;
    blurb: string;
}) {
    return (
        <div className="w-full max-w-md rounded-xl border border-lighthighlight/50 bg-lighthighlight/5 px-6 py-8 text-bodytext">
            <div className="flex items-center gap-3 text-accent">
                <div className="w-7 h-7">{icon}</div>
                <p className="text-xl font-medium">{title}</p>
            </div>
            <p className="pt-3 opacity-80">{blurb}</p>
            <p className="pt-4 text-xs uppercase tracking-widest text-bodytext/40">
                more coming soon
            </p>
        </div>
    );
}
