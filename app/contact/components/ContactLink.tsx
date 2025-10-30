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
        <div className="m-10 inline-flex whitespace-nowrap items-center">
            <div className="justify-items-center">
                <IconComponent size={18} />
                <p>{contact.contactType}</p>
            </div>
            <hr className="border-lightred border-r h-10 m-3 opacity-80" />
            <Link href={contact.href} className={`underline`} target="_blank">
                {contact.username ? contact.username : contact.href}
            </Link>
        </div>
    );
};

export default ContactLink;
