import { InputHTMLAttributes } from "react";

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      {...props}
      className={`px-2 py-1 ${props.className} bg-gray-100 text-gray-700 focus:ring focus:outline-none`}
    ></input>
  );
};
