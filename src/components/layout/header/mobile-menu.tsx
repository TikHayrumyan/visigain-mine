"use client";

import Image from "next/image";
import { useRef, type MouseEvent, type ReactNode } from "react";

const MENU_ID = "mobile-menu";
const ICON_BUTTON = "inline-flex shrink-0 items-center justify-center rounded-button border border-line";
const MENU_ICON = { light: "/icons/menu.svg", dark: "/icons/menu-dark.svg" } as const;

/** The phone's menu button (in the header and in the compact header). `tone`: a light icon on dark, dark on light. */
export function MenuButton({ tone = "light" }: { tone?: keyof typeof MENU_ICON }) {
  const open = () => (document.getElementById(MENU_ID) as HTMLDialogElement | null)?.showModal();

  return (
    <button
      type="button"
      aria-label="Open menu"
      aria-haspopup="dialog"
      aria-controls={MENU_ID}
      onClick={open}
      className={`${ICON_BUTTON} size-10.5 lg:hidden`}
    >
      <Image src={MENU_ICON[tone]} alt="Menu icon" width={20} height={20} />
    </button>
  );
}

/**
 * The phone's menu, a modal dialog (the browser keeps focus inside it and closes it on Escape); it fades in and out.
 * The content is rendered on the server and passed in; following any of its links closes the menu.
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();
  const closeOnLink = (event: MouseEvent) => {
    if ((event.target as Element).closest("a")) close();
  };

  return (
    <dialog
      ref={dialog}
      id={MENU_ID}
      aria-label="Menu"
      data-theme="dark"
      onClick={closeOnLink}
      className="fixed inset-2 m-0 size-auto max-h-none max-w-none flex-col overflow-y-auto rounded-panel-sm border-0 bg-ink p-0 text-fg opacity-0 transition-[opacity,display,overlay] transition-discrete duration-300 ease-reveal  backdrop:opacity-0 backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-300 backdrop:ease-reveal open:flex open:opacity-100 open:backdrop:opacity-100 starting:open:opacity-0 starting:open:backdrop:opacity-0"
    >
      {children}
      <button
        type="button"
        aria-label="Close menu"
        onClick={close}
        className={`${ICON_BUTTON} absolute top-5 right-4 size-10.5`}
      >
        <Image src="/icons/close.svg" alt="Close icon" width={24} height={24} />
      </button>
    </dialog>
  );
}
