import { inspect } from "@xstate/inspect";
import { useMachine } from "@xstate/react";
import Head from "next/head";
import {
  AuthStateContext,
  authStateMachine,
} from "../machines/authState.machine";

if (typeof window !== "undefined") {
  inspect({
    iframe: document.getElementById("xstate-iframe") as HTMLIFrameElement,
  });
}

export const something = "";

function MyApp({ Component, pageProps }) {
  const [state, send] = useMachine(authStateMachine, {
    devTools: true,
  });
  return (
    <>
      <Head>
        <link
          href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css"
          rel="stylesheet"
        />
        <title>My App</title>
      </Head>
      <AuthStateContext.Provider value={{ handleLogin: () => send("LOG_IN") }}>
        <div className="flex flex-col items-stretch w-screen h-screen overflow-hidden">
          <div className="flex-1">
            <div className="p-4 border-t-4 border-purple-500 shadow-md">
              <h1 className="font-semibold tracking-wide text-purple-900 uppercase">
                My Payments App
              </h1>
            </div>
            <div className="p-6">
              <Component {...pageProps} send={send} />
            </div>
          </div>
          <div className="flex flex-col items-stretch flex-1 bg-gray-200">
            <iframe
              id="xstate-iframe"
              className="w-full h-full bg-gray-500"
            ></iframe>
          </div>
        </div>
      </AuthStateContext.Provider>
    </>
  );
}

export default MyApp;
