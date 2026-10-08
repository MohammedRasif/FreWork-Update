import { useEffect, useState } from "react";
import { CalendarDays, Mail, MapPin, Pencil, Phone, ShieldCheck, Star, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useGetAgencyProfileQuery, useUpdateAgencyProfileMutation } from "@/redux/features/withAuth";
import PlanImage1 from "@/assets/img/plan-image-1.png";

function parseList(value) {
  if (!Array.isArray(value)) return [];
  if (value.length === 1 && typeof value[0] === "string") {
    try {
      const parsed = JSON.parse(value[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* A plain category string is still usable. */ }
  }
  return value.filter((item) => typeof item === "string");
}

export default function AdminProfile() {
  const { t, i18n } = useTranslation();
  const { data: profile, isLoading, isError, error, refetch } = useGetAgencyProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateAgencyProfileMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const name = profile?.agency_name || t("unnamed_agency");
  const categories = parseList(profile?.service_categories);
  const facilities = parseList(profile?.facilities);
  const categoryNames = { beach: t("beach_trips"), mountain: t("mountain_adventures"), desert: t("relaxing_tours"), island: t("group_packages") };
  const locale = i18n.language === "ru" ? "ru-RU" : "ro-RO";

  useEffect(() => {
    if (profile) {
      setFromDate(profile.start_unavailable?.split("T")[0] || "");
      setToDate(profile.end_unavailable?.split("T")[0] || "");
    }
  }, [profile]);

  const closeModal = () => setIsModalOpen(false);
  const handleReset = async () => {
    try {
      await updateProfile({ start_unavailable: "", end_unavailable: "" }).unwrap();
      await refetch();
      setFromDate("");
      setToDate("");
      closeModal();
    } catch (err) {
      toast.error(err?.data?.detail || err?.data?.message || t("failed_to_reset_unavailability"));
    }
  };
  const handleConfirm = async () => {
    if (!fromDate || !toDate) return toast.error(t("select_both_dates"));
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return toast.error(t("invalid_date_format"));
    if (start >= end) return toast.error(t("end_date_after_start"));
    try {
      start.setHours(14, 36, 34, 327);
      end.setHours(14, 36, 34, 327);
      await updateProfile({ start_unavailable: start.toISOString(), end_unavailable: end.toISOString() }).unwrap();
      await refetch();
      closeModal();
    } catch (err) {
      toast.error(err?.data?.detail || err?.data?.message || t("failed_to_set_unavailability"));
    }
  };

  if (isLoading) return <div className="flex min-h-48 items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8 text-sm text-[#617082]" role="status">{t("loading")}</div>;
  if (isError || !profile) return <div className="flex min-h-48 items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8 text-center text-sm text-[#9d4635]">{error?.data?.message || t("failed_to_load_profile")}</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="mb-3 h-1 w-10 rounded-full bg-[#d6a044]" /><h2 className="text-2xl font-bold tracking-tight text-[#172b43] sm:text-3xl">{t("agency_profile")}</h2><p className="mt-2 text-sm text-[#617082]">{t("set_profile_for_best_match")}</p></div>
        <Link to="/agentie/modifica-profil" className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#c88f2a] px-5 text-sm font-bold text-white transition-colors hover:bg-[#ad751c]"><Pencil size={17} aria-hidden="true" />{t("edit")}</Link>
      </div>

      <section className="overflow-hidden rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
        <div className="relative h-44 bg-[#f4eee4] sm:h-56">
          <img src={profile.cover_photo_url || PlanImage1} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = PlanImage1; }} alt={t("agency_cover")} className="h-full w-full object-cover" />
        </div>
        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#172b43] text-2xl font-bold text-white shadow-sm sm:h-20 sm:w-20">
              <span aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
              {profile.agency_logo_url && <img src={profile.agency_logo_url} onError={(event) => { event.currentTarget.style.display = "none"; }} alt={name} className="absolute inset-0 h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 pb-1"><h3 className="break-words text-xl font-bold text-[#172b43] sm:text-2xl">{name}</h3><p className="mt-1 text-sm text-[#617082]">{t("agency")}</p></div>
            {profile.is_verified && <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#e9f3ed] px-3 py-1.5 text-xs font-bold text-[#397055] sm:mb-2 sm:ml-auto sm:self-end"><ShieldCheck size={15} aria-hidden="true" />{t("verified")}</span>}
          </div>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#617082]">
            <span className="inline-flex items-center gap-1.5"><Star size={15} fill="#c88f2a" className="text-[#c88f2a]" aria-hidden="true" />{profile.rating || 0} ({profile.review_count || 0} {t("reviews")})</span>
            {profile.vat_id && <span className="font-semibold">{t("idno_label")}: {profile.vat_id}</span>}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <section className="rounded-[22px] border border-[#e9e6e0] bg-white p-6 shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
            <h3 className="text-lg font-bold text-[#172b43]">{t("about")}</h3>
            <p className="mt-3 text-sm leading-7 text-[#617082]">{profile.about || t("no_description_available")}</p>
          </section>
          <section className="rounded-[22px] border border-[#e9e6e0] bg-white p-6 shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
            <h3 className="text-lg font-bold text-[#172b43]">{t("our_service_category")}</h3>
            {categories.length ? <div className="mt-4 flex flex-wrap gap-2">{categories.map((category) => <span key={category} className="rounded-full bg-[#fff4dd] px-3 py-1.5 text-xs font-bold text-[#986919]">{categoryNames[category] || category}</span>)}</div> : <p className="mt-3 text-sm text-[#617082]">{t("no_categories_available")}</p>}
            {facilities.length > 0 && <div className="mt-5 border-t border-[#f0eee9] pt-5"><h4 className="text-sm font-bold text-[#34485c]">{t("facilities")}</h4><p className="mt-2 text-sm leading-6 text-[#617082]">{facilities.join(", ")}</p></div>}
          </section>
        </div>
        <aside className="space-y-5">
          <section className="rounded-[22px] border border-[#e9e6e0] bg-white p-6 shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
            <h3 className="text-base font-bold text-[#172b43]">{t("contact_information")}</h3>
            <div className="mt-4 space-y-3 text-sm text-[#617082]">
              {profile.contact_phone && <p className="flex items-start gap-2 break-all"><Phone size={16} className="mt-0.5 shrink-0 text-[#b98427]" aria-hidden="true" />{profile.contact_phone}</p>}
              {profile.contact_email && <p className="flex items-start gap-2 break-all"><Mail size={16} className="mt-0.5 shrink-0 text-[#b98427]" aria-hidden="true" />{profile.contact_email}</p>}
              {typeof profile.address === "string" && profile.address && <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-[#b98427]" aria-hidden="true" />{profile.address}</p>}
              {!profile.contact_phone && !profile.contact_email && !profile.address && <p>{t("no_contact_info")}</p>}
            </div>
          </section>
          <section className="rounded-[22px] border border-[#e9e6e0] bg-white p-6 shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4dd] text-[#b98427]"><CalendarDays size={19} aria-hidden="true" /></div>
            <h3 className="mt-4 text-base font-bold text-[#172b43]">{t("set_unavailability")}</h3>
            {profile.start_unavailable && profile.end_unavailable && <p className="mt-2 text-sm leading-6 text-[#617082]">{new Date(profile.start_unavailable).toLocaleDateString(locale)} — {new Date(profile.end_unavailable).toLocaleDateString(locale)}</p>}
            <button type="button" onClick={() => setIsModalOpen(true)} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d8dfe5] px-4 text-sm font-bold text-[#172b43] hover:bg-[#f7f3ec]"><Pencil size={16} aria-hidden="true" />{t("edit")}</button>
          </section>
        </aside>
      </div>

      {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243a]/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="unavailability-title" className="w-full max-w-md rounded-[22px] border border-[#e9e6e0] bg-white p-6 shadow-[0_24px_70px_rgba(16,36,58,0.25)] sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4"><div><div className="mb-3 h-1 w-9 rounded-full bg-[#d6a044]" /><h2 id="unavailability-title" className="text-xl font-bold text-[#172b43]">{t("set_unavailability")}</h2></div><button type="button" onClick={closeModal} aria-label={t("close")} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#617082] hover:bg-[#f2f4f5]"><X size={20} aria-hidden="true" /></button></div>
          <div className="space-y-4">
            <div><label htmlFor="agency-unavailable-from" className="mb-1.5 block text-sm font-semibold text-[#34485c]">{t("from")}</label><input id="agency-unavailable-from" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} min={new Date().toISOString().split("T")[0]} className="h-11 w-full rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 text-sm focus:border-[#c88f2a] focus:outline-none focus:ring-2 focus:ring-[#c88f2a]/15" /></div>
            <div><label htmlFor="agency-unavailable-to" className="mb-1.5 block text-sm font-semibold text-[#34485c]">{t("to")}</label><input id="agency-unavailable-to" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} min={fromDate || new Date().toISOString().split("T")[0]} className="h-11 w-full rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 text-sm focus:border-[#c88f2a] focus:outline-none focus:ring-2 focus:ring-[#c88f2a]/15" /></div>
            <div className="flex gap-2 pt-2"><button type="button" onClick={handleReset} disabled={isSaving} className="min-h-11 flex-1 rounded-xl border border-[#d8dfe5] px-4 text-sm font-semibold text-[#172b43] hover:bg-[#f7f3ec]">{t("reset")}</button><button type="button" onClick={handleConfirm} disabled={isSaving} className="min-h-11 flex-1 rounded-xl bg-[#c88f2a] px-4 text-sm font-bold text-white hover:bg-[#ad751c] disabled:opacity-60">{isSaving ? t("submitting") : t("confirm")}</button></div>
          </div>
        </div>
      </div>}
    </div>
  );
}
