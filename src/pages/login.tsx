import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { Input } from "../components/Input";

const LoginPage = () => {
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
      <Button>Submit</Button>
    </form>
  );
};

export default LoginPage;
