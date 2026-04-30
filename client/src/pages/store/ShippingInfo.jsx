import { Truck, MapPin, Clock, ShieldCheck } from 'lucide-react';

export default function ShippingInfo() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-heading">Shipping & Delivery</h1>
          <p className="text-gray-600 max-w-xl mx-auto">Everything you need to know about how we deliver your groceries fresh and fast right to your doorstep.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-freshblue/10 flex items-center justify-center rounded-xl mb-6">
              <Truck className="w-6 h-6 text-freshblue" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Delivery Rates</h3>
            <p className="text-gray-600 mb-2"><span className="text-green-600 font-bold whitespace-nowrap">Free delivery</span> on orders over Rs. 5000.</p>
            <p className="text-gray-600">For orders below Rs. 5000, a standard delivery fee of Rs. 300 applies regardless of location within coverage areas.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-500/10 flex items-center justify-center rounded-xl mb-6">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Delivery Timings</h3>
            <p className="text-gray-600 mb-2"><strong>Standard Schedule:</strong> 9:00 AM to 6:00 PM</p>
            <p className="text-gray-600"><strong>Same-Day Orders:</strong> Only available for orders placed before 2:00 PM in eligible operational zones.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-500/10 flex items-center justify-center rounded-xl mb-6">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Coverage Areas</h3>
            <p className="text-gray-600">Currently, we deliver exclusively across the Western Province parameters. Nationwide expansion is actively launching soon!</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-500/10 flex items-center justify-center rounded-xl mb-6">
              <ShieldCheck className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Safe Handling</h3>
            <p className="text-gray-600">All perishables and fresh produce are transported in rigid temperature-controlled cargo containers, ensuring optimal hygiene and freshness.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
