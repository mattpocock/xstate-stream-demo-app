import { createMachine, interpret } from "@xstate/compiled";
import { loginDetailsCache } from "../utils/loginDetailsCache";

const authStateMachine = createMachine<any, any, "authStateMachine">(
  {
    id: "authStateMachine",
    initial: "checkingIfLoggedIn",
    states: {
      checkingIfLoggedIn: {
        on: {
          REPORT_JWT_NOT_EXPIRED: {
            target: "loggedIn",
          },
          REPORT_JWT_EXPIRED: {
            target: "loggedOut",
          },
        },
        invoke: {
          src: "checkIfLoggedIn",
        },
      },
      loggedIn: {
        on: {
          LOG_OUT: {
            target: "loggedOut",
            actions: ["deleteJwtFromLocalStorage"],
          },
        },
      },
      loggedOut: {
        on: {
          LOG_IN: {
            target: "loggedIn",
            actions: ["saveJwtToLocalStorage"],
          },
        },
      },
    },
  },
  {
    services: {
      checkIfLoggedIn: () => (callback) => {
        const jwtFromCache = loginDetailsCache.get();

        if (jwtFromCache) {
          callback("REPORT_JWT_NOT_EXPIRED");
        } else {
          callback("REPORT_JWT_EXPIRED");
        }
      },
    },
    actions: {
      saveJwtToLocalStorage: () => {
        loginDetailsCache.set({
          expiresAt: 2000000,
        });
      },
      deleteJwtFromLocalStorage: () => {
        loginDetailsCache.del();
      },
    },
  },
);

export const authStateService = interpret(authStateMachine).start(
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("STATE"))
    : undefined,
);

authStateService.onTransition((state) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("STATE", JSON.stringify(state));
  }
});

export const handleLogin = () => {
  authStateService.send("LOG_IN");
};
