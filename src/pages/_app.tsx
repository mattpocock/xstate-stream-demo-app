import { inspect } from "@xstate/inspect";
import Head from "next/head";

if (typeof window !== "undefined") {
  inspect({
    iframe: document.getElementById("xstate-iframe") as HTMLIFrameElement,
  });
}

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link
          href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css"
          rel="stylesheet"
        />
        <title>My App</title>
      </Head>
      <div className="flex flex-col items-stretch w-screen h-screen overflow-hidden">
        <div className="flex-1">
          <Component {...pageProps} />
        </div>
        <div className="flex flex-col items-stretch flex-1 bg-gray-200">
          <iframe
            id="xstate-iframe"
            className="w-full h-full bg-gray-500"
          ></iframe>
        </div>
      </div>
    </>
  );
}

export default MyApp;
