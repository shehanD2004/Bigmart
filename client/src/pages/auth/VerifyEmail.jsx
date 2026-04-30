import { useParams, Link } from 'react-router-dom';
import { useVerifyEmailQuery } from '../../features/auth/authApiSlice';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const { data, isLoading, isError, error } = useVerifyEmailQuery(token);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <Loader className="w-16 h-16 text-freshblue animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Verifying Email...</h2>
            <p className="mt-2 text-slate-600">Please wait while we verify your token.</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-slate-600">
              {error?.data?.message || 'Invalid or expired verification token.'}
            </p>
            <Link to="/register" className="mt-6 inline-block bg-freshblue text-white px-6 py-2 rounded-lg font-medium hover:bg-freshblue-dark transition-colors">
              Sign Up Again
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="mt-2 text-slate-600">
              {data?.message || 'Your email has been successfully verified.'}
            </p>
            <Link to="/login" className="mt-6 inline-block bg-freshblue text-white px-6 py-2 rounded-lg font-medium hover:bg-freshblue-dark transition-colors">
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
