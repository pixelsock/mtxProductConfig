import { EventEmittingService } from './BaseService';
import {
  getActiveProductLines,
  getProductLineWithOptions,
  getOptionsByCollectionForProductLine
} from '../directus';
import type {
  ProductLine,
  ServiceResult,
  OptionSet,
  ProductOption,
  DefaultOption,
  ProductLineChangeEvent
} from '../types/ServiceTypes';

export class ProductLineService extends EventEmittingService {
  private currentProductLine: ProductLine | null = null;
  private availableProductLines: ProductLine[] = [];
  private productLineOptions: Record<string, OptionSet> = {};

  constructor() {
    super();
    this.log('ProductLineService initialized');
  }

  // Product line management
  public async loadAvailableProductLines(): Promise<ServiceResult<ProductLine[]>> {
    return this.withCaching('available-product-lines', async () => {
      try {
        const productLines = await getActiveProductLines();
        this.availableProductLines = productLines;
        this.log(`Loaded ${productLines.length} product lines`);
        this.emit('product-lines-loaded', { productLines });
        return { success: true, data: productLines };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load product lines';
        this.error('Failed to load product lines', error);
        return { success: false, error: errorMessage };
      }
    });
  }

  public async switchProductLine(productLine: ProductLine): Promise<ServiceResult<{
    productLine: ProductLine;
    options: Record<string, OptionSet>;
  }>> {
    if (this.currentProductLine?.id === productLine.id) {
      this.log('Same product line selected, skipping switch');
      return { 
        success: true, 
        data: { 
          productLine: this.currentProductLine, 
          options: this.productLineOptions 
        } 
      };
    }

    this.log(`Switching to product line: ${productLine.name}`);
    
    try {
      // Load the product line with full details
      const detailedProductLine = await getProductLineWithOptions(productLine.sku_code);
      if (!detailedProductLine) {
        throw new Error(`Failed to load product line details for ${productLine.name}`);
      }

      // Load options for the product line
      const optionsResult = await this.loadProductLineOptions(detailedProductLine);
      if (!optionsResult.success || !optionsResult.data) {
        throw new Error(`Failed to load options for ${productLine.name}`);
      }

      const oldProductLine = this.currentProductLine;
      this.currentProductLine = detailedProductLine;
      this.productLineOptions = optionsResult.data;

      const changeEvent: ProductLineChangeEvent = {
        oldProductLine: oldProductLine || undefined,
        newProductLine: detailedProductLine
      };

      this.emit('product-line-changed', changeEvent);
      
      return { 
        success: true, 
        data: { 
          productLine: detailedProductLine, 
          options: this.productLineOptions 
        } 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to switch to ${productLine.name}`;
      this.error('Failed to switch product line', error);
      return { success: false, error: errorMessage };
    }
  }

  public async loadProductLineOptions(productLine: ProductLine): Promise<ServiceResult<Record<string, OptionSet>>> {
    const cacheKey = `product-line-options-${productLine.id}`;
    
    return this.withCaching(cacheKey, async () => {
      try {
        this.log(`Loading options for ${productLine.name}`);

        // Get options by collection from API
        const byCollection = await getOptionsByCollectionForProductLine(productLine);
        
        // Transform API response into OptionSet format
        const optionSets: Record<string, OptionSet> = {};

        // Process each collection
        Object.entries(byCollection).forEach(([collection, items]) => {
          if (Array.isArray(items) && items.length > 0) {
            const options: ProductOption[] = items.map(item => ({
              id: item.id,
              name: item.name,
              sku_code: item.sku_code || '',
              description: item.description,
              hex_code: item.hex_code,
              width: item.width,
              height: item.height,
              value: item.value,
              sort: item.sort,
              active: item.active !== false
            }));

            // Determine UI type and requirements from default_options
            const defaultOption = productLine.default_options?.find(
              (opt: DefaultOption) => opt.collection === collection
            );

            optionSets[collection] = {
              collection,
              options,
              ui_type: this.getDefaultUIType(collection),
              required: defaultOption?.required || false,
              multiple: collection === 'accessories'
            };
          }
        });

        // Special handling for sizes to include width/height
        if (optionSets.sizes) {
          optionSets.sizes.options = optionSets.sizes.options.map(option => ({
            ...option,
            width: option.width || (option.name.includes('x') ? 
              parseFloat(option.name.split('x')[0]) : undefined),
            height: option.height || (option.name.includes('x') ? 
              parseFloat(option.name.split('x')[1]) : undefined)
          }));
        }

        // Sort options within each set
        Object.values(optionSets).forEach(optionSet => {
          optionSet.options.sort((a, b) => {
            // Sort by sort field first, then by name
            if (a.sort !== undefined && b.sort !== undefined) {
              return a.sort - b.sort;
            }
            if (a.sort !== undefined) return -1;
            if (b.sort !== undefined) return 1;
            return a.name.localeCompare(b.name);
          });
        });

        this.log(`Loaded options for ${Object.keys(optionSets).length} collections`);
        this.emit('options-loaded', { productLine, optionSets });

        return { success: true, data: optionSets };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load product line options';
        this.error(`Failed to load options for ${productLine.name}`, error);
        return { success: false, error: errorMessage };
      }
    });
  }

  // Default product line selection
  public async selectDefaultProductLine(
    searchParams?: URLSearchParams,
    allProducts?: any[]
  ): Promise<ServiceResult<ProductLine>> {
    if (this.availableProductLines.length === 0) {
      const loadResult = await this.loadAvailableProductLines();
      if (!loadResult.success) {
        return { success: false, error: loadResult.error };
      }
    }

    let defaultProductLine: ProductLine | null = null;

    // 1. Try to find from search parameter
    if (searchParams) {
      const searchSku = searchParams.get('search');
      if (searchSku && allProducts) {
        defaultProductLine = this.findProductLineFromSearch(searchSku, allProducts);
      }

      // 2. Try from product line code parameter
      if (!defaultProductLine) {
        const urlPl = searchParams.get('pl');
        if (urlPl) {
          defaultProductLine = this.availableProductLines.find(
            pl => (pl.sku_code || '').toUpperCase() === urlPl.toUpperCase()
          ) || null;
        }
      }
    }

    // 3. Prefer "Deco" product line if available
    if (!defaultProductLine) {
      defaultProductLine = this.availableProductLines.find(
        pl => pl.name.toLowerCase().includes('deco')
      ) || null;
    }

    // 4. Fallback to first available
    if (!defaultProductLine) {
      defaultProductLine = this.availableProductLines[0] || null;
    }

    if (!defaultProductLine) {
      return { success: false, error: 'No product lines available' };
    }

    return { success: true, data: defaultProductLine };
  }

  private findProductLineFromSearch(searchSku: string, allProducts: any[]): ProductLine | null {
    const core = searchSku.split('-')[0] || searchSku;
    const product = allProducts.find(p => 
      ((p.sku_code || p.name || '') as string).toUpperCase().startsWith(core.toUpperCase())
    );
    
    if (product) {
      return this.availableProductLines.find(pl => pl.id === product.product_line) || null;
    }
    
    return null;
  }

  private getDefaultUIType(collection: string): string {
    // Default UI types based on collection patterns
    const uiTypeMap: Record<string, string> = {
      'frame_colors': 'color-grid',
      'mirror_styles': 'button-group',
      'mounting_options': 'radio-group',
      'light_directions': 'button-group',
      'color_temperatures': 'select',
      'light_outputs': 'select',
      'drivers': 'select',
      'frame_thicknesses': 'radio-group',
      'sizes': 'select',
      'accessories': 'checkbox-group'
    };

    return uiTypeMap[collection] || 'select';
  }

  // Getters
  public getCurrentProductLine(): ProductLine | null {
    return this.currentProductLine;
  }

  public getAvailableProductLines(): ProductLine[] {
    return [...this.availableProductLines];
  }

  public getCurrentOptions(): Record<string, OptionSet> {
    return { ...this.productLineOptions };
  }

  public getOptionSet(collection: string): OptionSet | null {
    return this.productLineOptions[collection] || null;
  }

  // Option utilities
  public getOptionById(collection: string, id: number): ProductOption | null {
    const optionSet = this.getOptionSet(collection);
    return optionSet?.options.find(opt => opt.id === id) || null;
  }

  public getOptionBySkuCode(collection: string, skuCode: string): ProductOption | null {
    const optionSet = this.getOptionSet(collection);
    return optionSet?.options.find(opt => opt.sku_code === skuCode) || null;
  }

  public getDefaultOptionForCollection(collection: string): ProductOption | null {
    const optionSet = this.getOptionSet(collection);
    if (!optionSet || optionSet.options.length === 0) {
      return null;
    }

    // Check if product line has a specific default for this collection
    const defaultOption = this.currentProductLine?.default_options?.find(
      opt => opt.collection === collection
    );

    if (defaultOption) {
      const option = optionSet.options.find(opt => opt.id === defaultOption.option_id);
      if (option) return option;
    }

    // Fallback to first option
    return optionSet.options[0];
  }

  // Cache management
  public clearProductLineCache(): void {
    this.clearCache('product-line-');
    this.clearCache('available-product-lines');
  }

  public async refreshCurrentProductLine(): Promise<ServiceResult<ProductLine>> {
    if (!this.currentProductLine) {
      return { success: false, error: 'No current product line to refresh' };
    }

    this.clearCache(`product-line-options-${this.currentProductLine.id}`);
    return this.switchProductLine(this.currentProductLine);
  }
}