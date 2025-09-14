"use client";
import { type ButtonHTMLAttributes } from "react";
export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={
        "rounded-xl border border-neutral-800 px-4 py-2 hover:bg-neutral-900 disabled:opacity-50 " +
        className
      }
    />
  );
}
