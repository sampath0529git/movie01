import React from 'react';
import SEO from '../components/SEO';

export default function DisclaimerView() {
  return (
    <>
      <SEO 
        title="Disclaimer" 
        description="Disclaimer for MovieZen" 
        type="website" 
      />
      <div className="max-w-4xl mx-auto px-6 py-16 w-full text-gray-300">
        <h1 className="text-3xl font-bold text-white mb-8">Disclaimer</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <p>
            The information provided by MovieZen ("we," "us," or "our") on our website is for general informational 
            purposes only. All information on the Site is provided in good faith, however, we make no representation 
            or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, 
            availability, or completeness of any information on the Site.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">External Links Disclaimer</h2>
          <p>
            The Site may contain (or you may be sent through the Site) links to other websites or content belonging 
            to or originating from third parties. Such external links are not investigated, monitored, or checked for 
            accuracy, adequacy, validity, reliability, availability, or completeness by us.
          </p>
          <p>
            <strong>
              WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR THE ACCURACY OR RELIABILITY OF ANY 
              INFORMATION OFFERED BY THIRD-PARTY WEBSITES LINKED THROUGH THE SITE.
            </strong>
          </p>
          <p>
            MovieZen does not host any files on its servers. All videos and files are hosted on third-party services 
            outside of our control. We are not responsible for the content hosted on those servers.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Errors and Omissions Disclaimer</h2>
          <p>
            While we have made every attempt to ensure that the information contained in this site has been obtained 
            from reliable sources, MovieZen is not responsible for any errors or omissions or for the results obtained 
            from the use of this information.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Fair Use Disclaimer</h2>
          <p>
            If you wish to use copyrighted material from the Site for purposes of your own that go beyond fair use, you 
            must obtain permission from the copyright owner.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Contact Us</h2>
          <p>
            Should you have any feedback, comments, requests for technical support, or other inquiries, please contact 
            us at:
          </p>
          <p className="font-mono bg-[#0d1400] p-3 rounded mt-2 border border-[#1a2700] inline-block">
            Email: contact@moviezen.com
          </p>
        </div>
      </div>
    </>
  );
}
