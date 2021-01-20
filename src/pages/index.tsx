import { useMachine } from "@xstate/compiled/react";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { Input } from "../components/Input";
import { useMutationForm } from "../components/useMutationForm";
import { paymentWizardMachine } from "../machines/paymentWizard.machine";

export default function Home() {
  const [state, send] = useMachine(paymentWizardMachine, {
    devTools: true,
  });

  const paymentForm = useMutationForm<{
    currency: string;
    amount: string;
    date: string;
    reason: string;
    reference: string;
  }>({
    initialValues: {
      amount: "",
      currency: "",
      date: "",
      reason: "",
      reference: "",
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });
  return (
    <div className="space-y-4">
      {state.matches("enteringDetails") && (
        <paymentForm.Provider {...paymentForm}>
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
            placeholder="Date"
            {...paymentForm.makeInputProps("date")}
          ></Input>
          <Input
            className="block max-w-xs"
            placeholder="Reason"
            {...paymentForm.makeInputProps("reason")}
          ></Input>
          <Input
            className="block max-w-xs"
            placeholder="Reference"
            {...paymentForm.makeInputProps("reference")}
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
