import Image from "next/image";
import { COMPANY } from "@/config/navigation";

const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${COMPANY.legalName}, ${COMPANY.address}`,
)}`;

/** Email, the call row, and the office card. Booking does nothing until a calendar link exists. */
export function ContactAside() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-start gap-4 border-b border-line py-5">
          <IconTile src="/icons/contact-mail.svg" />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-label-m text-muted">Write to us</p>
            <a href={`mailto:${COMPANY.email}`} className="font-display text-title-s text-fg no-underline hover:underline">
              {COMPANY.email}
            </a>
          </div>
        </div>
        <div className="flex items-start gap-4 py-5">
          <IconTile src="/icons/contact-calendar.svg" />
          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <p className="text-label-m text-muted">Prefer to talk?</p>
              <p className="text-body-l text-fg">Book a 15-minute call with the team.</p>
            </div>
            <div className="flex items-center gap-4 pt-1">
              <button
                type="button"
                className="inline-flex h-9 items-center rounded-full border border-ink bg-surface px-4 text-body-m text-fg"
              >
                Book a call
              </button>
              <button type="button" className="inline-flex items-center gap-1 text-label-m text-muted">
                Calendar
                <Image src="/icons/contact-arrow-muted.svg" alt="" width={20} height={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <article className="relative h-[416px] overflow-hidden rounded-[20px] bg-ink">
        <div className="absolute top-[-11px] left-[-135px] h-[467px] w-[553px] lg:left-[-9px]">
          <Image
            src="/images/contact-map.png"
            alt=""
            width={553}
            height={467}
            className="h-[467px] w-[553px] max-w-none"
          />
          <span className="contact-pin absolute top-[167px] left-[266px]">
            <Image src="/icons/contact-pin-halo.svg" alt="" width={88} height={88} />
          </span>
          <span className="contact-pin absolute top-[189px] left-[288px]">
            <Image src="/icons/contact-pin-halo-inner.svg" alt="" width={44} height={44} />
          </span>
          <Image src="/icons/contact-pin.svg" alt="" width={20} height={20} className="absolute top-[201px] left-[300px]" />
        </div>
        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2 rounded-[14px] bg-surface px-4 py-3.5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="font-display text-title-s text-fg">{COMPANY.legalName}</p>
            <p className="text-body-m text-muted">{COMPANY.address}</p>
          </div>
          <a
            href={MAPS}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-label-m text-fg no-underline hover:underline"
          >
            Directions
            <Image src="/icons/contact-arrow.svg" alt="" width={20} height={20} />
          </a>
        </div>
      </article>
    </div>
  );
}

function IconTile({ src }: { src: string }) {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-ink">
      <Image src={src} alt="" width={20} height={20} />
    </span>
  );
}
