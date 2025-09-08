import { EventEmittingService } from './BaseService';
import { getRules, processRules } from '../rules-engine';
import type {
  Rule,
  ServiceResult,
  RuleApplicationEvent,
  ProductConfiguration
} from '../types/ServiceTypes';

export interface RuleContext {
  product_line?: number;
  mirror_style?: number;
  mirror_style_sku_code?: string;
  light_direction?: number;
  light_direction_sku_code?: string;
  frame_thickness?: number;
  frame_thickness_sku_code?: string;
  mirror_control?: number;
  frame_color?: number;
  mounting?: number;
  driver?: number;
  light_output?: number;
  color_temperature?: number;
  accessories?: number[];
  [key: string]: any;
}

export interface RuleResult {
  originalContext: RuleContext;
  processedContext: RuleContext;
  appliedRules: Rule[];
  overrides: RuleOverrides;
  constraints: Record<string, any>;
}

export interface RuleOverrides {
  productSkuOverride?: string;
  productLineSkuOverride?: string;
  accessoriesOverride?: string;
  accessoryFallback?: string;
  mirrorStyleSkuOverride?: string;
  lightDirectionSkuOverride?: string;
  sizeSkuOverride?: string;
  lightOutputSkuOverride?: string;
  colorTemperatureSkuOverride?: string;
  driverSkuOverride?: string;
  mountingSkuOverride?: string;
  frameColorSkuOverride?: string;
  [key: string]: string | undefined;
}

export class RulesEngineService extends EventEmittingService {
  private rules: Rule[] = [];
  private isInitialized = false;

  constructor() {
    super();
    this.log('RulesEngineService initialized');
  }

  // Initialization
  public async initialize(): Promise<ServiceResult<Rule[]>> {
    if (this.isInitialized) {
      return { success: true, data: this.rules };
    }

    return this.withCaching('rules-cache', async () => {
      try {
        this.log('Loading rules from API');
        const rules = await getRules();
        this.rules = rules;
        this.isInitialized = true;
        
        this.log(`Loaded ${rules.length} rules`);
        this.emit('rules-loaded', { rules });
        
        return { success: true, data: rules };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load rules';
        this.error('Failed to initialize rules engine', error);
        return { success: false, error: errorMessage };
      }
    });
  }

