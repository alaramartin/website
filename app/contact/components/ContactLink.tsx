import React from "react";
import Link from "next/link";
import { mono } from "@/app/ui/fonts";
import StemDivider from "./StemDivider";
import type { PlantVariant } from "@/app/projects/components/TimelinePlant";

interface ContactLinkProps {
    contact: {
        contactType: string;
        href: string;
        username?: string;
        icon: React.ElementType;
    };
    // which plant the divider sprouts; the page alternates them
    variant: PlantVariant;
    // grow-on-view stagger for touch screens
    delay?: number;
}

const ContactLink = ({ contact, variant, delay }: ContactLinkProps) => {
    const IconComponent = contact.icon;
    return (
        <div
            data-sprig-host
            className="my-6 lg:m-10 flex lg:flex-row items-center w-full lg:w-auto"
        >
            <div className="flex flex-col items-center text-center justify-center mx-3 max-lg:w-1/8 text-accent">
                <IconComponent size={24} className="mb-1" />
                <p className={`text-sm ${mono.className}`}>
                    {contact.contactType}
                </p>
            </div>
            <StemDivider variant={variant} delay={delay} />
            <div className="flex max-lg:justify-start max-lg:w-3/4">
                <Link
                    href={contact.href}
                    className="link text-center text-bodytext"
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
