import { cn } from '../../lib/cn';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CORES_AVATAR = [
  'bg-teal-500 text-white dark:bg-teal-600',
  'bg-emerald-500 text-white dark:bg-emerald-600',
  'bg-cyan-500 text-white dark:bg-cyan-600',
  'bg-amber-500 text-white dark:bg-amber-600',
  'bg-indigo-500 text-white dark:bg-indigo-600',
  'bg-rose-500 text-white dark:bg-rose-600',
];

export function Avatar({ name, size = 'md', className }: AvatarProps): React.ReactNode {
  const partes = name.trim().split(/\s+/);
  const iniciais =
    partes.length === 1
      ? partes[0].slice(0, 2).toUpperCase()
      : (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const cor = CORES_AVATAR[Math.abs(hash) % CORES_AVATAR.length];

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-2xl font-black shadow-sm',
        {
          'h-8 w-8 text-[10px]': size === 'sm',
          'h-10 w-10 text-xs': size === 'md',
          'h-14 w-14 text-base': size === 'lg',
        },
        cor,
        className,
      )}
    >
      {iniciais}
    </div>
  );
}
