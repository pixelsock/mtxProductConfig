import React from 'react';
import { Input } from './input';
import { Button } from './button';

interface SkuSearchProps {
  onApply: (sku: string) => void;
  className?: string;
}

export const SkuSearch: React.FC<SkuSearchProps> = ({ onApply, className }) => {
  const [value, setValue] = React.useState('');
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Paste full SKU (e.g., W03D-2436-H-30K-DRV-L-MT-FC-AN)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => value && onApply(value)}>Apply SKU</Button>
      </div>
    </div>
  );
};

export default SkuSearch;

