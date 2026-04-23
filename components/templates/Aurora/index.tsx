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
  const activeSections = (event.activeSections as Record<string, boolean>) || {};

  return (
    <div className="bg-[#0F1B2D] min-h-screen text-white font-sans selection:bg-[var(--color-champagne)] selection:text-[#0F1B2D]">
      {!opened && activeSections.welcomeEnvelope !== false ? (
        <WelcomeEnvelope event={event} guest={guest} settings={settings} onOpen={() => setOpened(true)} />
      ) : (
        <div className="animate-in fade-in duration-1000">
          {(opened || activeSections.welcomeEnvelope === false) && (
            <>
              {activeSections.hero !== false && <HeroCountdown event={event} />}
              {activeSections.story !== false && <StoryTimeline items={settings.timeline} story={settings.story} />}
              {(activeSections.ceremony !== false || activeSections.reception !== false) && (
                <EventDetails 
                  ceremony={activeSections.ceremony !== false ? settings.ceremony : undefined} 
                  reception={activeSections.reception !== false ? settings.reception : undefined} 
                  location={{ lat: event.locationLat, lng: event.locationLng, name: event.locationName, address: event.locationAddress }} 
                />
              )}
              {activeSections.dressCode !== false && <DressCodeMoodboard data={settings.dressCode} />}
              {activeSections.gallery !== false && <PhotoGallery images={settings.gallery} />}
              {activeSections.weather !== false && <WeatherForecast location={{ lat: event.locationLat, lng: event.locationLng }} />}
              {activeSections.giftRegistry !== false && <GiftRegistry config={settings.giftRegistry} />}
              {activeSections.rsvp !== false && <RsvpForm guest={guest} eventSlug={event.slug} guestToken={guest.uniqueToken} />}
              <ShareSection title={event.title} slug={event.slug} uniqueToken={guest.uniqueToken} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
