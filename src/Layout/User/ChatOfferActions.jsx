import { useState } from "react";
import { CalendarDays, Check, ChevronDown, Clock3, LoaderCircle, LockKeyhole, Send, Users, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as Dialog from "@radix-ui/react-dialog";
import { offerRejectReasons } from "@/lib/chatOffers";

export default function ChatOfferActions({ workflow }) {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const w = workflow;
  if (w.role !== "agency" && w.role !== "tourist") return null;

  const date = (value) => {
    const parsed = new Date(value);
    return value && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString(i18n.language === "ru" ? "ru-RU" : "ro-RO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—";
  };
  const amount = w.offer?.offered_budget;
  const price = amount !== null && amount !== undefined && Number.isFinite(Number(amount))
    ? new Intl.NumberFormat(i18n.language === "ru" ? "ru-RU" : "ro-RO", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(Number(amount)) : "—";
  const contacts = w.status === "accepted" && w.isAgency ? (w.offer?.tour_plan || w.plan) : null;
  const summary = <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-4 text-sm">
    <div className="flex flex-wrap items-start justify-between gap-2"><p className="min-w-0 break-words font-semibold">{w.plan?.location_to}</p><p className="font-bold text-[#9b701f]">{price}</p></div>
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs leading-5 text-[#617082]">
      <span className="flex items-center gap-1.5"><CalendarDays size={14} aria-hidden="true" />{date(w.plan?.start_date)} – {date(w.plan?.end_date)}</span>
      <span className="flex items-center gap-1.5"><Users size={14} aria-hidden="true" />{w.plan?.total_members ?? "—"} {t("people")}</span>
    </div>
  </div>;

  return <>
    {(w.isLoading || w.isError || w.status || w.canSend || w.isFinal || w.notice) && <div className="max-h-[45%] shrink-0 overflow-y-auto border-t border-[#eeeae3] bg-[#fbf6ec] px-4 py-3" aria-label={t("chat_offer_actions")}>
      {w.isLoading && !w.status ? <p role="status" className="flex items-center gap-2 text-xs text-[#77818e]"><LoaderCircle size={15} className="animate-spin" />{t("chat_offer_loading")}</p>
        : w.isError && !w.status ? <div role="alert" className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#b54a40]"><p>{t("chat_offer_load_error")}</p><button type="button" onClick={w.refetch} className="font-semibold underline underline-offset-4">{t("chat_retry")}</button></div>
          : w.status ? <>
            <div className="flex items-center justify-between">
              <p role="status" className={`flex items-center gap-2 text-sm font-semibold ${w.status === "accepted" ? "text-[#397055]" : "text-[#77818e]"}`}>
                {w.status === "accepted" ? <Check size={17} aria-hidden="true" /> : <X size={17} aria-hidden="true" />}
                {t(`chat_offer_status_${w.status}`)}
              </p>
              {contacts && (
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  aria-expanded={isExpanded}
                  className="rounded-lg p-1 text-[#617082] transition hover:bg-[#f3eedf] hover:text-[#172b43] focus-visible:outline-2 focus-visible:outline-[#c88f2a]"
                  aria-label={isExpanded ? t("collapse") || "Collapse" : t("expand") || "Expand"}
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              )}
            </div>
            {contacts && isExpanded && (
              <dl className="mt-3 grid gap-2 rounded-xl border border-[#e9e6e0] bg-white p-3 text-xs leading-5" aria-label={t("chat_offer_shared_contacts")}>
                {[["name", contacts.name], ["phone", contacts.phone_number], ["email", contacts.email]].map(([key, value]) => (
                  <div key={key} className="min-w-0">
                    <dt className="font-semibold text-[#617082]">{t(key)}</dt>
                    <dd className="break-words [overflow-wrap:anywhere] text-[#172b43]">{value || t("not_provided")}</dd>
                  </div>
                ))}
              </dl>
            )}
          </> : <>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#9b701f]"><span>{t("chat_offer_final_title")}</span><span>{price}</span></div>
            {w.isAgency ? w.canSend ? <button type="button" onClick={() => w.openDialog("send")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#172b43] px-3 py-2.5 text-sm font-semibold text-white"><Send size={16} aria-hidden="true" />{t("chat_offer_send_final")}</button>
              : <p role="status" className="flex items-center gap-2 text-xs leading-5 text-[#617082]"><Clock3 size={15} className="shrink-0" aria-hidden="true" />{t("chat_offer_waiting_client")}</p>
              : w.canDecide && <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => w.openDialog("accept")} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#172b43] px-3 py-2.5 text-sm font-semibold text-white"><Check size={16} className="shrink-0" />{t("accept_final_offer")}</button>
                <button type="button" onClick={() => w.openDialog("decline")} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#dcd3c2] bg-white px-3 py-2.5 text-sm font-semibold"><X size={16} className="shrink-0" />{t("decline_final_offer")}</button>
              </div>}
          </>}
      {w.notice && <div role="alert" className="mt-3 rounded-xl border border-[#eddbc0] bg-white p-3 text-xs leading-5 text-[#617082]"><p>{t("chat_offer_notice_pending")}</p><button type="button" onClick={w.retryNotice} disabled={w.busy} className="mt-1 font-semibold text-[#9b701f] underline underline-offset-4 disabled:opacity-50">{w.busy ? t("chat_sending") : t("chat_retry")}</button></div>}
    </div>}

    <Dialog.Root open={Boolean(w.dialog)} onOpenChange={(open) => { if (!open && !w.busy) w.setDialog(null); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-[#172b43]/45 backdrop-blur-sm" />
        <Dialog.Content onEscapeKeyDown={(event) => { if (w.busy) event.preventDefault(); }} onPointerDownOutside={(event) => { if (w.busy) event.preventDefault(); }} className="fixed left-1/2 top-1/2 z-[81] max-h-[90dvh] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[24px] border border-[#e9e6e0] bg-white p-6 text-[#172b43] shadow-2xl">
          <Dialog.Title className="pr-8 text-xl font-semibold">{t(w.dialog === "send" ? "chat_offer_send_final" : w.dialog === "accept" ? "accept_final_offer" : "decline_final_offer")}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-[#617082] [overflow-wrap:anywhere]">{t(w.dialog === "send" ? "chat_offer_send_description" : w.dialog === "accept" ? "chat_offer_accept_description" : "chat_offer_decline_description", { agency: w.agencyName })}</Dialog.Description>
          <Dialog.Close disabled={w.busy} className="chat-icon-button absolute right-4 top-4" aria-label={t("close")}><X size={18} /></Dialog.Close>
          <div className="mt-5">{summary}</div>
          {w.dialog === "accept" && <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-[#e9e6e0] bg-[#fbf6ec] p-4 text-sm leading-6"><input type="checkbox" checked={w.consent} onChange={(event) => w.setConsent(event.target.checked)} disabled={w.busy} className="mt-1 h-4 w-4 shrink-0 accent-[#b88424]" /><span className="min-w-0 [overflow-wrap:anywhere]"><LockKeyhole size={15} className="mr-1 inline text-[#b88424]" aria-hidden="true" />{t("chat_offer_contact_consent", { agency: w.agencyName })}</span></label>}
          {w.dialog === "decline" && <fieldset className="mt-5 space-y-2"><legend className="mb-2 text-sm font-semibold">{t("chat_offer_optional_reason")}</legend>{offerRejectReasons.map((reason) => <label key={reason.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm ${w.reason === reason.value ? "border-[#d9b571] bg-[#fbf6ec]" : "border-[#e9e6e0]"}`}><input type="radio" name="reject_reason" value={reason.value} checked={w.reason === reason.value} onChange={() => w.setReason(reason.value)} disabled={w.busy} className="shrink-0 accent-[#b88424]" /><span>{t(reason.labelKey)}</span></label>)}</fieldset>}
          {w.error && <p role="alert" className="mt-4 text-sm leading-5 text-[#b54a40]">{w.error}</p>}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Dialog.Close disabled={w.busy} className="rounded-xl border border-[#e9e6e0] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">{t("cancel")}</Dialog.Close>
            <button type="button" onClick={w.submit} disabled={w.busy || (w.dialog === "accept" && !w.consent) || (w.dialog === "send" ? !w.canSend : !w.canDecide)} className="flex items-center gap-2 rounded-xl bg-[#dd9e2c] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{w.busy && <LoaderCircle size={16} className="animate-spin" />}{t(w.busy ? "processing" : w.dialog === "send" ? "chat_offer_send_final" : w.dialog === "accept" ? "chat_offer_confirm_accept" : "chat_offer_confirm_decline")}</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}
