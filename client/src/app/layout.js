import { Inter } from "next/font/google";
import "./globals.css";
import Wrapper from "./components/wrapper/Wrapper";
import Script from "next/script";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://cardpro.co.in"), // Replace with your actual website URL

  title: " ID Card Pro |  | ID Card Creation Service ",
  description:
    "Create professional ID cards for employees, students, and more with our fast and reliable ID card creation service.",
  keywords:
    "ID card creation, professional ID cards, employee ID cards, student ID cards, custom ID cards, ID card service, ID card design",
  author: "ID Card Pro",
  robots: "index, follow", // Tells search engines to index and follow the links
  openGraph: {
    title: "Create Professional ID Cards with Your Company Name",
    description:
      "Our company offers high-quality ID card creation services with customizable designs for all needs.",
   
    url: "https://cardpro.co.in/", // Replace with your actual URL
    type: "website",
    images: [
      {
        url: "/favicon.ico", // Larger image for social media previews
        width: 1200,
        height: 630,
        alt: "Create Professional ID Cards with Your Company Name"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Professional ID Cards with Your Company Name",
    description:
      "Our company offers high-quality ID card creation services with customizable designs for all needs.",
    image: "/favicon.ico", // Replace with your own image path for Twitter card
  },
  favicon: "/favicon.ico", // Path to your favicon file
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics Script */}
        <link rel="icon" href="/favicon.ico" />

        <Script
          id="gtm-script"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-FKVJR553WP"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),
                    dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-NMVVPGBT');
            `,
          }}
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
                  window.dataLayer = window.dataLayer || [];
                   function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-FKVJR553WP');`}
        </Script>

        {/* Google tag manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != "dataLayer" ? "&l=" + l : "";
    j.async = true;
    j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, "script", "dataLayer", "GTM-NMVVPGBT")`,
          }}
        />
        {/* Structured Data Script */}
      </head>
      <body className={inter.className}>
      <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-NMVVPGBT"
          height="0"
          width="0"
        ></iframe>
        <Wrapper>{children}</Wrapper>
        {/* <Nav/> */}
        {/* <Footer/> */}
      </body>
    </html>
  );
}
