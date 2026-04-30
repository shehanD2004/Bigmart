import { useState } from 'react';
import { useTrackOrderQuery } from '../../features/api/storeApiSlice';
import { Search, Package, Clock, Truck, CheckCircle2, AlertCircle, Loader } from 'lucide-react';

export default function TrackOrder() {
  const [searchInput, setSearchInput] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const { data, isLoading, isError, isFetching } = useTrackOrderQuery(orderNumber, {
    skip: !orderNumber,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setOrderNumber(searchInput.trim());
    }
  };

  const steps = [
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'processing', label: 'Processing', icon: Package },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed':
      case 'processing':
      case 'packed': return 1;
      case 'shipped':
      case 'out_for_delivery': return 2;
      case 'delivered': return 3;
      case 'cancelled':
      case 'returned': return -1;
      default: return 0;
    }
  };

  const currentStep = data?.data ? getStepIndex(data.data.orderStatus) : -1;

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-heading">Track Your Order</h1>
          <p className="text-gray-600">Enter your order tracking number to see the current status of your delivery.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. ORD-20231201-00123"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-freshblue/30 focus:border-freshblue transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || isFetching}
              className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-freshblue-dark transition-colors disabled:opacity-70 whitespace-nowrap shadow-lg shadow-freshblue/20 hover:shadow-freshblue/40"
            >
              Track
            </button>
          </form>
        </div>

        {/* Loading State */}
        {(isLoading || isFetching) && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-12 h-12 text-freshblue animate-spin mb-4" />
            <p className="text-gray-600">Locating your order...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && !isFetching && isError && orderNumber && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center animate-in fade-in zoom-in-95">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-600">We couldn't find an order matching <span className="font-semibold text-gray-900">{orderNumber}</span>. Please check the number and try again.</p>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isFetching && data?.data && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 animate-in fade-in zoom-in-95">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-gray-100 gap-4">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Order Number</p>
                <h2 className="text-2xl font-bold text-gray-900">{data.data.orderNumber}</h2>
              </div>
              <div className="md:text-right">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Order Placed</p>
                <p className="text-gray-900 font-medium">
                  {new Date(data.data.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: 'numeric', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {data.data.orderStatus === 'cancelled' || data.data.orderStatus === 'returned' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Order {data.data.orderStatus === 'cancelled' ? 'Cancelled' : 'Returned'}</h3>
                <p className="text-gray-600">This order is no longer active.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Stepper Logic */}
                <div className="flex flex-col md:flex-row justify-between mb-8 relative z-10 px-4 md:px-0">
                  {/* Background Line (Desktop) */}
                  <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-1 bg-gray-100 -z-10 rounded-full">
                    {/* Active Line */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-freshblue rounded-full transition-all duration-1000 ease-in-out"
                      style={{ width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 100}%` }}
                    />
                  </div>

                  {steps.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className={`flex flex-row md:flex-col items-center gap-6 md:gap-4 mb-8 md:mb-0 relative ${index > currentStep ? 'opacity-50 grayscale' : ''}`}>
                        {/* Mobile line connector */}
                        {index !== steps.length - 1 && (
                          <div className="md:hidden absolute left-[28px] top-[56px] bottom-[-32px] w-0.5 bg-gray-100 -z-10">
                            {isCompleted && index < currentStep && (
                              <div className="w-full h-full bg-freshblue transition-all duration-1000 -z-10" />
                            )}
                          </div>
                        )}
                        
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-4 transition-all duration-500 ${
                          isCompleted 
                            ? 'bg-freshblue border-blue-50 text-white shadow-lg shadow-freshblue/30 scale-110' 
                            : 'bg-white border-gray-100 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-freshblue/20' : ''}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="md:text-center mt-1">
                          <p className={`font-bold tracking-tight ${isCurrent ? 'text-freshblue text-lg' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Current Status Message */}
                <div className="bg-freshblue/5 rounded-xl border border-freshblue/10 p-5 text-center mt-8 animate-in fade-in zoom-in duration-500 delay-300">
                  <p className="text-freshblue font-medium text-lg">
                    {currentStep === 0 && "We've received your order and are confirming the details."}
                    {currentStep === 1 && "Your items are being carefully picked and packed!"}
                    {currentStep === 2 && "The delivery partner has picked up your package. It's on the way!"}
                    {currentStep === 3 && "Your order has been successfully delivered. Enjoy!"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
