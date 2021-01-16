import { createMachine, assign, Sender } from "xstate";
import { useMachine } from "@xstate/react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { fetchFromApi } from "../utils/fetchFromApi";
import gql from "graphql-tag";
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
          await fetchFromApi(
            gql`
              mutation CreatePayment(
                $amount: Float!
                $currency: String!
                $date: String!
                $reason: String!
                $reference: String!
              ) {
                createPayment(
                  amount: $amount
                  currency: $currency
                  date: $date
                  reason: $reason
                  reference: $reference
                ) {
                  amount
                  id
                }
              }
            `,
            context.formValues,
          );
          callback("REPORT_CREATE_SUCCESS");
        } catch (e) {
          callback("REPORT_CREATE_FAILED");
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
    <div className="space-y-4">
      {state.matches("enteringDetails") && (
        <>
          <Heading>Payment Wizard</Heading>
          <Input
            className="block max-w-xs"
            value={state.context.formValues?.currency}
            placeholder="Currency"
          ></Input>
          <Input
            className="block max-w-xs"
            value={state.context.formValues?.amount}
            placeholder="Amount"
          ></Input>
          <Input
            className="block max-w-xs"
            value={state.context.formValues?.date}
            placeholder="Date"
          ></Input>
          <Input
            className="block max-w-xs"
            value={state.context.formValues?.reason}
            placeholder="Reason"
          ></Input>
          <Input
            className="block max-w-xs"
            value={state.context.formValues?.reference}
            placeholder="Reference"
          ></Input>
          <Button
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
          </Button>
        </>
      )}
      {state.matches("confirmingPaymentDetails") && (
        <>
          <Heading>Are you sure?</Heading>
          <pre className="text-sm text-gray-600">
            {JSON.stringify(state.context.formValues, null, 2)}
          </pre>
          <div className="space-x-4">
            <Button onClick={() => send("BACK")}>Go Back</Button>
            <Button onClick={() => send("SUBMIT_CREATE")}>
              I am ready to rumble
            </Button>
          </div>
        </>
      )}
      {state.matches("paymentMadeSuccessfully") && (
        <>
          <Button onClick={() => send("GO_AGAIN")}>I wanna try again</Button>
        </>
      )}
    </div>
  );
}
