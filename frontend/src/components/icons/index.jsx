import React from 'react';

// Import SVG files as URLs and create React components
const createSvgComponent = (svgContent, displayName) => {
  const Component = (props) => (
    <span 
      {...props} 
      dangerouslySetInnerHTML={{ __html: svgContent }}
      style={{ display: 'inline-block', ...props.style }}
    />
  );
  Component.displayName = displayName;
  return Component;
};

// For now, let's create simple React icon components that can be easily replaced
export const PlusIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CloseIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const BoxIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16V8C21 7.45 20.55 7 20 7H4C3.45 7 3 7.45 3 8V16C3 16.55 3.45 17 4 17H20C20.55 17 21 16.55 21 16Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const CheckCircleIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 11.08V12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C13.18 2 14.32 2.23 15.39 2.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AlertIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.29 3.86L1.82 18C1.64 18.37 1.8 18.82 2.17 19C2.28 19.06 2.4 19.09 2.53 19.09H21.47C21.84 19.09 22.15 18.78 22.15 18.41C22.15 18.28 22.12 18.16 22.06 18.05L13.71 3.86C13.53 3.49 13.08 3.33 12.71 3.51C12.57 3.58 12.45 3.69 12.37 3.82L10.29 3.86Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 9V13M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const InfoIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const GridIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const CalenderIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const UserCircleIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const ListIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
    <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
    <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
    <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2"/>
    <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2"/>
    <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const TableIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3H15L21 9V21C21 21.55 20.55 22 20 22H4C3.45 22 3 21.55 3 21V4C3 3.45 3.45 3 4 3H9Z" stroke="currentColor" strokeWidth="2"/>
    <polyline points="9,9 9,3 15,9" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const PageIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.45 2 5 2.45 5 3V21C5 21.55 5.45 22 6 22H18C18.55 22 19 21.55 19 21V7L14 2Z" stroke="currentColor" strokeWidth="2"/>
    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const PieChartIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.21 15.89C20.5738 17.3945 19.5905 18.7202 18.3441 19.7513C17.0977 20.7824 15.6277 21.4874 14.0621 21.8048C12.4965 22.1221 10.8808 22.0421 9.35329 21.5718C7.82578 21.1014 6.43688 20.2551 5.3097 19.1097C4.18252 17.9643 3.35329 16.5649 2.90133 15.0334C2.44938 13.5018 2.39327 11.8861 2.73833 10.3235C3.08339 8.76081 3.8138 7.30334 4.86909 6.07416C5.92438 4.84498 7.26708 3.88103 8.78 3.27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2V12H22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const BoxCubeIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16V8C20.9996 7.64928 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64928 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="7.5,4.21 12,6.81 16.5,4.21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="7.5,19.79 7.5,14.6 3,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="21,12 16.5,14.6 16.5,19.79" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="12,22.08 12,17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PlugInIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="14" width="4" height="6" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="14" width="4" height="6" stroke="currentColor" strokeWidth="2"/>
    <rect x="6" y="4" width="12" height="7" stroke="currentColor" strokeWidth="2"/>
    <line x1="9" y1="4" x2="9" y2="2" stroke="currentColor" strokeWidth="2"/>
    <line x1="15" y1="4" x2="15" y2="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const ChevronDownIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

export const HorizontaLDots = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
    <circle cx="19" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
    <circle cx="5" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// Export other icons with placeholder implementations
export const ErrorIcon = AlertIcon;
export const BoltIcon = PlusIcon;
export const ArrowUpIcon = PlusIcon;
export const ArrowDownIcon = PlusIcon;
export const FolderIcon = PlusIcon;
export const VideoIcon = PlusIcon;
export const AudioIcon = PlusIcon;
export const FileIcon = PageIcon;
export const DownloadIcon = PlusIcon;
export const ArrowRightIcon = PlusIcon;
export const GroupIcon = PlusIcon;
export const BoxIconLine = BoxIcon;
export const ShootingStarIcon = PlusIcon;
export const DollarLineIcon = PlusIcon;
export const TrashBinIcon = PlusIcon;
export const AngleUpIcon = PlusIcon;
export const AngleDownIcon = PlusIcon;
export const AngleLeftIcon = PlusIcon;
export const AngleRightIcon = PlusIcon;
export const PencilIcon = PlusIcon;
export const CheckLineIcon = PlusIcon;
export const CloseLineIcon = CloseIcon;
export const ChevronUpIcon = ChevronDownIcon;
export const PaperPlaneIcon = PlusIcon;
export const LockIcon = PlusIcon;
export const EnvelopeIcon = PlusIcon;
export const UserIcon = UserCircleIcon;
export const EyeIcon = PlusIcon;
export const EyeCloseIcon = PlusIcon;
export const TimeIcon = PlusIcon;
export const CopyIcon = PlusIcon;
export const ChevronLeftIcon = PlusIcon;
export const TaskIcon = PlusIcon;
export const DocsIcon = PageIcon;
export const MailIcon = PlusIcon;
export const ChatIcon = PlusIcon;
export const MoreDotIcon = HorizontaLDots;
export const AlertHexaIcon = AlertIcon;
export const ErrorHexaIcon = InfoIcon;
