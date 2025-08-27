import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { ProductLine } from '../../services/directus';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ProductLineSelectorProps {
  productLines: ProductLine[];
  selectedProductLine: ProductLine | null;
  onProductLineChange: (productLine: ProductLine) => void;
  isLoading?: boolean;
}

export function ProductLineSelector({
  productLines,
  selectedProductLine,
  onProductLineChange,
  isLoading = false
}: ProductLineSelectorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(selectedProductLine?.sku_code || "");

  // Update value when selectedProductLine changes externally
  useEffect(() => {
    setValue(selectedProductLine?.sku_code || "");
  }, [selectedProductLine]);

  // Debug logging for isLoading prop
  useEffect(() => {
    console.log(`ProductLineSelector isLoading prop changed to:`, isLoading);
  }, [isLoading]);

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Product Line:
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between bg-muted border-none hover:bg-muted/80"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : value ? (
              productLines.find((line) => line.sku_code === value)?.name +
              " (" + productLines.find((line) => line.sku_code === value)?.sku_code + ")"
            ) : (
              "Select product line..."
            )}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search product lines..." className="h-9" />
            <CommandList>
              <CommandEmpty>No product line found.</CommandEmpty>
              <CommandGroup>
                {productLines.map((line) => (
                  <CommandItem
                    key={line.id}
                    value={`${line.name} ${line.sku_code}`}
                    onSelect={async () => {
                      console.log(`Selected product line: ${line.name}`);
                      // Don't update value immediately if it will cause loading
                      // Let the parent component update selectedProductLine when ready
                      setOpen(false);
                      // Call the async handler
                      onProductLineChange(line);
                    }}
                  >
                    {line.name} ({line.sku_code})
                    <Check
                      className={cn(
                        "ml-auto",
                        value === line.sku_code ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
