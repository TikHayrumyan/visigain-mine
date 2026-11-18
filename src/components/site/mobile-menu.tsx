"use client";

import Image from "next/image";
import { useRef, type MouseEvent, type ReactNode } from "react";
import closeIcon from "./assets/close.svg";
import menuIcon from "./assets/menu.svg";
import { DECORATIVE_ALT } from "./decorative";

const ICON_BUTTON = "inline-flex shrink-0 items-center justify-center rounded-button border border-line";

/**
 * The phone's menu: a button that opens the menu as a modal dialog over the page (the browser keeps focus inside it and
 * closes it on Escape). The menu's content is drawn on the server and passed in; following any of its links closes it.
 */
export function MobileMenu({
  openLabel,
  closeLabel,
  children,
}: {
  openLabel: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();
  const closeOnLink = (event: MouseEvent) => {
    if ((event.target as Element).closest("a")) close();
  };

  return (
    <>
      <button
        type="button"
        aria-label={openLabel}
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
        className={`${ICON_BUTTON} size-10.5 lg:hidden`}
      >
        <Image src={menuIcon} alt={DECORATIVE_ALT} />
      </button>
      <dialog
        ref={dialog}
        aria-label={openLabel}
        data-theme="dark"
        onClick={closeOnLink}
        className="fixed inset-2 m-0 size-auto max-h-none max-w-none overflow-y-auto rounded-panel-sm border-0 bg-ink p-0 text-fg backdrop:bg-ink/60 open:flex open:flex-col"
      >
        {children}
        <button
          type="button"
          aria-label={closeLabel}
          onClick={close}
          className={`${ICON_BUTTON} absolute top-5 right-4 size-11.5`}
        >
          <Image src={closeIcon} alt={DECORATIVE_ALT} />
        </button>
      </dialog>
    </>
  );
}
