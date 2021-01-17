import { useContext } from "react";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { Input } from "../components/Input";
import { AuthStateContext } from "../machines/authState.machine";

const LoginPage = () => {
  const { handleLogin } = useContext(AuthStateContext);
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
