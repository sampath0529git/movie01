import React from 'react';
import SEO from '../components/SEO';

export default function DmcaView() {
  return (
    <>
      <SEO 
        title="DMCA Policy"
        description="DMCA Policy for MovieVibe" 
        type="website" 
      />
      <div className="max-w-4xl mx-auto px-6 py-16 w-full text-gray-300">
        <h1 className="text-3xl font-bold text-white mb-8">DMCA Policy</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <p>
            This Digital Millennium Copyright Act policy ("Policy") applies to the 
            MovieZen website ("Website" or "Service") and any of its related products and services.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">Reporting Copyright Infringement</h2>
          <p>
            If you are a copyright owner or an agent thereof, and you believe that any material available on our 
            Services infringes your copyrights, then you may submit a written copyright infringement notification 
            ("Notification") using the contact details provided below pursuant to the DMCA.
          </p>
          
          <p>All such Notifications must comply with DMCA requirements. You must include the following information:</p>
          
          <ul className="list-disc pl-6 space-y-2">
            <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed.</li>
            <li>Information reasonably sufficient to permit the service provider to contact the complaining party, such as an address, telephone number, and, if available, an electronic mail address.</li>
            <li>A statement that the complaining party has a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Contact Information</h2>
          <p>
            Please contact us using the form below or via our email for any DMCA notice claims.
            Please allow 1-3 business days for an email response.
          </p>
          <p className="font-mono bg-[#0d1400] p-3 rounded mt-2 border border-[#1a2700] inline-block">
            Email: dmca@movievibe.com
          </p>

          <p className="mt-8 text-xs text-gray-500">
            Note: We do not host any of the media files on our own servers. We only link to third-party services.
          </p>
        </div>
      </div>
    </>
  );
}
