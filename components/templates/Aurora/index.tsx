"use client";

import { WelcomeEnvelope } from "./sections/WelcomeEnvelope";
import { HeroCountdown } from "./sections/HeroCountdown";
import { StoryTimeline } from "./sections/StoryTimeline";
import { EventDetails } from "./sections/EventDetails";
import { DressCodeMoodboard } from "./sections/DressCodeMoodboard";
import { PhotoGallery } from "./sections/PhotoGallery";
import { WeatherForecast } from "./sections/WeatherForecast";
import { RsvpForm } from "./sections/RsvpForm";
import { GiftRegistry } from "./sections/GiftRegistry";
import { ShareSection } from "./sections/ShareSection";
import { useState } from "react";
import type { Event, Guest, Rsvp, Template, User } from "@prisma/client";
import type { EventSettings } from "@/types/event-settings";

export type AuroraProps = {
  event: Event & { template: Template; user: User };
  guest: Guest & { rsvp: Rsvp | null };
};

export function AuroraTemplate({ event, guest }: AuroraProps) {
  const [opened, setOpened] = useState(false);
  const settings = event.settings as unknown as EventSettings;

  return (
    <div className="bg-[#0F1B2D] min-h-screen text-white font-sans selection:bg-[var(--color-champagne)] selection:text-[#0F1B2D]">
      {!opened ? (
        <WelcomeEnvelope event={event} guest={guest} settings={settings} onOpen={() => setOpened(true)} />
      ) : (
        <div className="animate-in fade-in duration-1000">
          <HeroCountdown event={event} />
          <StoryTimeline items={settings.timeline} story={settings.story} />
          <EventDetails ceremony={settings.ceremony} reception={settings.reception} location={{ lat: event.locationLat, lng: event.locationLng, name: event.locationName, address: event.locationAddress }} />
          <DressCodeMoodboard data={settings.dressCode} />
          <PhotoGallery images={settings.gallery} />
          <WeatherForecast location={{ lat: event.locationLat, lng: event.locationLng }} />
          <GiftRegistry config={settings.giftRegistry} />
          <RsvpForm guest={guest} eventSlug={event.slug} guestToken={guest.uniqueToken} />
          <ShareSection title={event.title} slug={event.slug} uniqueToken={guest.uniqueToken} />
        </div>
      )}
    </div>
  );
}
