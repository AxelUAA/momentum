import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://momentum-alpha-six.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/login",
          "/checkout/",
          "/403",
          "/e/", // Las invitaciones son privadas, no deben indexarse
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
