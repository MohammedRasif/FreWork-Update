"use client";
import React from 'react';
import { Clock, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import image from "../../assets/img/removebg.png"
import { NavLink } from 'react-router-dom';
function PendingForAdmin() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-center">
         <NavLink to="/">
           <div className='flex items-center justify-center pb-5'>
          <img src={image} className='h-16' alt="" />
        </div>
         </NavLink>
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-sm p-6 rounded-full">
              <Clock className="w-16 h-16 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            {t('pendings.title')} 
          </h1>
          <p className="text-blue-100 text-lg">
            {t('pendings.subtitle')}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                <ShieldCheck className="w-5 h-5" />
                <span>{t('pendings.underReview')}</span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {t('pendings.thankYou')}{' '}
              <span className="font-semibold text-gray-800">
                {t('pendings.timeframe')}
              </span>.
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 text-center">
              {t('pendings.currentStatus')}
            </h3>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {t('pendings.steps.1.title')}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {t('pendings.steps.1.subtitle')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {t('pendings.steps.2.title')}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {t('pendings.steps.2.subtitle')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 opacity-50">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-700">
                    {t('pendings.steps.3.title')}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {t('pendings.steps.3.subtitle')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            {t('pendings.thankYouPatience')} • {new Date().getFullYear()} © VacanzaMyCost.it
          </p>
        </div>
      </div>
    </div>
  );
}

export default PendingForAdmin;