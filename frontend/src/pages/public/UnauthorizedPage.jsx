import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  const getHomeLink = () => {
    if (!user) return '/';
    return `/${user.role}/dashboard`;
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">403 - Access Denied</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          You do not have the required permissions or role privileges to view this restricted page.
        </p>
        <div className="pt-4">
          <Link
            to={getHomeLink()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-royal-600 hover:bg-royal-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Authorized Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
