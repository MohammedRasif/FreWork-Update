import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, LockKeyhole, Mail, MapPin, Send } from "lucide-react";
import image from "../../assets/img/contact.jpg";

const inputClass = "h-12 w-full rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 text-sm text-[#172b43] placeholder:text-[#96a2af] transition-colors focus:border-[#bd8525] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20 aria-invalid:border-[#ba5549] aria-invalid:bg-[#fff8f6] sm:text-base";

const contactFields = [
  { name: "firstName", label: "first_name", required: "first_name_required", autoComplete: "given-name" },
  { name: "lastName", label: "last_name", required: "last_name_required", autoComplete: "family-name" },
  { name: "email", label: "email", required: "email_required", type: "email", autoComplete: "email", placeholder: "email@example.com" },
  { name: "phoneNumber", label: "phone_number", required: "phone_required", type: "tel", autoComplete: "tel" },
  { name: "town", label: "town", required: "town_required", autoComplete: "address-level2" },
  { name: "location", label: "location", required: "location_required", autoComplete: "street-address" },
];

const Contact = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    alert(t("form_submitted_success"));
    reset();
  };

  return (
    <main className="contact-page min-h-screen bg-[#faf9f6] pt-[72px] text-[#172b43] xl:pt-[82px]">
      <header className="bg-[#172b43] pb-28 pt-12 text-white sm:pb-32 sm:pt-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-5 h-1 w-12 rounded-full bg-[#d6a044]" />
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#e8b75b]">TreiOferte</p>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{t("contact_us")}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{t("have_question_reach_out")}</p>
        </div>
      </header>

      <div className="relative mx-auto -mt-12 grid max-w-7xl items-start gap-6 px-5 pb-20 sm:gap-8 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:px-10">
        <section aria-labelledby="contact-form-title" className="min-w-0 rounded-[24px] border border-[#e9e6e0] bg-white p-6 shadow-[0_18px_55px_rgba(23,43,67,0.08)] sm:p-8 lg:col-start-2 lg:row-start-1 xl:p-10">
          <div className="mb-5 h-1 w-10 rounded-full bg-[#d6a044]" />
          <h2 id="contact-form-title" className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{t("contact_page.form_title")}</h2>
          <p className="mt-3 text-sm leading-6 text-[#617082] sm:text-base">{t("contact_page.form_description")}</p>
          <p className="mt-2 text-xs leading-5 text-[#718092]">{t("contact_page.required_fields")}</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-5">
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              {contactFields.map(({ name, label, required, type = "text", autoComplete, placeholder }) => (
                <div key={name} className="min-w-0">
                  <label htmlFor={`contact-${name}`} className="mb-2 block text-sm font-semibold text-[#34485c]">
                    {t(label)} <span className="text-[#a36f1d]" aria-hidden="true">*</span>
                  </label>
                  <input
                    id={`contact-${name}`}
                    type={type}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    aria-required="true"
                    aria-invalid={Boolean(errors[name])}
                    aria-describedby={errors[name] ? `contact-${name}-error` : undefined}
                    {...register(name, {
                      required: t(required),
                      ...(name === "email" ? { pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t("invalid_email") } } : {}),
                    })}
                    className={inputClass}
                  />
                  {errors[name] && <p id={`contact-${name}-error`} role="alert" className="mt-2 text-xs leading-5 text-[#a34438]">{errors[name].message}</p>}
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-[#34485c]">
                {t("how_can_we_help")} <span className="text-[#a36f1d]" aria-hidden="true">*</span>
              </label>
              <textarea
                id="contact-message"
                {...register("message", { required: t("message_required") })}
                aria-required="true"
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                rows={5}
                className={`${inputClass} min-h-36 resize-y py-3 leading-6`}
              />
              {errors.message && <p id="contact-message-error" role="alert" className="mt-2 text-xs leading-5 text-[#a34438]">{errors.message.message}</p>}
            </div>

            <div className="flex items-start gap-2.5 border-t border-[#edf0f2] pt-5 text-xs leading-5 text-[#718092] sm:text-sm">
              <LockKeyhole size={16} className="mt-0.5 shrink-0 text-[#b98427]" aria-hidden="true" />
              <p>{t("contact_page.privacy_text")} <Link to="/politica-de-confidentialitate" className="font-semibold text-[#9d6b1e] underline decoration-[#d6a044]/50 underline-offset-4 hover:text-[#755018]">{t("privacy_policy")}</Link>.</p>
            </div>
            <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c88f2a] px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-[#ad751c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9e6c20] sm:w-auto sm:text-base">
              {t("submit")} <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </section>

        <aside className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
          <section aria-labelledby="contact-details-title" className="rounded-[24px] border border-[#e9e6e0] bg-white p-6 shadow-[0_12px_36px_rgba(23,43,67,0.05)] sm:p-8">
            <h2 id="contact-details-title" className="text-xl font-bold tracking-tight sm:text-2xl">{t("contact_information")}</h2>
            <p className="mt-3 text-sm leading-6 text-[#617082]">{t("contact_page.direct_description")}</p>
            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff4dd] text-[#b98427]"><Mail size={21} aria-hidden="true" /></span>
                <div className="min-w-0 pt-0.5"><p className="text-sm font-bold">{t("email")}</p><a href="mailto:info@treioferte.md" className="mt-1 inline-flex min-h-8 items-center gap-1 text-sm font-semibold text-[#9d6b1e] hover:text-[#755018]">{t("email_contact")} <ArrowUpRight size={15} className="shrink-0" aria-hidden="true" /></a></div>
              </div>
              <div className="flex items-start gap-4 border-t border-[#edf0f2] pt-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f0f2] text-[#34546d]"><MapPin size={21} aria-hidden="true" /></span>
                <div className="min-w-0 pt-0.5"><p className="text-sm font-bold">{t("address_line1")}</p><p className="mt-2 text-sm leading-6 text-[#617082]">{t("address_line2")}</p></div>
              </div>
            </div>
          </section>

          <section className="relative isolate overflow-hidden rounded-[24px] bg-[#172b43] p-7 text-white sm:p-8">
            <img src={image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#10243a]/95 via-[#10243a]/80 to-[#10243a]/50" />
            <div className="pt-20 sm:pt-24">
              <div className="mb-5 h-1 w-10 rounded-full bg-[#d6a044]" />
              <h2 className="max-w-sm text-2xl font-bold leading-tight tracking-tight">{t("contact_page.panel_title")}</h2>
              <Link to="/cum-functioneaza" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold transition-colors hover:border-[#d6a044] hover:text-[#e8b75b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{t("who_work")} <ArrowUpRight size={17} aria-hidden="true" /></Link>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
};

export default Contact;
