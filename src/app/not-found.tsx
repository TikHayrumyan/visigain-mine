import { getT } from "@/wordings/server";

export default async function NotFound() {
  const t = await getT();
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-site px-4 pb-section">
      <h1 className="text-title">{t("errors.not_found.we_can_t_find_that_page")}</h1>
    </main>
  );
}
