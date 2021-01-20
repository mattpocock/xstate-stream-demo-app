import { useMachine } from "@xstate/compiled/react";
import { useEffect } from "react";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { Input } from "../components/Input";
import { useMutationForm } from "../components/useMutationForm";
import { paymentWizardMachine } from "../machines/paymentWizard.machine";

export const something = "";

export default function Home() {
  const [state, send] = useMachine(paymentWizardMachine, {
    devTools: true,
  });

  const paymentForm = useMutationForm<{
    currency: string;
    amount: string;
    sortCode: string;
    accountNumber: string;
  }>({
    initialValues: {
      amount: "",
      currency: "",
      sortCode: "",
      accountNumber: "",
    },
    onSubmit: (values) => {
      send({
        type: "CONFIRM",
        values,
      });
    },
  });

  useEffect(() => {
    if (
      paymentForm.values.accountNumber ||
      paymentForm.values.amount ||
      paymentForm.values.currency ||
      paymentForm.values.sortCode
    ) {
      send({
        type: "ON_VALUE_CHANGE",
        ...paymentForm.values,
      });
    }
  }, [paymentForm.values]);
  return (
    <div className="space-y-4">
      {state.matches("enteringDetails") && (
        <paymentForm.Provider {...paymentForm}>
          <div className="space-y-4">
            <Heading>Payment Wizard</Heading>
            <Input
              className="block max-w-xs"
              placeholder="Currency"
              {...paymentForm.makeInputProps("currency")}
            ></Input>
            <Input
              className="block max-w-xs"
              placeholder="Amount"
              {...paymentForm.makeInputProps("amount")}
            ></Input>
            <Input
              className="block max-w-xs"
              placeholder="Sort Code"
              {...paymentForm.makeInputProps("sortCode")}
            ></Input>
            <Input
              className="block max-w-xs"
              placeholder="Account Number"
              {...paymentForm.makeInputProps("accountNumber")}
            ></Input>
            <Button>Submit</Button>
          </div>
        </paymentForm.Provider>
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
