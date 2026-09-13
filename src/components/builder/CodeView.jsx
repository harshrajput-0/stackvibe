import { CODE_TREE } from "@/lib/constants";

export function CodeView() {
  return (
    <div className="flex min-h-0 flex-1 gap-4 p-5">
      <div className="w-47.5 flex-none overflow-y-auto rounded-md border border-gray-200 bg-white p-2.5">
        {CODE_TREE.map((path, index) => (
          <div
            className={`flex items-center gap-1.75 rounded-[5px] px-2 py-1.5 font-mono text-xs ${
              index === 0
                ? "bg-gray-100 font-medium text-black"
                : "text-gray-700"
            }`}
            key={path}
          >
            {path}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-auto whitespace-pre rounded-md bg-gray-900 p-5 font-mono text-[12.5px] leading-[1.7] text-gray-200">
        <span className="text-gray-500">{"// app/page.jsx"}</span>
        <br />
        <span className="font-semibold text-white">import</span> {"Navbar "}
        <span className="font-semibold text-white">from</span>{" "}
        {"'./components/Navbar';"}
        <br />
        <span className="font-semibold text-white">import</span> {"Hero "}
        <span className="font-semibold text-white">from</span>{" "}
        {"'./components/Hero';"}
        <br />
        <span className="font-semibold text-white">import</span> {"Features "}
        <span className="font-semibold text-white">from</span>{" "}
        {"'./components/Features';"}
        <br />
        <span className="font-semibold text-white">import</span> {"Footer "}
        <span className="font-semibold text-white">from</span>{" "}
        {"'./components/Footer';"}
        <br />
        <br />
        <span className="font-semibold text-white">
          export default function
        </span>{" "}
        {"Page() {"}
        <br />
        {"  "}
        <span className="font-semibold text-white">return</span> {"("}
        <br />
        {"    <>"}
        <br />
        {"      <Navbar />"}
        <br />
        {"      <Hero />"}
        <br />
        {"      <Features />"}
        <br />
        {"      <Footer />"}
        <br />
        {"    </>"}
        <br />
        {"  );"}
        <br />
        {"}"}
      </div>
    </div>
  );
}
