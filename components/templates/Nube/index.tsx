"use client";

import type { Event, Guest, Rsvp, Template, User } from "@prisma/client";
import type { BabyShowerSettings } from "@/types/event-settings";

import { HeroBaby } from "./sections/HeroBaby";
import { ParentsSection } from "./sections/ParentsSection";
import { ThemeSection } from "./sections/ThemeSection";
import { VenueBaby } from "./sections/VenueBaby";
import { GalleryBaby } from "./sections/GalleryBaby";
import { WishListBaby } from "./sections/WishListBaby";
import { RsvpBaby } from "./sections/RsvpBaby";

export type NubeProps = {
  event: Event & { template: Template; user: User };
  guest: Guest & { rsvp: Rsvp | null };
};

export function NubeTemplate({ event, guest }: NubeProps) {
  const settings = event.settings as unknown as BabyShowerSettings;
  const activeSections = (event.activeSections as Record<string, boolean>) ?? {};
  
  // Default soft baby blue
  const primaryColor = settings.colors?.primary || "#A2C4C9";

  return (
    <div className="min-h-screen font-sans bg-white text-[#2c3e50] selection:bg-[#A2C4C9]/30">
      {activeSections.hero !== false && (
        <HeroBaby
          event={event}
          parentNames={settings.parentNames || { mom: "Mamá", dad: "Papá" }}
          babyName={settings.babyName}
          primaryColor={primaryColor}
          coverImage={settings.coverImage}
        />
      )}

      {activeSections.parents !== false && (
        <ParentsSection
          parentNames={settings.parentNames || { mom: "Mamá", dad: "Papá" }}
          babyName={settings.babyName}
          primaryColor={primaryColor}
        />
      )}

      {activeSections.theme !== false && settings.theme && (
        <ThemeSection
          theme={settings.theme}
          colors={settings.colors}
          dressCode={settings.dressCode}
          primaryColor={primaryColor}
        />
      )}

      {activeSections.venue !== false && settings.venue && (
        <VenueBaby
          venue={settings.venue}
          event={event}
          primaryColor={primaryColor}
        />
      )}

      {activeSections.gallery !== false && settings.gallery && settings.gallery.length > 0 && (
        <GalleryBaby
          images={settings.gallery}
        />
      )}

      {activeSections.wishList !== false && settings.wishList && settings.wishList.length > 0 && (
        <WishListBaby
          wishList={settings.wishList}
          primaryColor={primaryColor}
        />
      )}

      {activeSections.rsvp !== false && (
        <RsvpBaby
          guest={guest}
          eventSlug={event.slug}
          guestToken={guest.uniqueToken}
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
}
