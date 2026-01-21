import { CreditCard, Banknote, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

type PaymentMethod = 'STRIPE' | 'COD' | string;

interface PaymentMethodIconProps {
  method: PaymentMethod;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const methodConfig: Record<
  string,
  {
    label: string;
    description: string;
    icon: typeof CreditCard;
    color: string;
    bg: string;
  }
> = {
  STRIPE: {
    label: 'Card Payment',
    description: 'Paid via Stripe',
    icon: CreditCard,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  COD: {
    label: 'Cash on Delivery',
    description: 'Pay ৳ when delivered',
    icon: Banknote,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const containerSizes = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
};

export function PaymentMethodIcon({
  method,
  size = 'md',
  showLabel = false,
  className,
}: PaymentMethodIconProps) {
  const config = methodConfig[method] ?? {
    label: method,
    description: 'Payment method',
    icon: Wallet,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
  };

  const Icon = config.icon;

  if (showLabel) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div
          className={cn(
            'flex items-center justify-center rounded-lg',
            config.bg,
            containerSizes[size],
          )}
        >
          <Icon className={cn(iconSizes[size], config.color)} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{config.label}</p>
          <p className="text-xs text-gray-500">{config.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg',
        config.bg,
        containerSizes[size],
        className,
      )}
      title={config.label}
    >
      <Icon className={cn(iconSizes[size], config.color)} />
    </div>
  );
}
