import React from "react";
import Link from "next/link";

interface ContactLinkProps {
    contact: {
        contactType: string;
        href: string;
        username?: string;
        icon: React.ElementType;
    };
}

const ContactLink = ({ contact }: ContactLinkProps) => {
    const IconComponent = contact.icon;
    return (
        <div className="m-10 flex items-center whitespace-nowrap">
            <div className="flex flex-col items-center text-center mx-3">
                <IconComponent size={24} className="mb-1" />
                <p className="text-sm">{contact.contactType}</p>
            </div>
            <hr
                className="border-r border-lightred h-10 mx-3 opacity-80 bg-transparent"
                style={{ margin: "0 12px", borderRightWidth: "1px" }}
            />
            <Link
                href={contact.href}
                className="underline text-center"
                target="_blank"
                rel="noopener noreferrer"
            >
                {contact.username ?? contact.href}
            </Link>
        </div>
    );
};

export default ContactLink;
