"use client";

import type { Event, Guest, Rsvp, Template, User } from "@prisma/client";
import type { QuinceSettings } from "@/types/event-settings";

import { HeroQuince } from "./sections/HeroQuince";
import { QuinceStory } from "./sections/QuinceStory";
import { VenuesQuince } from "./sections/VenuesQuince";
import { CourtOfHonor } from "./sections/CourtOfHonor";
import { DressCodeBloom } from "./sections/DressCodeBloom";
import { GalleryBloom } from "./sections/GalleryBloom";
import { GiftRegistryBloom } from "./sections/GiftRegistryBloom";
import { RsvpBloom } from "./sections/RsvpBloom";

export type BloomProps = {
  event: Event & { template: Template; user: User };
  guest: Guest & { rsvp: Rsvp | null };
};

export function BloomTemplate({ event, guest }: BloomProps) {
  const settings = event.settings as unknown as QuinceSettings;
  const activeSections = (event.activeSections as Record<string, boolean>) ?? {};
  
  // Default soft pink for XV
  const primaryColor = settings.colors?.primary || "#E5A9A9";

  return (
    <div className="min-h-screen font-sans bg-[#FAFAFA] text-[#2c2c2c] selection:bg-[#E5A9A9]/30">
      {activeSections.hero !== false && (
        <HeroQuince
          event={event}
          celebrantName={settings.celebrantName || event.title}
          primaryColor={primaryColor}
          coverImage={settings.coverImage}
        />
      )}

      {activeSections.story !== false && settings.story && (
        <QuinceStory
          story={settings.story}
          primaryColor={primaryColor}
        />
      )}

      {(activeSections.misa !== false || activeSections.fiesta !== false) && (
        <VenuesQuince
          misa={activeSections.misa !== false ? settings.misa : undefined}
          fiesta={activeSections.fiesta !== false ? settings.fiesta : undefined}
          primaryColor={primaryColor}
        />
      )}

      {activeSections.court !== false && settings.court && settings.court.length > 0 && (
        <CourtOfHonor
          court={settings.court}
          primaryColor={primaryColor}
        />
      )}

      {activeSections.gallery !== false && settings.gallery && settings.gallery.length > 0 && (
        <GalleryBloom
          images={settings.gallery}
        />
      )}

      {activeSections.dressCode === true && settings.dressCode && (
        <DressCodeBloom
          data={settings.dressCode}
          colors={settings.colors}
        />
      )}

      {activeSections.giftRegistry === true && settings.giftRegistry && (
        <GiftRegistryBloom
          config={settings.giftRegistry}
          primaryColor={primaryColor}
        />
      )}

      {activeSections.rsvp !== false && (
        <RsvpBloom
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
