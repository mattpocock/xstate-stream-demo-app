import { gql } from "apollo-server-micro";
import { createMachine, assign } from "@xstate/compiled";
import { send, Sender } from "xstate";
import { fetchFromApi } from "../utils/fetchFromApi";

export interface PaymentWizardContext {
  formValues?: {
    currency: string;
    amount: string;
    sortCode: string;
    accountNumber: string;
  };
  currencyAmountCache: Record<string, boolean>;
  sortCodeAccountNumberCache: Record<string, boolean>;
}

export type PaymentWizardEvent =
  | {
      type: "CONFIRM";
      values: {
        currency: string;
        amount: string;
        sortCode: string;
        accountNumber: string;
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
      type: "ON_VALUE_CHANGE";
      currency: string;
      amount: string;
      sortCode: string;
      accountNumber: string;
    }
  | {
      type: "done.invoke.checkCurrencyAndAmount";
      data: boolean;
    }
  | {
      type: "done.invoke.checkAccountAndSortCode";
      data: boolean;
    }
  | {
      type: "INPUTS_HAVE_ERRORED";
    }
  | {
      type: "INPUTS_ARE_VALID";
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
        // on: {
        //   // CONFIRM: {
        //   //   target: "confirmingPaymentDetails",
        //   //   actions: "assignPaymentDetailsToContext",
        //   // },

        // },
        initial: "idle",
        on: {
          ON_VALUE_CHANGE: {
            actions: ["assignFormValuesToContext"],
            target: ".debouncing",
          },
        },
        states: {
          idle: {},
          debouncing: {
            after: {
              600: "checkingInputs",
            },
            on: {
              ON_VALUE_CHANGE: {
                actions: ["assignFormValuesToContext"],
                target: "debouncing",
              },
            },
          },
          checkingInputs: {
            on: {
              INPUTS_HAVE_ERRORED: {
                target: "inputsAreInvalid",
              },
            },
            type: "parallel",
            states: {
              accountAndSortCodeCheck: {
                initial: "pending",
                states: {
                  pending: {
                    invoke: {
                      src: "checkAccountAndSortCode",
                      onDone: {
                        actions: "storeAccountSortCodeResultInCache",
                        target: "complete",
                      },
                      onError: {
                        actions: [send("INPUTS_HAVE_ERRORED")],
                      },
                    },
                  },
                  complete: {
                    type: "final",
                  },
                },
              },
              currencyAndAmountCheck: {
                initial: "pending",
                states: {
                  pending: {
                    invoke: {
                      src: "checkCurrencyAndAmount",
                      onDone: {
                        actions: "storeCurrencyAndAmountResultInCache",
                        target: "complete",
                      },
                      onError: {
                        actions: [send("INPUTS_HAVE_ERRORED")],
                      },
                    },
                  },
                  complete: {
                    type: "final",
                  },
                },
              },
            },
            onDone: {
              target: "inputsAreValid",
            },
          },
          inputsAreInvalid: {},
          inputsAreValid: {},
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
            {
              amount: context.formValues.amount,
              currency: context.formValues.currency,
              date: "2018-04-02",
              reason: context.formValues.accountNumber,
              reference: context.formValues.sortCode,
            },
          );
          callback("REPORT_CREATE_SUCCESS");
        } catch (e) {
          callback("REPORT_CREATE_FAILED");
        }
      },
      checkCurrencyAndAmount: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 1200);
        });
      },
      checkAccountAndSortCode: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 1600);
        });
      },
    },
    actions: {
      assignFormValuesToContext: assign((context, event) => {
        return {
          formValues: {
            accountNumber: event.accountNumber,
            amount: event.amount,
            currency: event.currency,
            sortCode: event.sortCode,
          },
        };
      }),
      resetFormDetails: assign((context, event) => {
        return {
          formValues: undefined,
        };
      }),
      storeAccountSortCodeResultInCache: assign((context, event) => {
        return {
          sortCodeAccountNumberCache: {
            ...context.sortCodeAccountNumberCache,
            [`${context.formValues?.sortCode}_${context.formValues?.accountNumber}`]: event.data,
          },
        };
      }),
      storeCurrencyAndAmountResultInCache: assign((context, event) => {
        return {
          currencyAmountCache: {
            ...context.currencyAmountCache,
            [`${context.formValues?.currency}_${context.formValues?.amount}`]: event.data,
          },
        };
      }),
    },
  },
);
