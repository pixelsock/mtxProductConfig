"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./LookingForCustom.module.css";

export function LookingForCustom({ as: _Component = _Builtin.Block }) {
  return (
    <_Component
      className={_utils.cx(_styles, "section_layout38")}
      tag="section"
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "padding-global", "background-image")}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "container-large")}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "padding-section-large")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "max-width-medium")}
              tag="div"
            >
              <_Builtin.Block
                className={_utils.cx(_styles, "margin-bottom", "margin-small")}
                tag="div"
              >
                <_Builtin.Heading
                  className={_utils.cx(_styles, "text-color-white")}
                  tag="h2"
                >
                  {"Looking for something custom?"}
                </_Builtin.Heading>
              </_Builtin.Block>
              <_Builtin.Paragraph
                className={_utils.cx(
                  _styles,
                  "text-size-small",
                  "text-color-white"
                )}
              >
                {
                  "Looking for a more curated option? No problem. We offer full customization. Tell us more about you and your project and we can custom build the perfect solution. Whether you are a contractor looking for a specific cut, an interior designer looking for a large order, or simply require unique styles and features to fit your home, Matrix Mirrors is here to help."
                }
              </_Builtin.Paragraph>
              <_Builtin.Block
                className={_utils.cx(_styles, "margin-top", "margin-large")}
                tag="div"
              >
                <_Builtin.Link
                  className={_utils.cx(_styles, "button", "is-red")}
                  button={true}
                  fs-mirrorclick-element="trigger-777"
                  block=""
                  options={{
                    href: "#",
                  }}
                >
                  {"Customize Yours"}
                </_Builtin.Link>
              </_Builtin.Block>
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "layout38_background-image-wrapper")}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "image-overlay-layer")}
          tag="div"
        />
        <_Builtin.Image
          className={_utils.cx(_styles, "layout38_background-image")}
          loading="lazy"
          width="auto"
          height="auto"
          alt=""
          src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63b255df1e34a78adccd4e9d_MM_Custom-Mirror-Desktop-scaled_1512x.webp"
        />
      </_Builtin.Block>
    </_Component>
  );
}
