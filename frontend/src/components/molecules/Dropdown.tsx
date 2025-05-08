interface DropdownProps {
  text: string;
  options: string[];
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
}

export default function Dropdown({
  text,
  options,
  selected,
  setSelected,
}: DropdownProps) {
  return (
    <>
      <div>{text}</div>
      <div className="border-2 border-gray-400 rounded-md p-2">
        <input type="text" className="outline-none" />
      </div>
    </>
  );
}
