import React from 'react';
import type { ProductConfiguration, OptionSet } from '../../services/types/ServiceTypes';

// Base interface for all option components
export interface BaseOptionProps {
  collection: string;
  label: string;
  value: string | string[] | undefined;
  options: any[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

// Extended props for specific option types
export interface ColorGridProps extends BaseOptionProps {
  variant?: 'grid' | 'list';
  showHex?: boolean;
  columns?: number;
  size?: 'small' | 'medium' | 'large';
}

export interface ButtonGroupProps extends BaseOptionProps {
  variant?: 'outline' | 'filled';
  orientation?: 'horizontal' | 'vertical';
  size?: 'small' | 'default' | 'large';
}

export interface RadioGroupProps extends BaseOptionProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'compact' | 'normal' | 'loose';
}

export interface SelectProps extends BaseOptionProps {
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
}

export interface CheckboxGroupProps extends BaseOptionProps {
  orientation?: 'horizontal' | 'vertical';
  multiple: true;
  max?: number;
}

export interface SliderProps extends BaseOptionProps {
  min: number;
  max: number;
  step: number;
  showValue?: boolean;
  showLabels?: boolean;
}

export interface InputProps extends BaseOptionProps {
  type: 'text' | 'number' | 'email' | 'tel';
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
}

export interface ImageSelectProps extends BaseOptionProps {
  imageKey: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  size?: 'small' | 'medium' | 'large';
}

// Registry type definition
export type OptionComponent = React.ComponentType<any>;

export interface OptionTypeDefinition {
  component: OptionComponent;
  defaultProps?: Partial<BaseOptionProps>;
  validation?: (props: any) => boolean;
}

export class OptionTypeRegistry {
  private static instance: OptionTypeRegistry;
  private registry = new Map<string, OptionTypeDefinition>();

  static getInstance(): OptionTypeRegistry {
    if (!OptionTypeRegistry.instance) {
      OptionTypeRegistry.instance = new OptionTypeRegistry();
    }
    return OptionTypeRegistry.instance;
  }

  // Register a new option type
  register(
    uiType: string, 
    component: OptionComponent, 
    defaultProps?: Partial<BaseOptionProps>,
    validation?: (props: any) => boolean
  ): void {
    this.registry.set(uiType, {
      component,
      defaultProps,
      validation
    });
  }

  // Get component for a UI type
  getComponent(uiType: string): OptionComponent | null {
    const definition = this.registry.get(uiType);
    return definition ? definition.component : null;
  }

  // Get complete definition for a UI type
  getDefinition(uiType: string): OptionTypeDefinition | null {
    return this.registry.get(uiType) || null;
  }

  // Get all registered UI types
  getRegisteredTypes(): string[] {
    return Array.from(this.registry.keys());
  }

  // Check if a UI type is registered
  isRegistered(uiType: string): boolean {
    return this.registry.has(uiType);
  }

  // Build props for a specific UI type with defaults
  buildProps(
    uiType: string,
    baseProps: BaseOptionProps,
    customProps: Record<string, any> = {}
  ): any {
    const definition = this.getDefinition(uiType);
    if (!definition) {
      return baseProps;
    }

    return {
      ...definition.defaultProps,
      ...baseProps,
      ...customProps
    };
  }

  // Validate props for a specific UI type
  validateProps(uiType: string, props: any): boolean {
    const definition = this.getDefinition(uiType);
    if (!definition || !definition.validation) {
      return true; // No validation defined, assume valid
    }

    return definition.validation(props);
  }

  // Render a component with validation
  renderComponent(
    uiType: string,
    props: BaseOptionProps,
    customProps: Record<string, any> = {}
  ): React.ReactElement | null {
    const Component = this.getComponent(uiType);
    if (!Component) {
      console.warn(`Option type "${uiType}" is not registered`);
      return null;
    }

    const finalProps = this.buildProps(uiType, props, customProps);
    
    // Validate props if validation is defined
    if (!this.validateProps(uiType, finalProps)) {
      console.warn(`Invalid props for option type "${uiType}"`);
      return null;
    }

    return React.createElement(Component, finalProps);
  }

  // Unregister an option type
  unregister(uiType: string): boolean {
    return this.registry.delete(uiType);
  }

  // Clear all registered types
  clear(): void {
    this.registry.clear();
  }

  // Get registry statistics
  getStats(): {
    totalTypes: number;
    typesList: string[];
    hasValidation: string[];
  } {
    const types = this.getRegisteredTypes();
    const hasValidation = types.filter(type => {
      const def = this.getDefinition(type);
      return def && def.validation;
    });

    return {
      totalTypes: types.length,
      typesList: types,
      hasValidation
    };
  }
}

// Export singleton instance
export const optionTypeRegistry = OptionTypeRegistry.getInstance();