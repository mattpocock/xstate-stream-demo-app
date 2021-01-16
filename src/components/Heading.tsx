import { HTMLAttributes } from "react";

export const Heading = (props: HTMLAttributes<HTMLElement>) => {
  return (
    <h2
      {...props}
      className={`text-lg text-gray-700 tracking-tight font-semibold ${props.className}`}
    ></h2>
  );
};
