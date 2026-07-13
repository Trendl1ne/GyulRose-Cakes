export const site = {
  name: "GyulRose Cakes",
  domain: "https://gyulrosecakes.com",
  phoneDisplay: "+44 7455 802400",
  phoneInternational: "447455802400",
  email: "gyulrose84@gmail.com",
  instagram: "https://instagram.com/gyulok84",
  instagramHandle: "@gyulok84",
  tiktok: "https://tiktok.com/@gyulrose",
  tiktokHandle: "@gyulrose",
  locality: "Haywards Heath",
  region: "West Sussex",
  country: "GB",
  primaryDescription:
    "Made-to-order birthday, celebration and themed cakes in Haywards Heath, with collection and delivery options across nearby West Sussex areas.",
  whatsapp(message: string) {
    return `https://wa.me/${this.phoneInternational}?text=${encodeURIComponent(message)}`;
  }
};

export const categoryMeta: Record<string, { label: string; short: string; path: string }> = {
  birthday: {
    label: "Birthday cakes",
    short: "Personalised cakes for milestone birthdays, parties and family celebrations.",
    path: "/birthday-cakes-haywards-heath/"
  },
  "children-themed": {
    label: "Children's and themed cakes",
    short: "Colourful character, hobby and story-led cakes made around the celebration.",
    path: "/themed-cakes-haywards-heath/"
  },
  kids: {
    label: "Children's cakes",
    short: "Playful personalised cakes for children's birthdays and special days.",
    path: "/themed-cakes-haywards-heath/"
  },
  celebration: {
    label: "Celebration cakes",
    short: "Anniversary, graduation and occasion cakes designed for the moment.",
    path: "/celebration-cakes-west-sussex/"
  },
  corporate: {
    label: "Corporate cakes",
    short: "Made-to-order cakes for workplace celebrations and client gifts.",
    path: "/celebration-cakes-west-sussex/"
  }
};
