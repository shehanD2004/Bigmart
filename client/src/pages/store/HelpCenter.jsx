import { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, MessageCircle, Phone } from 'lucide-react';

export default function HelpCenter() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by navigating to the Orders section in your account dashboard. You'll see real-time updates for processing, dispatched, and delivery statuses."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for sealed grocery items. For fresh produce and perishables, please report any issues within 24 hours of delivery. Navigate to the Returns section to initiate a request."
    },
    {
      question: "Do you offer same-day delivery?",
      answer: "Yes, we offer same-day delivery within selected zones for orders placed before 2:00 PM. Deliveries are typically completed by 6:00 PM."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach us via phone during business hours, email us anytime, or use the Live Support chat widget in the bottom right corner of the screen for instant assistance."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center font-heading">Help Center</h1>
        
        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center text-center border border-gray-100 hover:border-freshblue/30 transition-colors">
            <div className="w-14 h-14 bg-freshblue/10 text-freshblue rounded-2xl flex items-center justify-center mb-6">
              <Phone className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-sm text-gray-500 mb-4">Available 9 AM - 6 PM</p>
            <p className="font-bold text-freshblue">+94 78 768 9821</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center text-center border border-gray-100 hover:border-freshblue/30 transition-colors">
            <div className="w-14 h-14 bg-freshblue/10 text-freshblue rounded-2xl flex items-center justify-center mb-6">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
            <p className="text-sm text-gray-500 mb-4">Expect a reply in 24 hrs</p>
            <a href="mailto:support@onakobigmart.com" className="font-bold text-freshblue hover:underline">support@onakobigmart.com</a>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center text-center border border-gray-100 hover:border-emerald-500/30 transition-colors">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-sm text-gray-500 mb-4">Instant support via WhatsApp</p>
            <a 
              href="https://wa.me/94787689821?text=Hello%20Bigmart%20Support" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Start Chat
            </a>
          </div>
        </div>

        {/* FAQ Accordion */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-heading">Frequently Asked Questions</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-gray-100 last:border-0">
              <button 
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                aria-expanded={openIndex === idx}
              >
                <span className={`font-semibold transition-colors ${openIndex === idx ? 'text-freshblue' : 'text-gray-900'}`}>
                  {faq.question}
                </span>
                {openIndex === idx ? (
                  <ChevronUp className="w-5 h-5 text-freshblue shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 ml-4" />
                )}
              </button>
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === idx ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
