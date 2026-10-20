import React, { useState } from 'react';
import { User } from 'lucide-react';
import type { UserRole } from '../../types';

interface UserAvatarProps {
  avatar?: string;
  name: string;
  role?: UserRole;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
  xl: 'h-16 w-16 text-lg',
};

const iconSizes: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-7 w-7',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  // If avatar URL contains the deleted photo ID or is empty, do not display it
  const isDeletedPhoto = avatar && avatar.includes('photo-1507003211169-0a1dd7228f2d');
  const hasValidImage = Boolean(avatar && avatar.trim() !== '' && !isDeletedPhoto && !imgError);

  // Generate clean 1-2 letter initials
  const initials = (name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  if (hasValidImage) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 flex-shrink-0 ${className}`}
      />
    );
  }

  // Elegant fallback avatar with initials
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-navy-950 via-navy-900 to-slate-800 text-amber-400 font-bold border border-slate-200/80 shadow-xs flex items-center justify-center flex-shrink-0 select-none tracking-wider ${className}`}
      title={name}
      aria-label={name}
    >
      {initials ? initials : <User className={iconSizes[size]} />}
    </div>
  );
};
