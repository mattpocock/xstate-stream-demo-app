import { useService } from "@xstate/react";
import { useContext } from "react";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { Input } from "../components/Input";
import { authStateService, handleLogin } from "../machines/authState.machine";

const LoginPage = () => {
  const [state, send] = useService(authStateService);

  const isLoggedIn = state.matches("loggedIn");

  if (isLoggedIn) {
    return <Button onClick={() => send("LOG_OUT")}>Log Out</Button>;
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="space-y-4"
    >
      <Heading>Log In</Heading>
      <Input placeholder="Username" className="block" />
      <Input placeholder="Password" className="block" />
      <Button onClick={() => handleLogin()}>Submit</Button>
    </form>
  );
};

export default LoginPage;
