import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function Terms() {
  const { t } = useTranslation();
   useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-gray-800 leading-relaxed text-base pt-24">
      <h1 className="lg:text-3xl text-xl font-bold text-center mb-8">
        {t('terms.title')}
      </h1>
      <div className="space-y-10 text-justify">
        <section>
          <h2 className="text-2xl font-bold mb-3">1. {t('terms.1.title')}</h2>
          <p className="whitespace-pre-line">{t('terms.1.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">2. {t('terms.2.title')}</h2>
          <p className="whitespace-pre-line">{t('terms.2.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">3. {t('terms.3.title')}</h2>
          <p className="whitespace-pre-line">{t('terms.3.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">4. {t('terms.4.title')}</h2>
          <p className="whitespace-pre-line">{t('terms.4.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">5. {t('terms.5.title')}</h2>
          <p className="whitespace-pre-line">{t('terms.5.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">6. {t('terms.6.title')}</h2>
          <p className="whitespace-pre-line">{t('terms.6.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">7. {t('terms.7.title')}</h2>
          <p className="whitespace-pre-line">{t('terms.7.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">8. {t('terms.8.title')}</h2>
          <p className="whitespace-pre-line">{t('terms.8.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">9. {t('terms.9.title')}</h2>
          <p>{t('terms.9.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">10. {t('terms.10.title')}</h2>
          <p className="whitespace-pre-line">{t('terms.10.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">11. {t('terms.11.title')}</h2>
          <p>{t('terms.11.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">12. {t('terms.12.title')}</h2>
          <p>{t('terms.12.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">13. {t('terms.13.title')}</h2>
          <p>{t('terms.13.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">14. {t('terms.14.title')}</h2>
          <p>{t('terms.14.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">15. {t('terms.15.title')}</h2>
          <p>{t('terms.15.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">16. {t('terms.16.title')}</h2>
          <p className="">{t('terms.16.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">17. {t('terms.17.title')}</h2>
          <p>{t('terms.17.text')}</p>
        </section>

      </div>

      <p className="text-center text-gray-600 mt-16 text-sm">
        © 2025 VacanzaMyCost.it – Tutti i diritti riservati.
      </p>
    </div>
  );
}

export default Terms;