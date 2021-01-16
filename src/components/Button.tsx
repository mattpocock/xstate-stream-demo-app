import { ButtonHTMLAttributes } from "react";

export const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={`${props.className} focus:outline-none focus:ring px-3 py-2 bg-purple-600 text-purple-100 text-sm`}
    ></button>
  );
};
