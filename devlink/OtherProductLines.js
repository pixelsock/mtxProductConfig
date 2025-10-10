"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./OtherProductLines.module.css";

export function OtherProductLines({
  as: _Component = _Builtin.Block,
  classicVisibility = true,
  futureVisibility = true,
  decoVisibility = true,
  brightLineVisibility = true,
  antiLigatureVisibility = true,
  visibility = "Classic",
}) {
  return (
    <_Component
      className={_utils.cx(_styles, "padding-bottom", "padding-small")}
      tag="div"
      id="other-products"
    >
      <_Builtin.Block
        className={_utils.cx(
          _styles,
          "margin-medium",
          "padding-top",
          "padding-small"
        )}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "max-width-medium")}
          tag="div"
        >
          <_Builtin.Block tag="div">
            <_Builtin.Block
              className={_utils.cx(_styles, "margin-bottom", "margin-small")}
              tag="div"
            >
              <_Builtin.Heading
                className={_utils.cx(_styles, "heading-style-h6")}
                tag="h1"
              >
                {"Other Product Lines"}
              </_Builtin.Heading>
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.Block>
        <_Builtin.NotSupported _atom="DynamoWrapper" />
      </_Builtin.Block>
    </_Component>
  );
}
