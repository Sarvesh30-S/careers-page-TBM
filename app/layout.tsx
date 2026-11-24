import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import { CustomCursor } from "@/components/ui/CustomCursor";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Careers at TBM",
  description:
    "Curiosity gets you in. Courage gets you heard. Careers at TheBoredMonkey, Lower Parel, Mumbai.",
  icons: {
    icon: [
      { url: "/theboredmonkey-tbm-badge.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/theboredmonkey-tbm-badge.png",
    apple: "/theboredmonkey-tbm-badge.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var t = new URLSearchParams(window.location.search).get('theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
  } catch(e){}

  function checkMetrics() {
    try {
      var doc = document.documentElement;
      var sw = doc.scrollWidth;
      var cw = doc.clientWidth;
      var vw = window.innerWidth;
      doc.setAttribute('data-scroll-width', String(sw));
      doc.setAttribute('data-client-width', String(cw));
      doc.setAttribute('data-overflow', String(sw > cw));

      var all = document.querySelectorAll('*');
      var overflowing = [];
      for (var i = 0; i < all.length; i++) {
        var r = all[i].getBoundingClientRect();
        if (r.right > vw + 0.5) {
          overflowing.push(all[i].tagName.toLowerCase() + (all[i].className ? '.' + String(all[i].className).replace(/\\s+/g, '.') : '') + ' (right: ' + Math.round(r.right) + ' > ' + vw + ')');
        }
      }
      doc.setAttribute('data-overflowing-elements', overflowing.slice(0, 5).join('; ') || 'none');
    } catch(e){}
  }
  window.addEventListener('resize', checkMetrics);
  window.addEventListener('DOMContentLoaded', checkMetrics);
  window.addEventListener('load', checkMetrics);
})();`,
          }}
        />
      </head>
      <body>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
