"use client";
import React from 'react';
import { Clock, ShieldCheck, Mail } from 'lucide-react';

function PendingForAdmin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header / Illustration Area */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-sm p-6 rounded-full">
              <Clock className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3">
            Application Pending
          </h1>
          <p className="text-blue-100 text-lg">
            Waiting for Admin Approval
          </p>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                <ShieldCheck className="w-5 h-5" />
                <span>Under Review</span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Thank you for submitting your request/application. 
              Our admin team is currently reviewing it. 
              This process usually takes <span className="font-semibold text-gray-800">24–48 hours</span>.
            </p>
          </div>

          {/* Timeline / Status Steps */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 text-center">
              Current Status
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Request Received</p>
                  <p className="text-sm text-gray-500 mt-0.5">Successfully submitted</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Under Review</p>
                  <p className="text-sm text-gray-500 mt-0.5">Admin team is checking</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 opacity-50">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Approved / Rejected</p>
                  <p className="text-sm text-gray-500 mt-0.5">You'll be notified soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact / Next Steps */}
         
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Thank you for your patience • {new Date().getFullYear()} © VacanzaMyCost.it
          </p>
        </div>
      </div>
    </div>
  );
}

export default PendingForAdmin;