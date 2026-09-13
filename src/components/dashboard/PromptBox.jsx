import { ArrowUp } from "lucide-react";

export function PromptBox({ value, onChange, onSubmit }) {
  const isEmpty = !value.trim();

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isEmpty) onSubmit();
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-170 rounded-lg border border-gray-300 bg-white px-4.5 pt-4.5 pb-3.5 transition-[border-color,box-shadow] duration-150 ease focus-within:border-black focus-within:shadow-[0_0_0_3px_rgba(10,10,10,0.06)]">
      <textarea
        id="prompt-input"
        placeholder="Describe the website you want to build..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-18.5 w-full resize-none border-none bg-transparent text-[15px] leading-[1.55] text-black outline-none! placeholder:text-gray-400"
      />
      <div className="flex justify-end items-center mt-2">
        <button
          className="flex size-9 items-center justify-center rounded-full bg-black! text-white! transition-[background,transform] duration-150 ease hover:bg-gray-800 active:scale-[0.94] disabled:cursor-not-allowed disabled:bg-gray-300"
          id="generate-btn"
          onClick={onSubmit}
          disabled={isEmpty}
          aria-label="Generate website"
        >
          <ArrowUp size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
