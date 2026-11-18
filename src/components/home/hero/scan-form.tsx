import Image from "next/image";
import { PRIMARY_BUTTON } from "@/components/ui/button-styles";
import { FREE_SCAN } from "@/config/navigation";

/** The business name field and the free scan button: under the field on a phone, inside it on a wide screen. */
export function ScanForm() {
  return (
    <form action={FREE_SCAN.href} className="flex w-full flex-col gap-2.5 pt-2 lg:relative lg:w-140 lg:pt-3">
      <label className="flex h-14 items-center gap-3 rounded-pill border border-line-darken bg-surface px-5.5 shadow-field focus-within:ring-2 focus-within:ring-green lg:h-15 lg:pr-50">
        <Image src="/icons/search.svg" alt="" width={20} height={20} />
        <span className="sr-only">Your business name</span>
        <input
          name="business"
          type="text"
          required
          autoComplete="organization"
          placeholder="Enter your business name"
          className="min-w-0 flex-1 bg-transparent text-body-l text-fg outline-none placeholder:text-faint"
        />
      </label>
      <button type="submit" className={`${PRIMARY_BUTTON} h-13 px-6 lg:absolute lg:right-1.5 lg:bottom-1.5 lg:h-12`}>
        {FREE_SCAN.label}
      </button>
    </form>
  );
}
