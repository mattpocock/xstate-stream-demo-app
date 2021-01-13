import { createMachine, assign, Sender } from "xstate";
import { useMachine } from "@xstate/react";
// import { fetchFromApi } from "../utils/fetchFromApi";
// import { gql } from "apollo-server-micro";

interface Context {
  formValues?: {
    currency: string;
    amount: number;
    date: string;
    reason: string;
    reference: string;
  };
}

type Event =
  | {
      type: "CONFIRM";
      values: {
        currency: string;
        amount: number;
        date: string;
        reason: string;
        reference: string;
      };
    }
  | {
      type: "BACK";
    }
  | {
      type: "GO_AGAIN";
    }
  | {
      type: "SUBMIT_CREATE";
    }
  | {
      type: "REPORT_CREATE_SUCCESS";
    }
  | {
      type: "REPORT_CREATE_FAILED";
    };

export const paymentWizardMachine = createMachine<Context, Event>(
  {
    initial: "enteringDetails",
    states: {
      enteringDetails: {
        on: {
          CONFIRM: {
            target: "confirmingPaymentDetails",
            actions: "assignPaymentDetailsToContext",
          },
        },
      },
      confirmingPaymentDetails: {
        on: {
          SUBMIT_CREATE: {
            target: "creatingPayment",
          },
          BACK: {
            target: "enteringDetails",
          },
        },
      },
      creatingPayment: {
        on: {
          REPORT_CREATE_FAILED: {
            target: "paymentErrored",
          },
          REPORT_CREATE_SUCCESS: {
            target: "paymentMadeSuccessfully",
          },
        },
        invoke: {
          src: "createPayment",
        },
      },
      paymentErrored: {},
      paymentMadeSuccessfully: {
        on: {
          GO_AGAIN: {
            target: "enteringDetails",
            actions: ["resetFormDetails"],
          },
        },
      },
    },
  },
  {
    services: {
      createPayment: (context) => async (callback: Sender<Event>) => {
        const variables = context.formValues;

        try {
          setTimeout(() => {
            callback({
              type: "REPORT_CREATE_SUCCESS",
            });
          }, 800);
        } catch (e) {
          console.error(e);
          callback({
            type: "REPORT_CREATE_FAILED",
          });
        }
      },
    },
    actions: {
      assignPaymentDetailsToContext: assign((context, event) => {
        if (event.type !== "CONFIRM") return {};
        return {
          formValues: event.values,
        };
      }),
      resetFormDetails: assign({
        formValues: undefined,
      }),
    },
  },
);

export default function Home() {
  const [state, send] = useMachine(paymentWizardMachine, {
    devTools: true,
  });
  return (
    <div className="space-y-2">
      {state.matches("enteringDetails") && (
        <>
          <h1>Payment Wizard</h1>
          <input
            className="block max-w-xs"
            value={state.context.formValues?.currency}
            placeholder="currency"
          ></input>
          <input
            className="block max-w-xs"
            value={state.context.formValues?.amount}
            placeholder="amount"
          ></input>
          <input
            className="block max-w-xs"
            value={state.context.formValues?.date}
            placeholder="date"
          ></input>
          <input
            className="block max-w-xs"
            value={state.context.formValues?.reason}
            placeholder="reason"
          ></input>
          <input
            className="block max-w-xs"
            value={state.context.formValues?.reference}
            placeholder="reference"
          ></input>
          <button
            onClick={() => {
              send({
                type: "CONFIRM",
                values: {
                  amount: 20,
                  currency: "EUR",
                  date: "2018-04-02",
                  reason: "Reason",
                  reference: "Funky Reference",
                },
              });
            }}
          >
            Submit
          </button>
        </>
      )}
      {state.matches("confirmingPaymentDetails") && (
        <>
          <h1>Are you sure?</h1>
          <pre className="text-sm text-gray-600">
            {JSON.stringify(state.context.formValues, null, 2)}
          </pre>
          <button
            className="px-3 py-2 text-red-100 bg-red-600"
            onClick={() => send("BACK")}
          >
            I am SO NOT ready to rumble
          </button>
          <button
            className="px-3 py-2 text-white bg-purple-600"
            onClick={() => send("SUBMIT_CREATE")}
          >
            I am ready to rumble
          </button>
        </>
      )}
      {state.matches("paymentMadeSuccessfully") && (
        <>
          <button
            className="px-3 py-2 text-red-100 bg-red-600"
            onClick={() => send("GO_AGAIN")}
          >
            I wanna try again
          </button>
        </>
      )}
      <pre className="pt-4">State: {JSON.stringify(state.value, null, 2)}</pre>
    </div>
  );
}
