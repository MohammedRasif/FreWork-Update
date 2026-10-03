import { useGetTuristProfileQuery } from "@/redux/features/withAuth";
import { Mail, MapPin, Pencil, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function InfoSection({ title, icon: Icon, fields, empty }) {
  return (
    <section className="rounded-[22px] border border-[#e9e6e0] bg-white p-5 shadow-[0_10px_35px_rgba(23,43,67,0.04)] sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4dd] text-[#b98427]"><Icon size={19} aria-hidden="true" /></span>
        <h3 className="text-lg font-bold text-[#172b43]">{title}</h3>
      </div>
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(({ label, value }) => <div key={label} className="min-w-0 border-b border-[#f0eee9] pb-4">
          <dt className="text-xs font-semibold text-[#718092]">{label}</dt>
          <dd className="mt-1 break-words text-sm font-semibold text-[#172b43]">{value || empty}</dd>
        </div>)}
      </dl>
    </section>
  );
}

export default function UserProfile() {
  const { t } = useTranslation();
  const { data: user = {}, isLoading } = useGetTuristProfileQuery();
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || t("user");
  const location = [user.address_city, user.address_country].filter(Boolean).join(", ");
  const personalFields = [
    { label: t("first_name"), value: user.first_name },
    { label: t("last_name"), value: user.last_name },
    { label: t("age"), value: user.age ? t("years", { count: user.age }) : "" },
    { label: t("gender"), value: user.gender },
    { label: t("language"), value: user.language },
    { label: t("phone_home"), value: user.phone_personal },
    { label: t("email_personal"), value: user.email },
  ];
  const addressFields = [
    { label: t("house_no"), value: user.address_house_no },
    { label: t("road_no"), value: user.address_road_no },
    { label: t("city_state"), value: user.address_city },
    { label: t("country"), value: user.address_country },
    { label: t("post_code"), value: user.address_postal_code },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white text-sm text-[#617082]" role="status">{t("loading")}</div>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="mb-3 h-1 w-10 rounded-full bg-[#d6a044]" /><h2 className="text-2xl font-bold tracking-tight text-[#172b43] sm:text-3xl">{t("profile_details")}</h2></div>
            <Link to="/cont/modifica-profil" className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#c88f2a] px-5 text-sm font-bold text-white transition-colors hover:bg-[#ad751c]"><Pencil size={17} aria-hidden="true" />{t("edit")}</Link>
          </div>

          <section className="overflow-hidden rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
            <div className="h-24 bg-[#172b43] sm:h-28" />
            <div className="px-5 pb-6 sm:px-7">
              <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#c88f2a] text-3xl font-bold text-white shadow-sm sm:h-24 sm:w-24">
                  <span aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
                  {user.profile_picture_url && <img src={user.profile_picture_url} onError={(event) => { event.currentTarget.style.display = "none"; }} alt={t("user_profile")} className="absolute inset-0 h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 pb-1"><h3 className="break-words text-xl font-bold text-[#172b43] sm:text-2xl">{name}</h3><p className="mt-1 text-sm text-[#617082]">{user.profession || t("na")}</p></div>
                {user.is_verified && <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#e9f3ed] px-3 py-1.5 text-xs font-bold text-[#397055] sm:mb-2 sm:ml-auto sm:self-end"><ShieldCheck size={15} aria-hidden="true" />{t("verified")}</span>}
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#617082]">
                {location && <span className="inline-flex items-center gap-1.5"><MapPin size={15} className="text-[#b98427]" aria-hidden="true" />{location}</span>}
                {user.email && <span className="inline-flex items-center gap-1.5 break-all"><Mail size={15} className="shrink-0 text-[#b98427]" aria-hidden="true" />{user.email}</span>}
              </div>
              {user.invitation_code && <p className="mt-4 text-xs font-semibold text-[#718092]">{t("invitation_code")}: <span className="text-[#172b43]">{user.invitation_code}</span></p>}
            </div>
          </section>

          <section className="rounded-[22px] border border-[#e9e6e0] bg-white p-5 shadow-[0_10px_35px_rgba(23,43,67,0.04)] sm:p-7">
            <h3 className="text-lg font-bold text-[#172b43]">{t("about_me")}</h3>
            <p className="mt-3 text-sm leading-7 text-[#617082]">{user.bio || t("na")}</p>
          </section>
          <InfoSection title={t("personal_information")} icon={UserRound} fields={personalFields} empty={t("na")} />
          <InfoSection title={t("address")} icon={MapPin} fields={addressFields} empty={t("na")} />
        </>
      )}
    </div>
  );
}
