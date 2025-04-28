import { useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Dropdown from "../molecules/Dropdown";

export default function Sidebar() {
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
      <div className="py-4">
        <Dropdown
          text="Where from?"
          options={[]}
          selected={from}
          setSelected={setFrom}
        />
        <Dropdown
          text="Where to?"
          options={[]}
          selected={to}
          setSelected={setTo}
        />
      </div>
    </div>
  );
}
