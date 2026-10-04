import Script from "next/script";

// Loads the Meta pixel and the Google tag, but ONLY if their IDs are set in the
// environment. With no IDs, this renders nothing and no third-party code loads.
export default function Tracking() {
  const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const googleId = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;
  return (
    <>
      {metaId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaId}');fbq('track','PageView');`}
        </Script>
      )}
      {googleId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleId}`} strategy="afterInteractive" />
          <Script id="google-tag" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${googleId}');`}
          </Script>
        </>
      )}
    </>
  );
}
