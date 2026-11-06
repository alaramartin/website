// The ways to reach Alara, in the order me.alaramartin.com/contact lists them.
export type Contact = { label: string; handle: string; href: string };

export const CONTACTS: Contact[] = [
    { label: "Email", handle: "me@alaramartin.com", href: "mailto:me@alaramartin.com" },
    { label: "LinkedIn", handle: "alara-martin", href: "https://linkedin.com/in/alara-martin" },
    { label: "GitHub", handle: "alaramartin", href: "https://github.com/alaramartin" },
    { label: "X", handle: "alara_martin_", href: "https://x.com/alara_martin_" },
    { label: "Discord", handle: "alarm", href: "https://discord.com/users/808795298587213824" },
];

export const external = (href: string) =>
    href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" };
