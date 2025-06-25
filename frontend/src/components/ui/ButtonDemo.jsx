import React, { useState } from "react";
import { Button } from "./Button";

// Simple icon components for demo
const SaveIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17,21 17,13 7,13 7,21" />
    <polyline points="7,3 7,8 15,8" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const HeartIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

/**
 * Button Demo Component
 * Showcases all Button variants, sizes, and features
 */
const ButtonDemo = () => {
  const [loadingStates, setLoadingStates] = useState({});

  const handleLoadingDemo = (buttonId) => {
    setLoadingStates((prev) => ({ ...prev, [buttonId]: true }));
    setTimeout(() => {
      setLoadingStates((prev) => ({ ...prev, [buttonId]: false }));
    }, 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Professional Button Component
        </h1>
        <p className="text-[var(--text-secondary)]">
          Production-ready button system with your brand colors
        </p>
      </div>

      {/* Button Variants */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Button Variants
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="error">Error</Button>
          <Button variant="link">Link Button</Button>
        </div>
      </section>

      {/* Button Sizes */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Button Sizes
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" size="xs">
            Extra Small
          </Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="md">
            Medium
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
          <Button variant="primary" size="xl">
            Extra Large
          </Button>
          <Button variant="primary" size="icon">
            <HeartIcon />
          </Button>
        </div>
      </section>

      {/* Buttons with Icons */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Buttons with Icons
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" leftIcon={<SaveIcon />}>
            Save Document
          </Button>
          <Button variant="secondary" rightIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button
            variant="outline"
            leftIcon={<HeartIcon />}
            rightIcon={<DownloadIcon />}
          >
            Like & Download
          </Button>
        </div>
      </section>

      {/* Loading States */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Loading States
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="primary"
            isLoading={loadingStates.loading1}
            onClick={() => handleLoadingDemo("loading1")}
          >
            Click to Load
          </Button>
          <Button
            variant="success"
            isLoading={loadingStates.loading2}
            leftIcon={<SaveIcon />}
            onClick={() => handleLoadingDemo("loading2")}
          >
            Save & Process
          </Button>
          <Button variant="outline" isLoading={true}>
            Always Loading
          </Button>
        </div>
      </section>

      {/* Full Width & Disabled */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Full Width & Disabled States
        </h2>
        <div className="space-y-4 max-w-md">
          <Button variant="primary" fullWidth>
            Full Width Primary
          </Button>
          <Button variant="secondary" fullWidth disabled>
            Disabled Secondary
          </Button>
          <Button variant="outline" fullWidth leftIcon={<SaveIcon />}>
            Full Width with Icon
          </Button>
        </div>
      </section>

      {/* Interactive Demo */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Interactive Features
        </h2>
        <div className="p-6 bg-[var(--bg-secondary)] rounded-lg">
          <p className="text-[var(--text-secondary)] mb-4">
            Try hovering, clicking, and focusing these buttons to see smooth
            animations:
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="primary"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(8, 77, 242, 0.3)",
              }}
              leftIcon={<HeartIcon />}
            >
              Animated Hover
            </Button>
            <Button
              variant="success"
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Custom Animation
            </Button>
          </div>
        </div>
      </section>

      {/* Usage Code Example */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Usage Example
        </h2>
        <div className="bg-[var(--neutral-900)] text-[var(--neutral-100)] p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm font-mono">
            {`import { Button } from './components/ui/Button';
import { SaveIcon } from './icons';

// Basic usage
<Button variant="primary">Click Me</Button>

// With icon and loading
<Button 
  variant="success" 
  leftIcon={<SaveIcon />}
  isLoading={isLoading}
  onClick={handleSave}
>
  Save Document
</Button>

// Custom animation
<Button 
  variant="outline"
  whileHover={{ scale: 1.05 }}
  fullWidth
>
  Animated Button
</Button>`}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default ButtonDemo;
