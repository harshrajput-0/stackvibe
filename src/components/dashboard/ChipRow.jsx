import { PROMPT_CHIPS } from "@/lib/constants";

export const ChipRow = ({ onSelect }) => {
  return (
    <div className="mt-5.5 flex flex-wrap justify-center gap-2.5">
      {PROMPT_CHIPS.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={() => onSelect(chip.prompt)}
          className="h-8.5 rounded-full border! border-gray-200! bg-white! px-4 text-[13px] font-medium text-gray-700 transition-[border-color,color,background-color] duration-150 ease hover:border-black! hover:bg-gray-100 hover:text-black"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
};