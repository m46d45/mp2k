import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { CreatedWithGrokBanner } from "@/components/created-with-grok-banner";
import appCss from "../styles.css?url";

const APP_NAME = "MP2K — Multi-Moda Produksi Proyek Konstruksi";
const host = import.meta.env.VITE_PUBLIC_HOSTNAME;
const ogImage = host
  ? `https://og.grok.me/v1/card.png?host=${encodeURIComponent(host)}&title=${encodeURIComponent("MP2K")}`
  : undefined;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Sistem produksi proyek konstruksi multi-moda: manual, near-site, dan far supply — diselaraskan lewat zonasi dan lima tuas PPM.",
      },
      { name: "theme-color", content: "#141414" },
      { name: "application-name", content: "MP2K" },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { property: "og:title", content: APP_NAME },
          ]
        : []),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
      { rel: "mask-icon", href: "/favicon.svg", color: "#141414" },
    ],
  }),
  component: () => (
    <html lang="id" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <CreatedWithGrokBanner />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
