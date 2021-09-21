import { LiveblocksProvider } from "@liveblocks/react";
import { createClient } from "@liveblocks/client";
import { AppProps } from "next/app";
import "tailwindcss/tailwind.css";
import "../components/globals.css";

// No auth endpoint needed, use only for test or on public website:
const client = createClient({
  publicApiKey: "pak_XXXXXXXX",
});


// Or, set the auth endpoint that you have set up:
// const client = createClient({
//   authEndpoint: "/api/auth",
// });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    /**
     * Add a LiveblocksProvider at the root of your app
     * to be able to use Liveblocks react hooks in your components
     **/
    <LiveblocksProvider client={client}>
      <Component {...pageProps} />
    </LiveblocksProvider>
  );
}
export default MyApp;
