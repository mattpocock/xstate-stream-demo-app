import { gql } from "apollo-server-micro";
import { createMachine, assign } from "@xstate/compiled";
import { Sender } from "xstate";
import { fetchFromApi } from "../utils/fetchFromApi";

export interface PaymentWizardContext {
  formValues?: {
    currency: string;
    amount: number;
    date: string;
    reason: string;
    reference: string;
  };
}

export type PaymentWizardEvent =
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

export const paymentWizardMachine = createMachine<
  PaymentWizardContext,
  PaymentWizardEvent,
  "paymentWizard"
>(
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
      createPayment: (context) => async (
        callback: Sender<PaymentWizardEvent>,
      ) => {
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