  // Rule processing
  public async applyRules(context: RuleContext): Promise<ServiceResult<RuleResult>> {
    if (!this.isInitialized) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        return { success: false, error: initResult.error };
      }
    }

    try {
      this.log('Applying rules to context', context);

      // Process rules using existing rules engine
      const processedContext = await processRules(context);
      
      // Identify which rules were applied by comparing contexts
      const appliedRules = this.identifyAppliedRules(context, processedContext);
      
      // Extract overrides from processed context
      const overrides = this.extractOverrides(processedContext);
      
      // Build constraints for option availability
      const constraints = this.buildConstraints(appliedRules, processedContext);

      const result: RuleResult = {
        originalContext: context,
        processedContext,
        appliedRules,
        overrides,
        constraints
      };

      const ruleEvent: RuleApplicationEvent = {
        rules: appliedRules,
        context,
        results: result
      };

      this.emit('rules-applied', ruleEvent);
      
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply rules';
      this.error('Failed to apply rules', error);
      return { success: false, error: errorMessage };
    }
  }

  // Configuration-specific rule processing
  public async processConfiguration(config: ProductConfiguration): Promise<ServiceResult<RuleResult>> {
    const context = this.configurationToRuleContext(config);
    return this.applyRules(context);
  }

  public async computeRuleOverrides(config: ProductConfiguration): Promise<ServiceResult<RuleOverrides>> {
    const ruleResult = await this.processConfiguration(config);
    if (!ruleResult.success) {
      return { success: false, error: ruleResult.error };
    }
    
    return { success: true, data: ruleResult.data!.overrides };
  }

  // Context conversion
  private configurationToRuleContext(config: ProductConfiguration): RuleContext {
    const toNum = (v?: string) => (v ? parseInt(v, 10) : undefined);
    
    return {
      product_line: config.productLineId,
      mirror_style: toNum(config.mirrorStyle),
      light_direction: toNum(config.lighting),
      frame_thickness: toNum(config.frameThickness),
      mirror_control: toNum(config.mirrorControls),
      frame_color: toNum(config.frameColor),
      mounting: toNum(config.mounting),
      driver: toNum(config.driver),
      light_output: toNum(config.lightOutput),
      color_temperature: toNum(config.colorTemperature),
      accessories: Array.isArray(config.accessories) ? 
        config.accessories.map(a => parseInt(a, 10)).filter(n => Number.isFinite(n)) : []
    };
  }

  // Rule analysis
  private identifyAppliedRules(original: RuleContext, processed: RuleContext): Rule[] {
    const appliedRules: Rule[] = [];
    
    // Find rules that could have caused the changes
    for (const rule of this.rules) {
      if (!rule.active) continue;
      
      // Check if this rule's condition matches the original context
      if (this.evaluateRuleCondition(rule, original)) {
        // Check if the rule's effect is visible in the processed context
        if (this.isRuleEffectVisible(rule, original, processed)) {
          appliedRules.push(rule);
        }
      }
    }
    
    return appliedRules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  private evaluateRuleCondition(rule: Rule, context: RuleContext): boolean {
    const contextValue = context[rule.collection_field];
    const conditionValue = rule.condition_value;
    
    switch (rule.condition_type) {
      case 'equals':
        return contextValue === conditionValue;
      case 'not_equals':
        return contextValue !== conditionValue;
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(contextValue);
      case 'not_in':
        return Array.isArray(conditionValue) && !conditionValue.includes(contextValue);
      case 'greater_than':
        return typeof contextValue === 'number' && 
               typeof conditionValue === 'number' && 
               contextValue > conditionValue;
      case 'less_than':
        return typeof contextValue === 'number' && 
               typeof conditionValue === 'number' && 
               contextValue < conditionValue;
      default:
        return false;
    }
  }

  private isRuleEffectVisible(rule: Rule, original: RuleContext, processed: RuleContext): boolean {
    const targetField = rule.then_field || rule.then_collection;
    const originalValue = original[targetField];
    const processedValue = processed[targetField];
    
    // Check if the processed context shows changes that could be from this rule
    return originalValue !== processedValue || 
           processedValue === rule.then_value ||
           processed[`${targetField}_sku_code`] !== undefined;
  }

  private extractOverrides(processedContext: RuleContext): RuleOverrides {
    return {
      productSkuOverride: processedContext.sku_code,
      productLineSkuOverride: processedContext.product_line_sku_code,
      accessoriesOverride: processedContext.accessories_sku_code || processedContext.accessory_sku_code,
      accessoryFallback: processedContext.accessory_sku_code || processedContext.accessories_sku_code,
      mirrorStyleSkuOverride: processedContext.mirror_style_sku_code,
      lightDirectionSkuOverride: processedContext.light_direction_sku_code,
      sizeSkuOverride: processedContext.size_sku_code,
      lightOutputSkuOverride: processedContext.light_output_sku_code,
      colorTemperatureSkuOverride: processedContext.color_temperature_sku_code,
      driverSkuOverride: processedContext.driver_sku_code,
      mountingSkuOverride: processedContext.mounting_option_sku_code || processedContext.mounting_sku_code,
      frameColorSkuOverride: processedContext.frame_color_sku_code,
    };
  }

  private buildConstraints(appliedRules: Rule[], context: RuleContext): Record<string, any> {
    const constraints: Record<string, any> = {};
    
    for (const rule of appliedRules) {
      const field = rule.then_field || rule.then_collection;
      
      if (!constraints[field]) {
        constraints[field] = {
          allow: new Set<any>(),
          deny: new Set<any>()
        };
      }
      
      switch (rule.then_action) {
        case 'disable_option':
          constraints[field].deny.add(rule.then_value);
          break;
        case 'enable_option':
          constraints[field].allow.add(rule.then_value);
          break;
        case 'set_value':
          // Clear other constraints and only allow this value
          constraints[field] = {
            allow: new Set([rule.then_value]),
            deny: new Set()
          };
          break;
      }
    }
    
    return constraints;
  }

  // Rule management
  public async reloadRules(): Promise<ServiceResult<Rule[]>> {
    this.clearCache('rules-cache');
    this.isInitialized = false;
    return this.initialize();
  }

  public getRules(): Rule[] {
    return [...this.rules];
  }

  public getRulesByField(field: string): Rule[] {
    return this.rules.filter(rule => 
      rule.collection_field === field || 
      rule.then_field === field || 
      rule.then_collection === field
    );
  }

  public getRulesByCondition(field: string, value: any): Rule[] {
    return this.rules.filter(rule => 
      rule.collection_field === field && 
      this.evaluateRuleCondition(rule, { [field]: value })
    );
  }

  // Validation and testing
  public async validateRules(): Promise<ServiceResult<{ valid: number; invalid: Rule[] }>> {
    const invalid: Rule[] = [];
    let valid = 0;
    
    for (const rule of this.rules) {
      try {
        // Basic structure validation
        if (!rule.collection_field || !rule.condition_type || !rule.then_action) {
          invalid.push(rule);
          continue;
        }
        
        // Condition type validation
        const validConditionTypes = ['equals', 'not_equals', 'in', 'not_in', 'greater_than', 'less_than'];
        if (!validConditionTypes.includes(rule.condition_type)) {
          invalid.push(rule);
          continue;
        }
        
        // Action validation
        const validActions = ['set_value', 'add_option', 'remove_option', 'disable_option', 'enable_option'];
        if (!validActions.includes(rule.then_action)) {
          invalid.push(rule);
          continue;
        }
        
        valid++;
      } catch (error) {
        invalid.push(rule);
      }
    }
    
    return { 
      success: true, 
      data: { valid, invalid } 
    };
  }

  public async testRule(rule: Rule, testContext: RuleContext): Promise<ServiceResult<boolean>> {
    try {
      const matches = this.evaluateRuleCondition(rule, testContext);
      return { success: true, data: matches };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to test rule';
      return { success: false, error: errorMessage };
    }
  }
}