import { useRef, useState } from "react";
import { FileText, LoaderCircle, Paperclip, Percent, Send, Tag, UploadCloud, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const inputClass = "w-full rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 text-sm text-[#172b43] placeholder:text-[#8c99a7] focus:border-[#bd8525] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20 disabled:cursor-not-allowed disabled:opacity-60";

function OfferField({ icon: Icon, label, htmlFor, required = false, optional = false, children }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7f3ec] text-[#9b6b22] sm:h-11 sm:w-11 sm:rounded-2xl">
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <label htmlFor={htmlFor} className="mb-2 block text-sm font-bold leading-6 text-[#34485c] sm:text-base">
          {label}{required && <span aria-hidden="true" className="ml-1 text-[#b3483d]">*</span>}
          {optional && <span className="ml-1 text-xs font-normal text-[#718092]">({t("optional")})</span>}
        </label>
        {children}
      </div>
    </div>
  );
}

export default function AgencyOfferForm({ budget, onBudgetChange, comment, onCommentChange, selectedFile, onFileSelect, offerForm, onOfferChange, onSubmit, isSubmitting }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const validBudget = Number.isFinite(Number(budget)) && Number(budget) > 0;
  const validDiscount = !offerForm.applyDiscount || (Number(offerForm.discount) > 0 && Number(offerForm.discount) <= 100);
  const canSubmit = validBudget && comment.trim() && validDiscount && !isSubmitting;

  const removeFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form className="agency-offer-form space-y-6 px-4 py-5 sm:space-y-7 sm:px-7 sm:py-7" onSubmit={(event) => { event.preventDefault(); if (canSubmit) onSubmit(); }}>
      <OfferField icon={Tag} label={t("agency_offer_price")} htmlFor="agency-offer-budget" required>
        <div className="relative">
          <input id="agency-offer-budget" type="number" inputMode="decimal" min="0.01" step="0.01" required value={budget || ""} onChange={(event) => onBudgetChange(event.target.value)} placeholder={t("agency_offer_price_placeholder")} disabled={isSubmitting} className={`${inputClass} h-12 pr-12`} />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-base font-bold text-[#9b6b22]" aria-hidden="true">€</span>
        </div>
      </OfferField>

      <OfferField icon={FileText} label={t("agency_offer_details")} htmlFor="agency-offer-comment" required>
        <textarea id="agency-offer-comment" required value={comment} onChange={(event) => onCommentChange(event.target.value)} placeholder={t("agency_offer_details_placeholder")} rows={4} disabled={isSubmitting} className={`${inputClass} min-h-32 resize-y py-3 leading-6`} />
      </OfferField>

      <OfferField icon={Paperclip} label={t("agency_offer_attachment")} htmlFor="agency-offer-file" optional>
        <label
          className={`relative flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-3 py-4 text-center transition-colors focus-within:border-[#bd8525] focus-within:ring-2 focus-within:ring-[#e5ad42]/20 ${isDragging ? "border-[#c88f2a] bg-[#fff4dd]" : "border-[#d4dce3] bg-[#fafbfc] hover:border-[#c88f2a] hover:bg-[#fffaf0]"} ${isSubmitting ? "pointer-events-none opacity-60" : ""}`}
          onDragOver={(event) => { event.preventDefault(); if (!isSubmitting) setIsDragging(true); }}
          onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false); }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (!isSubmitting && event.dataTransfer.files[0]) onFileSelect(event.dataTransfer.files[0]);
          }}
        >
          <input id="agency-offer-file" ref={fileInputRef} type="file" onChange={(event) => onFileSelect(event.target.files[0] || null)} disabled={isSubmitting} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-describedby="agency-offer-file-hint" />
          <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
            <UploadCloud size={21} className="text-[#b98427]" aria-hidden="true" />
            <span className="font-bold text-[#9b6b22]">{t("choose_file")}</span>
            <span className="text-[#617082]">{t("agency_offer_drop_file")}</span>
          </span>
          <span id="agency-offer-file-hint" className="max-w-sm text-xs leading-5 text-[#718092]">{t("agency_offer_attachment_hint")}</span>
        </label>
        {selectedFile && (
          <div role="status" className="mt-2 flex min-w-0 items-center gap-2 rounded-xl border border-[#e9e6e0] bg-[#f7f3ec] px-3 py-2">
            <Paperclip size={15} className="shrink-0 text-[#9b6b22]" aria-hidden="true" />
            <span className="min-w-0 flex-1 break-all text-xs font-semibold leading-5 text-[#34485c]">{selectedFile.name}</span>
            <button type="button" onClick={removeFile} disabled={isSubmitting} aria-label={t("agency_offer_remove_file")} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#617082] hover:bg-white hover:text-[#9d4635] focus-visible:outline-2 focus-visible:outline-[#bd8525]"><X size={16} aria-hidden="true" /></button>
          </div>
        )}
      </OfferField>

      <OfferField icon={Percent} label={t("agency_offer_discount")} htmlFor="agency-offer-discount" optional>
        <label className="mb-3 flex cursor-pointer items-start gap-2.5 text-xs font-semibold leading-5 text-[#536477] sm:text-sm">
          <input type="checkbox" name="applyDiscount" checked={offerForm.applyDiscount} onChange={onOfferChange} disabled={isSubmitting} className="mt-0.5 h-4 w-4 shrink-0 accent-[#c88f2a]" aria-controls="agency-offer-discount" />
          <span>{t("apply_additional_discount")}</span>
        </label>
        <div className="relative">
          <input id="agency-offer-discount" type="number" name="discount" inputMode="decimal" min="0.01" max="100" step="0.01" value={offerForm.discount} onChange={onOfferChange} placeholder={t("discount_placeholder")} required={offerForm.applyDiscount} disabled={!offerForm.applyDiscount || isSubmitting} aria-describedby="agency-offer-discount-hint" className={`${inputClass} h-12 pr-12`} />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-base font-bold text-[#9b6b22]" aria-hidden="true">%</span>
        </div>
        <p id="agency-offer-discount-hint" className="mt-2 text-xs leading-5 text-[#718092]">{t("agency_offer_discount_hint")}</p>
      </OfferField>

      <div className="border-t border-[#edf0f2] pt-5">
        <button type="submit" disabled={!canSubmit} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c88f2a] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#ad751c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ad751c] disabled:cursor-not-allowed disabled:bg-[#d8c49f] sm:text-base">
          {isSubmitting ? <LoaderCircle size={19} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Send size={19} aria-hidden="true" />}
          {isSubmitting ? t("submitting") : t("submit_offer")}
        </button>
      </div>
    </form>
  );
}
