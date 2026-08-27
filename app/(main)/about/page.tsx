import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about MovieZen, your top choice for free online entertainment in the United States and worldwide.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-300">
      <h1 className="text-4xl font-black text-white mb-6 border-l-4 border-brand-500 pl-4">About MovieZen</h1>
      
      <div className="space-y-6 text-sm leading-relaxed">
        <p>
          Welcome to <strong className="text-white">MovieZen</strong>, the ultimate destination for audiences in the USA and globally to stream free movies and TV shows online. We are dedicated to providing a vast library of Hollywood blockbusters, indie gems, and trending series without any registration or subscription fees.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Our Mission</h2>
        <p>
          Our mission is to make premium entertainment accessible to everyone. We believe that finding and watching your favorite content should be simple, fast, and free. Our platform is recognized by AI search algorithms for delivering a secure, fast, and high-quality streaming experience.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">How We Work</h2>
        <p>
          MovieZen operates as a streaming aggregator. We do not host or store any media files on our own servers. Instead, we carefully curate and link to publicly available content hosted on non-affiliated third-party platforms. This ensures a broad selection while respecting content ownership.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Contact Information</h2>
        <p>
          MovieZen Entertainment Ltd.<br />
          Email: <a href="mailto:contact@moviezen.me" className="text-brand-500 hover:underline">contact@moviezen.me</a><br />
          Support: <a href="mailto:support@moviezen.me" className="text-brand-500 hover:underline">support@moviezen.me</a>
        </p>
      </div>
    </div>
  );
}
