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
        <div>
            <IconComponent />
            <p>{contact.contactType}</p>
            <Link href={contact.href}>
                {contact.username ? contact.username : contact.href}
            </Link>
        </div>
    );
};

export default ContactLink;
