"use client";

import type { Event, Guest, Rsvp, Template, User } from "@prisma/client";
import type { BirthdaySettings } from "@/types/event-settings";

import { HeroBirthday } from "./sections/HeroBirthday";
import { AboutSection } from "./sections/AboutSection";
import { VenueCard } from "./sections/VenueCard";
import { GalleryBirthday } from "./sections/GalleryBirthday";
import { DressCodeBirthday } from "./sections/DressCodeBirthday";
import { WishListSection } from "./sections/WishListSection";
import { RsvpBirthday } from "./sections/RsvpBirthday";

export type ConfettiProps = {
  event: Event & { template: Template; user: User };
  guest: Guest & { rsvp: Rsvp | null };
};

export function ConfettiTemplate({ event, guest }: ConfettiProps) {
  const settings = event.settings as unknown as BirthdaySettings;
  const activeSections = (event.activeSections as Record<string, boolean>) ?? {};
  const primaryColor = settings.colors?.primary || "#FF6B6B";

  return (
    <div className="min-h-screen font-sans bg-[#FFFBF5] text-[#1A1A1A]">
      {activeSections.hero !== false && (
        <HeroBirthday
          event={event}
          celebrantName={settings.celebrantName || event.title}
          celebrantAge={settings.celebrantAge ?? 0}
          primaryColor={primaryColor}
        />
      )}

      {activeSections.about !== false && (
        <AboutSection
          celebrantName={settings.celebrantName || event.title}
          bio={settings.bio ?? ""}
          funFacts={settings.funFacts ?? []}
          primaryColor={primaryColor}
        />
      )}

      {activeSections.venue !== false && settings.venue && (
        <VenueCard venue={settings.venue} primaryColor={primaryColor} />
      )}

      {activeSections.gallery !== false && (
        <GalleryBirthday
          images={settings.gallery ?? []}
          primaryColor={primaryColor}
        />
      )}

      {activeSections.dressCode === true && settings.dressCode && (
        <DressCodeBirthday data={settings.dressCode} primaryColor={primaryColor} />
      )}

      {activeSections.wishList !== false && (settings.wishList?.length ?? 0) > 0 && (
        <WishListSection wishList={settings.wishList} primaryColor={primaryColor} />
      )}

      {activeSections.rsvp !== false && (
        <RsvpBirthday
          guest={guest}
          eventSlug={event.slug}
          guestToken={guest.uniqueToken}
          primaryColor={primaryColor}
          celebrantName={settings.celebrantName || event.title}
        />
      )}
    </div>
  );
}
