import type { ReactNode } from "react";

export type PageShellProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

export function PageShell({ sidebar, children }: PageShellProps) {
  return (
    <div className="flex min-h-screen">
      {sidebar}
      <main className="min-w-0 flex-1 px-[30px] py-[26px]">
        <div className="flex flex-col gap-5">{children}</div>
      </main>
    </div>
  );
}
