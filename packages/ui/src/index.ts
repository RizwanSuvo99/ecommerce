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

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/card';

export { Badge, badgeVariants } from './components/badge';
export type { BadgeProps } from './components/badge';

export { Avatar, AvatarImage, AvatarFallback } from './components/avatar';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './components/table';

export {
  Toaster,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  toast,
  useToast,
  toastVariants,
} from './components/toast';
export type { ToastData, ToastOptions, ToastProps } from './components/toast';

export { Alert, AlertTitle, AlertDescription, alertVariants } from './components/alert';
export type { AlertProps } from './components/alert';

export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/tabs';

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './components/accordion';

export { Separator } from './components/separator';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './components/dropdown-menu';

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from './components/command';

export { Skeleton } from './components/skeleton';

export { Spinner, spinnerVariants } from './components/spinner';
export type { SpinnerProps } from './components/spinner';

export { Progress } from './components/progress';

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './components/breadcrumb';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './components/pagination';

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
} from './components/navigation-menu';

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from './components/form';

export { Calendar } from './components/calendar';
export type { CalendarProps } from './components/calendar';

export { DatePicker } from './components/date-picker';
export type { DatePickerProps } from './components/date-picker';

export { ImageUpload } from './components/image-upload';
export type { ImageUploadProps } from './components/image-upload';

export { FileUpload, formatFileSize } from './components/file-upload';
export type { FileUploadProps, UploadedFile } from './components/file-upload';
