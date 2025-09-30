import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Search, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";
import { Input } from "./input";
import { Button } from "./button";
import { Badge } from "./badge";
import { Alert, AlertDescription } from "./alert";
import { Spinner } from "./spinner";

import { cn } from "@/lib/utils";
import {
  useSkuSearchState,
  useSkuSearchActions,
  useConfigurationState,
  useAvailableProductLines,
} from "@/store";
import type { SkuSegmentMatch, SkuSearchResult } from "@/store/types";
import { splitSkuInput } from "@/services/sku-parser";
import {
  createSkuAutocompleteContext,
  fetchBaseSkuSuggestions,
  getSegmentOrderItem,
  getSegmentSuggestionsForContext,
  type BaseSkuSuggestion,
  type SegmentSuggestion,
  type SkuAutocompleteContext,
} from "@/services/sku-autocomplete";

const SEGMENT_STATUS_STYLES: Record<
  SkuSegmentMatch["status"],
  { className: string; icon: ReactNode }
> = {
  exact: {
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    icon: <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />,
  },
  partial: {
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    icon: <AlertCircle className="mr-1 h-3 w-3" aria-hidden="true" />,
  },
  ambiguous: {
    className: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    icon: <AlertCircle className="mr-1 h-3 w-3" aria-hidden="true" />,
  },
  not_found: {
    className: "bg-destructive/10 text-destructive",
    icon: <AlertCircle className="mr-1 h-3 w-3" aria-hidden="true" />,
  },
  missing: {
    className: "bg-muted text-muted-foreground",
    icon: <AlertCircle className="mr-1 h-3 w-3" aria-hidden="true" />,
  },
  skipped: {
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    icon: <RefreshCw className="mr-1 h-3 w-3" aria-hidden="true" />,
  },
};

interface SuggestionItem {
  key: string;
  primary: string;
  secondary?: string | null;
  meta?: string | null;
  type: "base" | "segment";
  base?: BaseSkuSuggestion;
  segment?: SegmentSuggestion;
}

