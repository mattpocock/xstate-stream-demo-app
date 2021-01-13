import { inspect } from "@xstate/inspect";
import { useMachine } from "@xstate/react";
import gql from "graphql-tag";
import Head from "next/head";
import { createMachine, assign } from "xstate";
import { fetchFromApi } from "../utils/fetchFromApi";

if (typeof window !== "undefined") {
  inspect({
    iframe: document.getElementById("xstate-iframe") as HTMLIFrameElement,
  });
}

type Context = {
  user: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
};

type Event = {
  type: "USER_DATA";
  data: {
    user: {
      firstName: string;
      lastName: string;
      username: string;
    };
  };
};

export const globalStateMachine = createMachine<Context, Event>(
  {
    initial: "pendingFirstLoad",
    id: "globalState",
    context: {
      user: {},
    },
    states: {
      pendingFirstLoad: {
        on: {
          USER_DATA: {
            target: "complete",
            actions: "assignUserDetailsToContext",
          },
        },
        invoke: {
          src: "loadUserData",
          onError: {
            target: "errored",
          },
        },
      },
      complete: {},
      errored: {},
    },
  },
  {
    actions: {
      assignUserDetailsToContext: assign((context, event) => {
        return {
          user: event.data.user,
        };
      }),
    },
    services: {
      loadUserData: () => async (callback) => {
        const data = await fetchFromApi(
          gql`
            {
              user {
                username
                firstName
                lastName
              }
            }
          `,
          {},
        );

        callback({
          type: "USER_DATA",
          data,
        });
      },
    },
  },
);

function MyApp({ Component, pageProps }) {
  const [state] = useMachine(globalStateMachine, {
    devTools: true,
  });

  return (
    <>
      <Head>
        <link
          href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css"
          rel="stylesheet"
        />
        <title>
          {[
            "Welcome",
            state.context?.user?.firstName,
            state.context?.user?.lastName,
          ].join(" ")}
        </title>
      </Head>
      <div className="h-screen w-screen overflow-hidden flex flex-col items-stretch">
        <div className="flex-1">
          <Component {...pageProps} />
        </div>
        <div className="flex-1 bg-gray-200 flex flex-col items-stretch">
          <iframe
            id="xstate-iframe"
            className="w-full bg-gray-500 h-full"
          ></iframe>
        </div>
      </div>
    </>
  );
}

export default MyApp;
