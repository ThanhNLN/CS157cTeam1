import { UseMutateFunction } from "@tanstack/react-query";
import { useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import TextInput from "../molecules/TextInput";

interface SidebarProps {
  mutate: UseMutateFunction<
    any,
    Error,
    {
      from: string;
      to: string;
    },
    unknown
  >;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  defaultOpen: boolean;
}

export default function Sidebar({
  mutate,
  isPending,
  isError,
  isSuccess,
  defaultOpen,
}: SidebarProps) {
  // Sidebar open/close state
  const [isOpen, setIsOpen] = useState(() => defaultOpen ?? false); // Uses true if passed, otherwise false
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div
      className={`bg-white w-1/4 h-full absolute top-0 ${
        // isOpen ? "left-0" : "-left-[calc(25%-8px-16px)]" // opens from the LEFT instead of the right
        isOpen ? "right-0" : "-right-[calc(25%-8px-16px)]"
      } z-5 flex transition-all duration-300 shadow-xl`}
    >
      <div
        className="flex justify-between items-center p-1"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <IoIosArrowForward /> : <IoIosArrowBack />}
      </div>
      <div className="sidebar-content">
        <TextInput prompt="Where from?" text={from} setText={setFrom} />
        <TextInput prompt="Where to?" text={to} setText={setTo} />
        <button
          className={`${
            isPending ? "bg-gray-300" : isError ? "bg-red-500" : "bg-amber-300"
          } p-2 rounded-md`}
          onClick={() => mutate({ from, to })}
          disabled={isPending}
        >
          {isPending
            ? "Loading..."
            : isError
            ? "One of your destinations doesn't exist."
            : isSuccess
            ? "Success!"
            : "Navigate"}
        </button>
      </div>
    </div>
  );
}