function formatTableName(name: string): string {
  if (!name) return "";
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getConfidenceBadgeStyles(
  confidence: SkuSearchResult["confidence"],
): string {
  switch (confidence) {
    case "exact":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "partial":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "ambiguous":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-300";
    case "invalid":
    default:
      return "bg-destructive/10 text-destructive";
  }
}

export function SkuSearchInput(): JSX.Element {
  const { skuSearchQuery, skuSearchResults, isSearchingSku, skuSearchError } =
    useSkuSearchState();
  const { searchBySku, applySkuResult, clearSkuSearch } = useSkuSearchActions();
  const { currentProductLine } = useConfigurationState();
  const availableProductLines = useAvailableProductLines();

  const [inputValue, setInputValue] = useState(skuSearchQuery);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [context, setContext] = useState<SkuAutocompleteContext | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [suggestionHeading, setSuggestionHeading] = useState<string | null>(
    null,
  );
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    setInputValue(skuSearchQuery);
  }, [skuSearchQuery]);

  const segments = useMemo(() => splitSkuInput(inputValue), [inputValue]);
  const activeSegmentIndex = useMemo(
    () => (segments.length === 0 ? 0 : segments.length - 1),
    [segments],
  );
  const activeSegmentValue = segments[activeSegmentIndex] ?? "";
  const baseSegment = segments[0]?.trim() ?? "";
  const segmentOrderIndex = activeSegmentIndex - 1; // Offset for base segment

  useEffect(() => {
    if (!context) return;
    if (baseSegment.toLowerCase() !== context.base.productSku.toLowerCase()) {
      setContext(null);
    }
  }, [baseSegment, context]);

  const productLineNameMap = useMemo(() => {
    const map = new Map<number, string>();
    availableProductLines.forEach((line) => {
      map.set(line.id, line.name);
    });
    return map;
  }, [availableProductLines]);

  const buildBaseSuggestionItems = useCallback(
    (items: BaseSkuSuggestion[]): SuggestionItem[] =>
      items.map((suggestion) => ({
        key: suggestion.id,
        type: "base" as const,
        base: suggestion,
        primary: suggestion.productSku,
        secondary: suggestion.productName,
        meta:
          suggestion.productLineId !== null &&
          suggestion.productLineId !== undefined
            ? (productLineNameMap.get(suggestion.productLineId) ??
              `Line ${suggestion.productLineId}`)
            : null,
      })),
    [productLineNameMap],
  );

  const buildSegmentSuggestionItems = useCallback(
    (items: SegmentSuggestion[]): SuggestionItem[] =>
      items.map((suggestion) => ({
        key: suggestion.id,
        type: "segment" as const,
        segment: suggestion,
        primary: suggestion.label,
        secondary: suggestion.description,
        meta: formatTableName(suggestion.tableName),
      })),
    [],
  );

  const loadSuggestions = useCallback(
    async (segmentIndex: number, query: string) => {
      if (!isInputFocused) {
        return;
      }

      setIsFetchingSuggestions(true);
      setSuggestionError(null);

      try {
        let nextSuggestions: SuggestionItem[] = [];
        let heading: string | null = null;

        if (segmentIndex <= 0) {
          const baseResults = await fetchBaseSkuSuggestions(query);
          nextSuggestions = buildBaseSuggestionItems(baseResults);
          heading = "Products";
        } else if (!context) {
          nextSuggestions = [];
          heading = null;
          setSuggestionError("Select a product base first.");
        } else {
          const orderItem = getSegmentOrderItem(context, segmentIndex - 1);
          if (!orderItem || !orderItem.sku_code_item) {
            nextSuggestions = [];
            heading = null;
          } else {
            const segmentResults = getSegmentSuggestionsForContext(
              context,
              segmentIndex - 1,
              query,
            );
            nextSuggestions = buildSegmentSuggestionItems(segmentResults);
            heading = `Segment: ${formatTableName(orderItem.sku_code_item)}`;

            if (segmentResults.length === 0) {
              setSuggestionError(
                `No available options for ${formatTableName(orderItem.sku_code_item)}.`,
              );
            }
          }
        }

        setSuggestionHeading(heading);
        setSuggestions(nextSuggestions);
        setHighlightedIndex(nextSuggestions.length > 0 ? 0 : -1);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load suggestions.";
        setSuggestionError(message);
        setSuggestions([]);
        setHighlightedIndex(-1);
      } finally {
        setIsFetchingSuggestions(false);
      }
    },
    [
      buildBaseSuggestionItems,
      buildSegmentSuggestionItems,
      context,
      isInputFocused,
    ],
  );

  useEffect(() => {
    if (!isInputFocused) {
      return;
    }

    const handler = window.setTimeout(() => {
      void loadSuggestions(activeSegmentIndex, activeSegmentValue.trim());
    }, 200);

    return () => {
      window.clearTimeout(handler);
    };
  }, [isInputFocused, loadSuggestions, activeSegmentIndex, activeSegmentValue]);

  const disableApplyForResult = useMemo(
    () => (result: SkuSearchResult) =>
      result.confidence === "invalid" || result.confidence === "ambiguous",
    [],
  );

  const handleSuggestionSelect = useCallback(
    async (item: SuggestionItem) => {
      if (item.type === "base" && item.base) {
        setIsFetchingSuggestions(true);
        try {
          const nextContext = await createSkuAutocompleteContext(item.base);
          setContext(nextContext);

          const hasMoreSegments = nextContext.segmentOrder.length > 0;
          const nextValue = hasMoreSegments
            ? `${item.base.productSku}-`
            : item.base.productSku;

          setInputValue(nextValue);
          setSuggestions([]);
          setSuggestionHeading(null);
          setHighlightedIndex(-1);
          setSuggestionError(null);
          setIsInputFocused(true);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load product options for this SKU.";
          setSuggestionError(message);
          setContext(null);
        } finally {
          setIsFetchingSuggestions(false);
        }
        return;
      }

      if (item.type === "segment" && item.segment && context) {
        const orderIndex = segmentOrderIndex;
        if (orderIndex < 0) return;

        const currentSegments = splitSkuInput(inputValue);
        while (currentSegments.length <= activeSegmentIndex) {
          currentSegments.push("");
        }

        currentSegments[activeSegmentIndex] = item.segment.skuCode;
        const truncated = currentSegments.slice(0, activeSegmentIndex + 1);
        let nextValue = truncated.join("-");

        const hasMoreSegments = context.segmentOrder.length > orderIndex + 1;
        if (hasMoreSegments) {
          nextValue = `${nextValue}-`;
        }

        setInputValue(nextValue);
        setSuggestions([]);
        setSuggestionHeading(null);
        setHighlightedIndex(-1);
        setSuggestionError(null);
        setIsInputFocused(hasMoreSegments);
      }
    },
    [activeSegmentIndex, context, inputValue, segmentOrderIndex],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement> | null) => {
      if (event) {
        event.preventDefault();
      }

      const query = inputValue.trim();
      if (!query) {
        clearSkuSearch();
        setContext(null);
        return;
      }

      setIsSubmitting(true);
      try {
        await searchBySku(query);
      } finally {
        setIsSubmitting(false);
        setIsInputFocused(false);
      }
    },
    [clearSkuSearch, inputValue, searchBySku],
  );

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        if (suggestions.length === 0) return;
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev + 1;
          return next >= suggestions.length ? 0 : next;
        });
        return;
      }

      if (event.key === "ArrowUp") {
        if (suggestions.length === 0) return;
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? suggestions.length - 1 : next;
        });
        return;
      }

      if (event.key === "Enter") {
        if (event.metaKey) {
          event.preventDefault();
          void handleSubmit(null);
          return;
        }

        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          event.preventDefault();
          void handleSuggestionSelect(suggestions[highlightedIndex]);
        }
      }

      if (event.key === "Escape") {
        setIsInputFocused(false);
        setSuggestions([]);
        setSuggestionHeading(null);
        setSuggestionError(null);
      }
    },
    [handleSubmit, handleSuggestionSelect, highlightedIndex, suggestions],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);
      setIsInputFocused(true);
      setSuggestionError(null);
    },
    [],
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    setIsInputFocused(false);
    setContext(null);
    clearSkuSearch();
  }, [clearSkuSearch]);

  const showSuggestions =
    isInputFocused &&
    (isFetchingSuggestions ||
      suggestionError !== null ||
      suggestions.length > 0);

  return (
    <Card className="relative z-30 border-primary/20 bg-muted/30 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Search className="h-4 w-4" aria-hidden="true" />
          Search by SKU
        </CardTitle>
        <CardDescription>
          Enter a full or partial SKU to load matching configurations from
          Supabase.
          {currentProductLine && (
            <span className="ml-1 text-xs text-muted-foreground">
              Active product line: {currentProductLine.name}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-1">
            <label
              htmlFor="sku-search-input"
              className="text-xs font-medium text-muted-foreground"
            >
              SKU Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="sku-search-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="T23i-2436-S-27-N-1-NA-BF"
                  autoComplete="off"
                />
                {showSuggestions && (
                  <div className="absolute left-0 right-0 top-full z-[200] mt-1 rounded-md border border-border bg-white shadow-lg">
                    {suggestionHeading && (
                      <div className="border-b border-border/60 px-3 py-2 text-xs font-medium uppercase text-muted-foreground">
                        {suggestionHeading}
                      </div>
                    )}
                    {isFetchingSuggestions ? (
                      <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                        <Spinner className="h-4 w-4" />
                        Loading suggestions…
                      </div>
                    ) : suggestionError ? (
                      <div className="px-3 py-3 text-sm text-destructive">
                        {suggestionError}
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-muted-foreground">
                        No suggestions available.
                      </div>
                    ) : (
                      <ul className="max-h-64 overflow-y-auto py-1">
                        {suggestions.map((suggestion, index) => (
                          <li key={suggestion.key}>
                            <button
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() =>
                                void handleSuggestionSelect(suggestion)
                              }
                              className={cn(
                                "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition",
                                index === highlightedIndex
                                  ? "bg-muted"
                                  : "hover:bg-muted",
                              )}
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground">
                                  {suggestion.primary}
                                </span>
                                {suggestion.secondary && (
                                  <span className="text-xs text-muted-foreground">
                                    {suggestion.secondary}
                                  </span>
                                )}
                              </div>
                              {suggestion.meta && (
                                <span className="text-xs text-muted-foreground">
                                  {suggestion.meta}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <Button
                type="submit"
                disabled={isSearchingSku || isSubmitting}
                className="min-w-[110px]"
              >
                {isSearchingSku || isSubmitting ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                Search
              </Button>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            disabled={isSearchingSku || (!skuSearchQuery && !inputValue)}
          >
            Clear
          </Button>
        </form>

        {skuSearchError && (
          <Alert variant="destructive" className="border-destructive/30">
            <AlertDescription>{skuSearchError}</AlertDescription>
          </Alert>
        )}

        {skuSearchResults.length === 0 && !skuSearchError && !isSearchingSku ? (
          <p className="text-sm text-muted-foreground">
            Start typing a SKU to see matching configurations. Select the
            product base to automatically step through each segment.
          </p>
        ) : (
          <div className="space-y-4">
            {skuSearchResults.map((result) => {
              const confidenceLabel =
                result.confidence.charAt(0).toUpperCase() +
                result.confidence.slice(1);
              const disableApply = disableApplyForResult(result);

              return (
                <div
                  key={result.id}
                  className="rounded-lg border border-border/60 bg-background/80 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {result.productSku ?? "SKU match"}
                        {result.productName && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {result.productName}
                          </span>
                        )}
                      </p>
                      {result.productLineId && (
                        <p className="text-xs text-muted-foreground">
                          Product line ID: {result.productLineId}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={cn(
                        "uppercase",
                        getConfidenceBadgeStyles(result.confidence),
                      )}
                    >
                      {confidenceLabel}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.segments.map((segment) => {
                      const statusStyle = SEGMENT_STATUS_STYLES[segment.status];
                      const value = segment.segment ?? "—";
                      const label = `${formatTableName(segment.tableName)}: ${value}`;

                      return (
                        <Badge
                          key={`${segment.tableName}-${segment.order}-${value}`}
                          className={cn(
                            "flex items-center",
                            statusStyle.className,
                          )}
                        >
                          {statusStyle.icon}
                          {label}
                        </Badge>
                      );
                    })}
                  </div>

                  {result.issues.length > 0 && (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                      {result.issues.map((issue, index) => (
                        <li key={`${result.id}-issue-${index}`}>{issue}</li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      variant={disableApply ? "outline" : "default"}
                      disabled={disableApply}
                      onClick={() => void applySkuResult(result)}
                    >
                      Apply Configuration
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
