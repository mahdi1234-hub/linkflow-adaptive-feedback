import React from 'react';
import { User, Mail, Shield, Zap } from 'lucide-react';

interface Props {
  user: any;
}

const UserProfile: React.FC<Props> = ({ user }) => {
  return (
    <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-heading-accent/20 flex items-center justify-center text-heading-primary">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-dark-green">{user.full_name}</h3>
          <div className="flex items-center gap-1 text-sm text-body-text-green">
            <Mail className="w-3 h-3" /> {user.email}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="bg-white/50 p-3 rounded-xl border border-white/40">
          <div className="flex items-center gap-1 text-xs text-body-text-green mb-1">
            <Shield className="w-3 h-3" /> Security
          </div>
          <div className="text-sm font-semibold text-dark-green">Verified</div>
        </div>
        <div className="bg-white/50 p-3 rounded-xl border border-white/40">
          <div className="flex items-center gap-1 text-xs text-body-text-green mb-1">
            <Zap className="w-3 h-3" /> Sessions
          </div>
          <div className="text-sm font-semibold text-dark-green">{user.visit_count} visits</div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
