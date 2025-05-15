interface TextInputProps {
  prompt: string;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
}

export default function TextInput({ prompt, text, setText }: TextInputProps) {
  return (
    <>
      <div className="w-full">
        <div className="sidebar-label">{prompt}</div>
        <div className="border-2 border-gray-400 rounded-md p-2">
          <input
            type="text"
            className="outline-none"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
          />
        </div>
      </div>
    </>
  );
}
