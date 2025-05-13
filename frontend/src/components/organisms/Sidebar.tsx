import { UseMutateFunction } from "@tanstack/react-query";
import { useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import TextInput from "../molecules/Dropdown";

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
}

export default function Sidebar({ mutate }: SidebarProps) {
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
      <div className="py-4 flex flex-col gap-2">
        <TextInput prompt="Where from?" text={from} setText={setFrom} />
        <TextInput prompt="Where to?" text={to} setText={setTo} />
        <button onClick={() => mutate({ from, to })}>Navigate</button>
      </div>
    </div>
  );
}
