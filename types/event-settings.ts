export type TimelineItem = {
  year: string;
  title: string;
  desc: string;
  image: string;
};

export type DressCode = {
  name: string;
  description: string;
  images: string[];
};

export type EventLocationDetails = {
  time: string;
  name: string;
  address: string;
};

export type GiftRegistryConfig = {
  digitalEnvelope: {
    enabled: boolean;
    suggestedAmount: number;
  };
  liverpool: {
    enabled: boolean;
    eventCode: string;
  };
};

export type EventSettings = {
  story: string;
  timeline: TimelineItem[];
  dressCode: DressCode;
  gallery: string[];
  ceremony: EventLocationDetails;
  reception: EventLocationDetails;
  rsvpDeadline: string;
  colors: {
    primary: string;
    accent: string;
    secondary: string;
  };
  musicUrl: string | null;
  giftRegistry: GiftRegistryConfig;
};
