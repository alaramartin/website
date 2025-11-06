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
        <div className="my-6 md:my-10 lg:m-10 flex lg:flex-row items-center w-full">
            <div className="flex flex-col items-center text-center justify-center mx-3 max-lg:w-1/8">
                <IconComponent size={24} className="mb-1" />
                <p className="text-sm">{contact.contactType}</p>
            </div>
            <div className="h-12 border-r border-lightred opacity-80 mx-4" />
            <div className="flex max-lg:justify-start max-lg:w-3/4">
                <Link
                    href={contact.href}
                    className="underline text-center"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {contact.username ?? contact.href}
                </Link>
            </div>
        </div>
    );
};

export default ContactLink;
