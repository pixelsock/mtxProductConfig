import * as React from "react";
import * as Types from "./types";

declare function OtherProductLines(props: {
  as?: React.ElementType;
  classicVisibility?: Types.Visibility.VisibilityConditions;
  futureVisibility?: Types.Visibility.VisibilityConditions;
  decoVisibility?: Types.Visibility.VisibilityConditions;
  brightLineVisibility?: Types.Visibility.VisibilityConditions;
  antiLigatureVisibility?: Types.Visibility.VisibilityConditions;
  visibility?: React.ReactNode;
}): React.JSX.Element;
