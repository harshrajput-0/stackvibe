import { Button } from "@/components/ui/Button";

export function PreviewView({ chromeUrl, siteName, hero }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6.5">
      <div className="flex h-full w-full max-w-245 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex h-9.5 flex-none items-center gap-2 border-b border-gray-200 px-3.5">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-200" />
            <span className="h-2 w-2 rounded-full bg-gray-200" />
            <span className="h-2 w-2 rounded-full bg-gray-200" />
          </div>
          <div className="flex h-5.5 flex-1 items-center rounded-[5px] bg-gray-100 px-2.5 font-mono text-[11px] text-gray-500">
            {chromeUrl}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-gray-100 px-10 py-5">
            <div className="text-[15px] font-bold tracking-[-0.01em]">{siteName}</div>
            <div className="flex gap-6.5 text-[13px] text-gray-500">
              <span>Menu</span>
              <span>About</span>
              <span>Visit</span>
            </div>
          </div>

          <div className="px-7.5 py-17.5 text-center">
            <h1 className="text-[clamp(26px,3vw,36px)] font-bold tracking-[-0.02em]">{hero.h1}</h1>
            <p className="mx-auto mt-3 max-w-105 text-sm text-gray-500">{hero.sub}</p>
            <Button variant="primary" className="mt-5.5">
              View menu
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-px border-t border-gray-100 bg-gray-100">
            <div className="bg-white px-6 py-7.5">
              <div className="text-[13.5px] font-semibold">Single-origin</div>
              <div className="mt-1.5 text-[12.5px] leading-normal text-gray-500">
                Beans sourced directly from small farms, roasted weekly.
              </div>
            </div>
            <div className="bg-white px-6 py-7.5">
              <div className="text-[13.5px] font-semibold">Fresh daily</div>
              <div className="mt-1.5 text-[12.5px] leading-normal text-gray-500">
                Pastries baked in-house every morning, nothing held over.
              </div>
            </div>
            <div className="bg-white px-6 py-7.5">
              <div className="text-[13.5px] font-semibold">Open early</div>
              <div className="mt-1.5 text-[12.5px] leading-normal text-gray-500">
                Doors open at 6am for the early crowd, every day.
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 px-10 py-5.5 text-center text-xs text-gray-400">
            © 2026 — made with StackVibe
          </div>
        </div>
      </div>
    </div>
  );
}
