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
}

export default function Sidebar({
  mutate,
  isPending,
  isError,
  isSuccess,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div
      className={`bg-white w-1/4 h-full absolute top-0 ${
        isOpen ? "right-0" : "-right-[calc(25%-8px-16px)]"
      } z-10 flex transition-all duration-300 shadow-xl`}
    >
      <div
        className="flex justify-between items-center p-1"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <IoIosArrowForward /> : <IoIosArrowBack />}
      </div>
      <div className="py-4 flex flex-col gap-4 flex-1 pr-6">
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
