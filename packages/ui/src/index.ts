// ──────────────────────────────────────────────────────────
// @ecommerce/ui — barrel exports
// ──────────────────────────────────────────────────────────

// Utilities
export { cn } from './lib/utils';

// Components
export { Button, buttonVariants } from './components/button';
export type { ButtonProps } from './components/button';

export { Input, inputVariants } from './components/input';
export type { InputProps } from './components/input';

export { Textarea } from './components/textarea';
export type { TextareaProps } from './components/textarea';

export { Label, labelVariants } from './components/label';
export type { LabelProps } from './components/label';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './components/select';

export { Checkbox } from './components/checkbox';

export { RadioGroup, RadioGroupItem } from './components/radio-group';

export { Switch } from './components/switch';

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/dialog';

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './components/sheet';

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from './components/popover';
