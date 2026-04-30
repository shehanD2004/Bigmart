import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../../features/auth/authApiSlice';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [registerUser, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    try {
      const userData = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      }).unwrap();
      
      setIsSuccess(true);
      toast.success(userData.message || 'Registration successful!');
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
          <div className="w-16 h-16 bg-blue-50 text-electric rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-navy-900 mb-2">Check your inbox</h2>
          <p className="text-slate-600 mb-6">
            We've sent a verification email to <strong>{formData.email}</strong>. 
            Please click the link in the email to activate your account.
          </p>
          <Link to="/login" className="inline-block w-full py-2.5 bg-electric text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-navy-900 font-heading">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or <Link to="/login" className="font-medium text-electric hover:text-blue-600">login to your existing account</Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input type="text" name="name" required className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-electric focus:border-electric sm:text-sm" placeholder="John Doe" value={formData.name} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input type="email" name="email" required className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-electric focus:border-electric sm:text-sm" placeholder="Email address" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" name="password" required className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-electric focus:border-electric sm:text-sm" placeholder="Password" value={formData.password} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <input type="password" name="confirmPassword" required className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-electric focus:border-electric sm:text-sm" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
            </div>
          </div>
          <div>
            <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-electric hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric transition-colors disabled:opacity-70">
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Register;
