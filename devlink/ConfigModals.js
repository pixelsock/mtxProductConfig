"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _interactions from "./interactions";
import * as _utils from "./utils";
import _styles from "./ConfigModals.module.css";

const _interactionsData = JSON.parse(
  '{"events":{"e-1332":{"id":"e-1332","name":"","animationType":"preset","eventTypeId":"SCROLL_INTO_VIEW","action":{"id":"","actionTypeId":"SLIDE_EFFECT","instant":false,"config":{"actionListId":"slideInBottom","autoStopEventId":"e-1333"}},"mediaQueries":["main","medium","small","tiny"],"target":{"selector":".f-form-steps-item.is---2","originalId":"638dda96c024ae5a01eed12a|fb64b881-daa1-ecd2-9de9-309abc070751","appliesTo":"CLASS"},"targets":[{"selector":".f-form-steps-item.is---2","originalId":"638dda96c024ae5a01eed12a|fb64b881-daa1-ecd2-9de9-309abc070751","appliesTo":"CLASS"}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":0,"scrollOffsetUnit":"%","delay":0,"direction":"BOTTOM","effectIn":true},"createdOn":1670241017078}},"actionLists":{"slideInBottom":{"id":"slideInBottom","useFirstGroupAsInitialState":true,"actionItemGroups":[{"actionItems":[{"actionTypeId":"STYLE_OPACITY","config":{"delay":0,"duration":0,"target":{"id":"N/A","appliesTo":"TRIGGER_ELEMENT","useEventTarget":true},"value":0}}]},{"actionItems":[{"actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"duration":0,"target":{"id":"N/A","appliesTo":"TRIGGER_ELEMENT","useEventTarget":true},"xValue":0,"yValue":100,"xUnit":"PX","yUnit":"PX","zUnit":"PX"}}]},{"actionItems":[{"actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"outQuart","duration":1000,"target":{"id":"N/A","appliesTo":"TRIGGER_ELEMENT","useEventTarget":true},"xValue":0,"yValue":0,"xUnit":"PX","yUnit":"PX","zUnit":"PX"}},{"actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"outQuart","duration":1000,"target":{"id":"N/A","appliesTo":"TRIGGER_ELEMENT","useEventTarget":true},"value":1}}]}]}},"site":{"mediaQueries":[{"key":"main","min":992,"max":10000},{"key":"medium","min":768,"max":991},{"key":"small","min":480,"max":767},{"key":"tiny","min":0,"max":479}]}}'
);

export function ConfigModals({ as: _Component = _Builtin.Block }) {
  _interactions.useInteractions(_interactionsData, _styles);

  return (
    <_Component
      className={_utils.cx(_styles, "config-modals")}
      tag="div"
      fs-scrolldisable-element="preserve"
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "modal-popup")}
        tag="div"
        fs-modal-element="modal"
        fs-scrolldisable-element="preserve"
      >
        <_Builtin.FormWrapper className={_utils.cx(_styles, "form-block-2")}>
          <_Builtin.Image
            className={_utils.cx(_styles, "icon-1x1-small", "x-close")}
            loading="lazy"
            width="auto"
            height="auto"
            fs-modal-element="close"
            fs-scrolldisable-element="enable"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c5bcbad80ced3f00b77913_x-symbol.svg"
          />
          <_Builtin.FormForm
            className={_utils.cx(_styles, "form-2")}
            name="wf-form-Request-A-Quote"
            data-name="Request A Quote"
            method="get"
            id="wf-form-Request-A-Quote"
          >
            <_Builtin.Block
              id={_utils.cx(
                _styles,
                "w-node-bd27df3e-0c07-5a10-93ab-8b635db75e73-56229bd0"
              )}
              tag="div"
            >
              <_Builtin.FormTextInput
                className={_utils.cx(_styles, "auto-filled")}
                name="Configured-Product-Sku"
                maxLength={256}
                data-name="Configured Product Sku"
                disabled={false}
                type="text"
                required={true}
                autoFocus={false}
                id="form-sku"
              />
              <_Builtin.Block
                className={_utils.cx(
                  _styles,
                  "padding-tiny",
                  "background-color-gray"
                )}
                tag="div"
              >
                <_Builtin.FormBlockLabel
                  className={_utils.cx(_styles, "text-weight-bold")}
                  htmlFor="form-sku-2"
                >
                  {"Your Configured Product SKU"}
                  <_Builtin.Span id="frame-color">{""}</_Builtin.Span>
                </_Builtin.FormBlockLabel>
                <_Builtin.FormBlockLabel
                  htmlFor="form-sku-2"
                  id="form-sku-label"
                >
                  {"Configured Product SKU"}
                </_Builtin.FormBlockLabel>
              </_Builtin.Block>
            </_Builtin.Block>
            <_Builtin.Block
              id={_utils.cx(
                _styles,
                "w-node-bd27df3e-0c07-5a10-93ab-8b635db75e7d-56229bd0"
              )}
              tag="div"
            >
              <_Builtin.FormTextInput
                className={_utils.cx(_styles, "auto-filled")}
                name="Quantity"
                maxLength={256}
                data-name="Quantity"
                disabled={false}
                type="text"
                required={false}
                autoFocus={false}
                id="form-quantity"
              />
              <_Builtin.Block
                className={_utils.cx(
                  _styles,
                  "padding-tiny",
                  "background-color-gray"
                )}
                tag="div"
              >
                <_Builtin.FormBlockLabel
                  className={_utils.cx(_styles, "text-weight-bold")}
                  htmlFor="form-sku-2"
                >
                  {"Requested Quantity"}
                </_Builtin.FormBlockLabel>
                <_Builtin.FormBlockLabel
                  htmlFor="form-sku-2"
                  id="form-quantity-label"
                >
                  {"Configured Product SKU"}
                </_Builtin.FormBlockLabel>
              </_Builtin.Block>
            </_Builtin.Block>
            <_Builtin.Block
              id={_utils.cx(
                _styles,
                "w-node-bd27df3e-0c07-5a10-93ab-8b635db75e84-56229bd0"
              )}
              tag="div"
            >
              <_Builtin.FormBlockLabel htmlFor="Name-5">
                {"Your Name"}
              </_Builtin.FormBlockLabel>
              <_Builtin.FormTextInput
                name="Name-5"
                maxLength={256}
                data-name="Name 5"
                disabled={false}
                type="text"
                required={true}
                autoFocus={true}
                id="Name-5"
              />
            </_Builtin.Block>
            <_Builtin.Block
              id={_utils.cx(
                _styles,
                "w-node-bd27df3e-0c07-5a10-93ab-8b635db75e88-56229bd0"
              )}
              tag="div"
            >
              <_Builtin.FormBlockLabel htmlFor="Company-Name-4">
                {"Company Name"}
              </_Builtin.FormBlockLabel>
              <_Builtin.FormTextInput
                name="Company-Name-4"
                maxLength={256}
                data-name="Company Name 4"
                disabled={false}
                type="text"
                required={false}
                autoFocus={false}
                id="Company-Name-4"
              />
            </_Builtin.Block>
            <_Builtin.Block
              id={_utils.cx(
                _styles,
                "w-node-bd27df3e-0c07-5a10-93ab-8b635db75e8c-56229bd0"
              )}
              tag="div"
            >
              <_Builtin.FormBlockLabel htmlFor="Email-7">
                {"Email"}
              </_Builtin.FormBlockLabel>
              <_Builtin.FormTextInput
                name="Email-7"
                maxLength={256}
                data-name="Email 7"
                disabled={false}
                type="email"
                required={true}
                autoFocus={false}
                id="Email-7"
              />
            </_Builtin.Block>
            <_Builtin.Block
              id={_utils.cx(
                _styles,
                "w-node-bd27df3e-0c07-5a10-93ab-8b635db75e90-56229bd0"
              )}
              tag="div"
            >
              <_Builtin.FormBlockLabel htmlFor="Phone-Number-4">
                {"Phone Number"}
              </_Builtin.FormBlockLabel>
              <_Builtin.FormTextInput
                name="Phone-Number-4"
                maxLength={256}
                data-name="Phone Number 4"
                disabled={false}
                type="tel"
                required={true}
                autoFocus={false}
                id="Phone-Number-4"
              />
            </_Builtin.Block>
            <_Builtin.Block
              id={_utils.cx(
                _styles,
                "w-node-bd27df3e-0c07-5a10-93ab-8b635db75e94-56229bd0"
              )}
              tag="div"
            >
              <_Builtin.FormBlockLabel htmlFor="Project-Location-4">
                {"Project Location"}
              </_Builtin.FormBlockLabel>
              <_Builtin.FormTextInput
                name="Project-Location-4"
                maxLength={256}
                data-name="Project Location 4"
                placeholder="State, ZIP (ex: NC, 28021)"
                disabled={false}
                type="text"
                required={false}
                autoFocus={false}
                id="Project-Location-4"
              />
            </_Builtin.Block>
            <_Builtin.Block
              id={_utils.cx(
                _styles,
                "w-node-bd27df3e-0c07-5a10-93ab-8b635db75e98-56229bd0"
              )}
              tag="div"
            >
              <_Builtin.FormBlockLabel htmlFor="Project-Name-2">
                {"Project Name"}
              </_Builtin.FormBlockLabel>
              <_Builtin.FormTextInput
                name="Project-Name-2"
                maxLength={256}
                data-name="Project Name 2"
                disabled={false}
                type="text"
                required={false}
                autoFocus={false}
                id="Project-Name-2"
              />
            </_Builtin.Block>
            <_Builtin.Block
              id={_utils.cx(
                _styles,
                "w-node-bd27df3e-0c07-5a10-93ab-8b635db75e9c-56229bd0"
              )}
              tag="div"
            >
              <_Builtin.FormBlockLabel htmlFor="Desired-Delivery-Date-4">
                {"Desired Delivery Date"}
              </_Builtin.FormBlockLabel>
              <_Builtin.FormTextInput
                name="Desired-Delivery-Date-4"
                maxLength={256}
                data-name="Desired Delivery Date 4"
                disabled={false}
                type="text"
                required={true}
                autoFocus={false}
                id="Desired-Delivery-Date-4"
              />
            </_Builtin.Block>
            <_Builtin.Block
              id={_utils.cx(
                _styles,
                "w-node-bd27df3e-0c07-5a10-93ab-8b635db75ea0-56229bd0"
              )}
              tag="div"
            >
              <_Builtin.FormBlockLabel htmlFor="Specifier-2">
                {"Specifier"}
              </_Builtin.FormBlockLabel>
              <_Builtin.FormTextInput
                name="Specifier-2"
                maxLength={256}
                data-name="Specifier 2"
                disabled={false}
                type="text"
                required={true}
                autoFocus={false}
                id="Specifier-2"
              />
            </_Builtin.Block>
            <_Builtin.Block
              id={_utils.cx(
                _styles,
                "w-node-bd27df3e-0c07-5a10-93ab-8b635db75ea4-56229bd0"
              )}
              tag="div"
            >
              <_Builtin.FormBlockLabel htmlFor="Project-Notes-4">
                {"Project Notes"}
              </_Builtin.FormBlockLabel>
              <_Builtin.FormTextarea
                name="Project-Notes-4"
                maxLength={5000}
                data-name="Project Notes 4"
                placeholder="Let us know more about your project..."
                required={false}
                autoFocus={false}
                id="Project-Notes-4"
              />
            </_Builtin.Block>
            <_Builtin.Block
              id={_utils.cx(
                _styles,
                "w-node-bd27df3e-0c07-5a10-93ab-8b635db75ea8-56229bd0"
              )}
              tag="div"
            >
              <_Builtin.Block
                className={_utils.cx(_styles, "text-size-tiny")}
                id={_utils.cx(
                  _styles,
                  "w-node-bd27df3e-0c07-5a10-93ab-8b635db75ea9-56229bd0"
                )}
                tag="div"
              >
                {
                  "*A PDF Version of your Configuration will be downloaded upon successful submission. "
                }
              </_Builtin.Block>
              <_Builtin.FormButton
                className={_utils.cx(
                  _styles,
                  "button",
                  "max-width-full",
                  "w-node-bd27df3e-0c07-5a10-93ab-8b635db75eab-56229bd0"
                )}
                id={_utils.cx(_styles, "rfq-submit")}
                type="submit"
                value="Save & Submit"
                data-wait="Please wait..."
              />
            </_Builtin.Block>
          </_Builtin.FormForm>
          <_Builtin.FormSuccessMessage
            className={_utils.cx(_styles, "success-message-2")}
          >
            <_Builtin.Block tag="div">
              <_Builtin.Strong>
                {"Congratulations!"}
                <br />
                {"‍"}
              </_Builtin.Strong>
              <br />
              {
                "Your RFQ has been submitted and Matrix Mirrors team member will respond to your request shortly. "
              }
            </_Builtin.Block>
          </_Builtin.FormSuccessMessage>
          <_Builtin.FormErrorMessage>
            <_Builtin.Block tag="div">
              {"Oops! Something went wrong while submitting the form."}
            </_Builtin.Block>
          </_Builtin.FormErrorMessage>
        </_Builtin.FormWrapper>
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "price-quote-modal-popup")}
        tag="div"
        fs-modal-element="modal-101"
      >
        <_Builtin.FormWrapper
          className={_utils.cx(_styles, "form-block-2", "multi")}
          fs-scrolldisable-element="preserve"
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "icon-1x1-small", "x-close")}
            loading="lazy"
            width="auto"
            height="auto"
            fs-modal-element="close-101"
            fs-scrolldisable-element="enable"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c5bcbad80ced3f00b77913_x-symbol.svg"
          />
          <_Builtin.FormForm
            className={_utils.cx(_styles, "f-form", "is--form")}
            name="wf-form-Price-Quote"
            data-name="Price Quote"
            method="get"
            data-form="multistep"
            data-enter="true"
            id="wf-form-Price-Quote"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "f-form-steps-wrap", "is---2")}
              tag="div"
            >
              <_Builtin.Block
                className={_utils.cx(_styles, "f-form-steps-item", "is---2")}
                tag="div"
                data-form="step"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "f-steps-wrap", "is--2")}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cx(_styles, "f-w-progress-wrap")}
                    tag="div"
                  >
                    <_Builtin.Block
                      className={_utils.cx(_styles, "f-progress-item")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(
                          _styles,
                          "progress-number_block",
                          "f-progress-current-2"
                        )}
                        tag="div"
                      >
                        <_Builtin.Block tag="div">{"1"}</_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "f-progress-txt-2")}
                        tag="div"
                      >
                        {"Project"}
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Block
                      className={_utils.cx(_styles, "f-progress-item")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(_styles, "progress-number_block")}
                        tag="div"
                      >
                        <_Builtin.Block tag="div">{"2"}</_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "f-progress-txt-2")}
                        tag="div"
                      >
                        {"Specifier"}
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Block
                      className={_utils.cx(_styles, "f-progress-item")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(_styles, "progress-number_block")}
                        tag="div"
                      >
                        <_Builtin.Block tag="div">{"3"}</_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "f-progress-txt-2")}
                        tag="div"
                      >
                        {"Consent"}
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "f-txt-wrap", "is---2")}
                    tag="div"
                  >
                    <_Builtin.Block
                      className={_utils.cx(
                        _styles,
                        "f-copy-element",
                        "is--form-2"
                      )}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(
                          _styles,
                          "f-steps-txt",
                          "is--formly-2"
                        )}
                        tag="div"
                      >
                        {"Steps "}
                        <_Builtin.Span
                          className={_utils.cx(_styles, "f-current-step")}
                          data-text="current-step"
                        >
                          {"0"}
                        </_Builtin.Span>
                        {" / "}
                        <_Builtin.Span
                          className={_utils.cx(_styles, "f-total-steps")}
                          data-text="total-steps"
                        >
                          {"3"}
                        </_Builtin.Span>
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Block tag="div">{"Project Info"}</_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "f-2col-grid")}
                    tag="div"
                  >
                    <_Builtin.Block
                      id={_utils.cx(
                        _styles,
                        "w-node-d457c280-2ad9-9f0c-c33d-c77c2ce8323d-56229bd0"
                      )}
                      tag="div"
                    >
                      <_Builtin.FormBlockLabel htmlFor="Project-Name">
                        {"Project Name"}
                      </_Builtin.FormBlockLabel>
                      <_Builtin.FormTextInput
                        name="Project-Name"
                        maxLength={256}
                        data-name="Project Name"
                        disabled={false}
                        type="text"
                        required={true}
                        autoFocus={false}
                        id="Project-Name"
                      />
                    </_Builtin.Block>
                    <_Builtin.Block
                      id={_utils.cx(
                        _styles,
                        "w-node-a0491933-cc7f-4667-f883-7052756891ee-56229bd0"
                      )}
                      tag="div"
                    >
                      <_Builtin.FormBlockLabel htmlFor="Shipping-Address">
                        {"Shipping Address"}
                      </_Builtin.FormBlockLabel>
                      <_Builtin.FormTextarea
                        name="Shipping-Address"
                        maxLength={5000}
                        data-name="Shipping Address"
                        placeholder="Address, City, State, ZIP"
                        required={true}
                        autoFocus={false}
                        id="Shipping-Address"
                      />
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(
                      _styles,
                      "f-form-button-wrapper",
                      "is---2"
                    )}
                    tag="div"
                  >
                    <_Builtin.Link
                      className={_utils.cx(_styles, "f-form-button", "is---2")}
                      button={true}
                      data-form="next-btn"
                      block=""
                      options={{
                        href: "#",
                      }}
                    >
                      {"Next Step"}
                    </_Builtin.Link>
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Block
                className={_utils.cx(_styles, "f-form-steps-item", "is---2")}
                tag="div"
                data-form="step"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "f-steps-wrap", "is--2")}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cx(_styles, "f-w-progress-wrap")}
                    tag="div"
                  >
                    <_Builtin.Block
                      className={_utils.cx(_styles, "f-progress-item")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(_styles, "progress-number_block")}
                        tag="div"
                      >
                        <_Builtin.Block tag="div">{"1"}</_Builtin.Block>
                        <_Builtin.Block
                          className={_utils.cx(_styles, "f-check-img-wrap")}
                          tag="div"
                        >
                          <_Builtin.Image
                            className={_utils.cx(_styles, "f-check-icon")}
                            width="auto"
                            height="auto"
                            loading="lazy"
                            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/664244064037a8b6d1eee0ed_formlycheck.svg"
                          />
                        </_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "f-progress-txt-2")}
                        tag="div"
                      >
                        {"Project"}
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Block
                      className={_utils.cx(_styles, "f-progress-item")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(
                          _styles,
                          "progress-number_block",
                          "f-progress-current-2"
                        )}
                        tag="div"
                      >
                        <_Builtin.Block tag="div">{"2"}</_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "f-progress-txt-2")}
                        tag="div"
                      >
                        {"Specifier "}
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Block
                      className={_utils.cx(_styles, "f-progress-item")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(_styles, "progress-number_block")}
                        tag="div"
                      >
                        <_Builtin.Block tag="div">{"3"}</_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "f-progress-txt-2")}
                        tag="div"
                      >
                        {"Consent"}
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "f-txt-wrap", "is---2")}
                    tag="div"
                  >
                    <_Builtin.Block
                      className={_utils.cx(
                        _styles,
                        "f-copy-element",
                        "is--form-2"
                      )}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(
                          _styles,
                          "f-steps-txt",
                          "is--formly-2"
                        )}
                        tag="div"
                      >
                        {"Steps "}
                        <_Builtin.Span
                          className={_utils.cx(_styles, "f-current-step")}
                          data-text="current-step"
                        >
                          {"0"}
                        </_Builtin.Span>
                        {" / "}
                        <_Builtin.Span
                          className={_utils.cx(_styles, "f-total-steps")}
                          data-text="total-steps"
                        >
                          {"3"}
                        </_Builtin.Span>
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Block tag="div">
                      {"Specifier & Location"}
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "f-steps-input")}
                    tag="div"
                  >
                    <_Builtin.FormBlockLabel
                      className={_utils.cx(_styles, "f-txt-field-label")}
                      htmlFor="field"
                    >
                      {"Specifier & Location"}
                    </_Builtin.FormBlockLabel>
                    <_Builtin.Block
                      className={_utils.cx(
                        _styles,
                        "f-input-wrapper",
                        "is---2"
                      )}
                      tag="div"
                    >
                      <_Builtin.FormTextInput
                        name="Specifier-Location"
                        maxLength={256}
                        data-name="Specifier Location"
                        placeholder="EX: ABC, San Diego"
                        disabled={false}
                        type="text"
                        required={true}
                        autoFocus={false}
                        id="Specifier-Location"
                      />
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(
                      _styles,
                      "f-form-button-wrapper",
                      "is---2"
                    )}
                    tag="div"
                  >
                    <_Builtin.Link
                      className={_utils.cx(
                        _styles,
                        "f-form-back-button",
                        "is---2"
                      )}
                      button={true}
                      data-form="back-btn"
                      block=""
                      options={{
                        href: "#",
                      }}
                    >
                      {"Back"}
                    </_Builtin.Link>
                    <_Builtin.Link
                      className={_utils.cx(_styles, "f-form-button", "is---2")}
                      button={true}
                      data-form="next-btn"
                      id="last-step-button"
                      block=""
                      options={{
                        href: "#",
                      }}
                    >
                      {"Next Step"}
                    </_Builtin.Link>
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Block
                className={_utils.cx(_styles, "f-form-steps-item", "is---2")}
                tag="div"
                data-form="step"
                data-checkbox="1"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "f-steps-wrap", "is--2")}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cx(_styles, "f-w-progress-wrap")}
                    tag="div"
                  >
                    <_Builtin.Block
                      className={_utils.cx(_styles, "f-progress-item")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(_styles, "progress-number_block")}
                        tag="div"
                      >
                        <_Builtin.Block tag="div">{"1"}</_Builtin.Block>
                        <_Builtin.Block
                          className={_utils.cx(_styles, "f-check-img-wrap")}
                          tag="div"
                        >
                          <_Builtin.Image
                            className={_utils.cx(_styles, "f-check-icon")}
                            width="auto"
                            height="auto"
                            loading="lazy"
                            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/664244064037a8b6d1eee0ed_formlycheck.svg"
                          />
                        </_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "f-progress-txt-2")}
                        tag="div"
                      >
                        {"Project"}
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Block
                      className={_utils.cx(_styles, "f-progress-item")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(_styles, "progress-number_block")}
                        tag="div"
                      >
                        <_Builtin.Block tag="div">{"2"}</_Builtin.Block>
                        <_Builtin.Block
                          className={_utils.cx(_styles, "f-check-img-wrap")}
                          tag="div"
                        >
                          <_Builtin.Image
                            className={_utils.cx(_styles, "f-check-icon")}
                            width="auto"
                            height="auto"
                            loading="lazy"
                            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/664244064037a8b6d1eee0ed_formlycheck.svg"
                          />
                        </_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "f-progress-txt-2")}
                        tag="div"
                      >
                        {"Specifier"}
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Block
                      className={_utils.cx(_styles, "f-progress-item")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(
                          _styles,
                          "progress-number_block",
                          "f-progress-current-2"
                        )}
                        tag="div"
                      >
                        <_Builtin.Block tag="div">{"3"}</_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "f-progress-txt-2")}
                        tag="div"
                      >
                        {"Consent"}
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "f-txt-wrap", "is---2")}
                    tag="div"
                  >
                    <_Builtin.Block
                      className={_utils.cx(
                        _styles,
                        "f-copy-element",
                        "is--form-2"
                      )}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(
                          _styles,
                          "f-steps-txt",
                          "is--formly-2"
                        )}
                        tag="div"
                      >
                        {"Steps "}
                        <_Builtin.Span
                          className={_utils.cx(_styles, "f-current-step")}
                          data-text="current-step"
                        >
                          {"0"}
                        </_Builtin.Span>
                        {" / "}
                        <_Builtin.Span
                          className={_utils.cx(_styles, "f-total-steps")}
                          data-text="total-steps"
                        >
                          {"3"}
                        </_Builtin.Span>
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Block tag="div">
                      {"Agree & Continue"}
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "hidden-fields")}
                    id={_utils.cx(
                      _styles,
                      "w-node-d457c280-2ad9-9f0c-c33d-c77c2ce83229-56229bd0"
                    )}
                    tag="div"
                  >
                    <_Builtin.FormBlockLabel htmlFor="First-Name">
                      {"First Name"}
                    </_Builtin.FormBlockLabel>
                    <_Builtin.FormTextInput
                      name="First-Name"
                      maxLength={256}
                      data-name="First Name"
                      disabled={false}
                      type="text"
                      required={true}
                      autoFocus={true}
                      data-ms-member="first-name"
                      id="First-Name"
                    />
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "hidden-fields")}
                    id={_utils.cx(
                      _styles,
                      "w-node-d457c280-2ad9-9f0c-c33d-c77c2ce8322d-56229bd0"
                    )}
                    tag="div"
                  >
                    <_Builtin.FormBlockLabel htmlFor="Last-Name">
                      {"Last Name"}
                    </_Builtin.FormBlockLabel>
                    <_Builtin.FormTextInput
                      name="Last-Name"
                      maxLength={256}
                      data-name="Last Name"
                      disabled={false}
                      type="text"
                      required={true}
                      autoFocus={false}
                      data-ms-member="last-name"
                      id="Last-Name"
                    />
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "hidden-fields")}
                    id={_utils.cx(
                      _styles,
                      "w-node-fbfef3ff-dcef-a4a8-f789-3a2279d9e7b8-56229bd0"
                    )}
                    tag="div"
                  >
                    <_Builtin.FormBlockLabel htmlFor="customer-number-field">
                      {"Customer #"}
                    </_Builtin.FormBlockLabel>
                    <_Builtin.FormTextInput
                      name="Customer-Number"
                      maxLength={256}
                      data-name="Customer Number"
                      disabled={false}
                      type="text"
                      required={true}
                      autoFocus={false}
                      data-ms-member="id"
                      id="customer-number-field"
                    />
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "hidden-fields")}
                    id={_utils.cx(
                      _styles,
                      "w-node-_24400490-ee75-0340-c1d2-9f5b7b18a797-56229bd0"
                    )}
                    tag="div"
                  >
                    <_Builtin.FormBlockLabel htmlFor="quote-number-field">
                      {"Quote #"}
                    </_Builtin.FormBlockLabel>
                    <_Builtin.FormTextInput
                      name="quote-number"
                      maxLength={256}
                      data-name="quote-number"
                      disabled={false}
                      type="text"
                      required={true}
                      autoFocus={false}
                      id="quote-number-field"
                    />
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "hidden-fields")}
                    id={_utils.cx(
                      _styles,
                      "w-node-aaa8809d-e108-e802-a9a6-7216af62b118-56229bd0"
                    )}
                    tag="div"
                  >
                    <_Builtin.FormBlockLabel htmlFor="total-field">
                      {"Total Price"}
                    </_Builtin.FormBlockLabel>
                    <_Builtin.FormTextInput
                      name="quote-total"
                      maxLength={256}
                      data-name="quote-total"
                      disabled={false}
                      type="text"
                      required={true}
                      autoFocus={false}
                      id="total-field"
                    />
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "hidden-fields")}
                    id={_utils.cx(
                      _styles,
                      "w-node-_51265af9-45db-7a24-48a1-3e0d23c99296-56229bd0"
                    )}
                    tag="div"
                  >
                    <_Builtin.FormBlockLabel htmlFor="quantity-field">
                      {"Quantity"}
                    </_Builtin.FormBlockLabel>
                    <_Builtin.FormTextInput
                      name="quantity"
                      maxLength={256}
                      data-name="quantity"
                      disabled={false}
                      type="text"
                      required={true}
                      autoFocus={false}
                      id="quantity-field"
                    />
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "hidden-fields")}
                    id={_utils.cx(
                      _styles,
                      "w-node-_5eb28125-c71d-fdd4-8616-caec4e55c1c9-56229bd0"
                    )}
                    tag="div"
                  >
                    <_Builtin.FormBlockLabel htmlFor="company-field">
                      {"Company"}
                    </_Builtin.FormBlockLabel>
                    <_Builtin.FormTextInput
                      name="Company"
                      maxLength={256}
                      data-name="Company"
                      disabled={false}
                      type="text"
                      required={true}
                      autoFocus={false}
                      data-ms-member="company"
                      id="company-field"
                    />
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "hidden-fields")}
                    id={_utils.cx(
                      _styles,
                      "w-node-d457c280-2ad9-9f0c-c33d-c77c2ce83231-56229bd0"
                    )}
                    tag="div"
                  >
                    <_Builtin.FormBlockLabel htmlFor="Email-6">
                      {"Email"}
                    </_Builtin.FormBlockLabel>
                    <_Builtin.FormTextInput
                      name="Email"
                      maxLength={256}
                      data-name="Email"
                      disabled={false}
                      type="email"
                      required={true}
                      autoFocus={false}
                      data-ms-member="email"
                      id="Email-6"
                    />
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(
                      _styles,
                      "f-steps-input",
                      "hidden-fields"
                    )}
                    id={_utils.cx(
                      _styles,
                      "w-node-ca181bd2-3c67-b952-3963-cd3b94d2a770-56229bd0"
                    )}
                    tag="div"
                  >
                    <_Builtin.FormBlockLabel htmlFor="quote-data">
                      {"Quote Dropbox Link"}
                    </_Builtin.FormBlockLabel>
                    <_Builtin.FormTextarea
                      name="Quote-Data"
                      maxLength={5000}
                      data-name="Quote Data"
                      required={false}
                      autoFocus={false}
                      id="quote-data"
                    />
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "f-steps-input")}
                    tag="div"
                  >
                    <_Builtin.FormBlockLabel
                      className={_utils.cx(_styles, "f-txt-field-label")}
                      htmlFor="name-5"
                    >
                      {
                        "Once you submit your request, we will generate a price quote. It will download to your local machine and save your account under Saved Quotes. This quote will remain valid for 90 days. Please note that freight charges are not included in the pricing. By submitting your quote request, you consent to our terms of service and verify that we may contact you regarding your quote."
                      }
                    </_Builtin.FormBlockLabel>
                    <_Builtin.Block
                      className={_utils.cx(
                        _styles,
                        "f-checkbox-buttn-wrap",
                        "is---1"
                      )}
                      tag="div"
                    >
                      <_Builtin.FormCheckboxWrapper
                        className={_utils.cx(
                          _styles,
                          "f-checkbox-butn-field-copy"
                        )}
                      >
                        <_Builtin.FormCheckboxInput
                          className={_utils.cx(_styles, "f-checkbox-butn-copy")}
                          type="checkbox"
                          name="Consent"
                          data-name="Consent"
                          required={true}
                          checked={false}
                          id="Consent"
                          form={{
                            type: "checkbox-input",
                            name: "Consent",
                          }}
                          inputType="custom"
                          customClassName="w-checkbox-input--inputType-custom"
                        />
                        <_Builtin.FormInlineLabel>
                          {"I agree"}
                        </_Builtin.FormInlineLabel>
                      </_Builtin.FormCheckboxWrapper>
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(
                      _styles,
                      "f-form-button-wrapper",
                      "is---2"
                    )}
                    tag="div"
                  >
                    <_Builtin.Link
                      className={_utils.cx(
                        _styles,
                        "f-form-back-button",
                        "is---2"
                      )}
                      button={true}
                      data-form="back-btn"
                      block=""
                      options={{
                        href: "#",
                      }}
                    >
                      {"Back"}
                    </_Builtin.Link>
                    <_Builtin.Block
                      className={_utils.cx(
                        _styles,
                        "f-form-back-button",
                        "is---2",
                        "hide"
                      )}
                      tag="div"
                      id="loading-button"
                    >
                      <_Builtin.NotSupported _atom="Animation" />
                    </_Builtin.Block>
                    <_Builtin.FormButton
                      className={_utils.cx(_styles, "f-form-button", "is---2")}
                      type="submit"
                      value="Submit"
                      data-wait="Please wait..."
                      data-form="submit-btn"
                      id="generate-quote"
                    />
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Block>
            </_Builtin.Block>
          </_Builtin.FormForm>
          <_Builtin.FormSuccessMessage
            className={_utils.cx(_styles, "success-message", "is-profile")}
          >
            <_Builtin.Block tag="div">
              <_Builtin.Strong>
                {"Congratulations!"}
                <br />
                {"‍"}
              </_Builtin.Strong>
              <br />
              {
                "Your quote has been submitted and a Matrix Mirrors team member will respond shortly."
              }
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cx(
                _styles,
                "button-group",
                "is-center",
                "margin-top",
                "margin-medium"
              )}
              tag="div"
            >
              <_Builtin.Link
                className={_utils.cx(_styles, "button", "is-tiny", "is-green")}
                button={true}
                block=""
                options={{
                  href: "#",
                }}
              >
                {"Start A New Quote"}
              </_Builtin.Link>
              <_Builtin.Link
                className={_utils.cx(
                  _styles,
                  "button",
                  "is-secondary",
                  "is-tiny"
                )}
                button={true}
                block=""
                options={{
                  href: "#",
                }}
              >
                {"Saved Quotes"}
              </_Builtin.Link>
            </_Builtin.Block>
          </_Builtin.FormSuccessMessage>
          <_Builtin.FormErrorMessage>
            <_Builtin.Block tag="div">
              {"Oops! Something went wrong while submitting the form."}
            </_Builtin.Block>
          </_Builtin.FormErrorMessage>
        </_Builtin.FormWrapper>
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "light-direction-popup")}
        tag="div"
        fs-modal-element="modal-2"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "pop-up-content-wrapper")}
          tag="div"
          fs-scrolldisable-element="preserve"
        >
          <_Builtin.Image
            className={_utils.cx(
              _styles,
              "icon-1x1-small",
              "x-close",
              "invert"
            )}
            loading="lazy"
            width="auto"
            height="auto"
            fs-modal-element="close-2"
            fs-scrolldisable-element="enable"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c5bcbad80ced3f00b77913_x-symbol.svg"
          />
          <_Builtin.Heading
            className={_utils.cx(
              _styles,
              "heading-style-h4",
              "margin-bottom-24px"
            )}
            tag="h5"
          >
            {"Lighting Direction"}
          </_Builtin.Heading>
          <_Builtin.Paragraph
            className={_utils.cx(_styles, "margin-bottom-24px")}
          >
            {
              "Direct lighting is when the LED lights are located on the mirror itself, providing bright and even illumination on the mirror surface. This type of lighting is ideal for grooming and makeup application."
            }
            <br />
            <br />
            {
              "Indirect lighting is when the LED lights are located around the mirror, providing a soft ambient light that is directed towards the ceiling. This type of lighting is ideal for creating a warm and inviting atmosphere in the bathroom or vanity space."
            }
          </_Builtin.Paragraph>
          <_Builtin.Image
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c7ff5b91e702c7c7f91e8f_lightDirection.png"
          />
          <_Builtin.Image
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c7ffa58e1d2c71b2c01d6f_lightdirection2.png"
          />
        </_Builtin.Block>
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "temp-popup")}
        tag="div"
        fs-modal-element="modal-3"
        fs-scrolldisable-element="preserve"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "pop-up-content-wrapper")}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(
              _styles,
              "icon-1x1-small",
              "x-close",
              "invert"
            )}
            loading="lazy"
            width="auto"
            height="auto"
            fs-modal-element="close-3"
            fs-scrolldisable-element="enable"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c5bcbad80ced3f00b77913_x-symbol.svg"
          />
          <_Builtin.Heading
            className={_utils.cx(
              _styles,
              "heading-style-h4",
              "margin-bottom-24px"
            )}
            tag="h5"
          >
            {"Color Tempurature"}
          </_Builtin.Heading>
          <_Builtin.Paragraph
            className={_utils.cx(_styles, "margin-bottom-24px")}
          >
            {
              "Matrix Mirrors offers a wide range of color temperature options for their LED lighted mirrors, from a warm 2700K to a cool 6000K. This allows customers to choose the perfect lighting temperature to suit their preferences and needs, whether it be a warm and cozy ambiance or a bright and vibrant one. The color temperature options make it easy to create the perfect lighting environment for any bathroom or vanity space."
            }
          </_Builtin.Paragraph>
          <_Builtin.Image
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c82ad61fcf676973ad6dd5_colorTemp.png"
          />
        </_Builtin.Block>
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "accessories-popup")}
        tag="div"
        fs-modal-element="modal-4"
        fs-scrolldisable-element="preserve"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "pop-up-content-wrapper")}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(
              _styles,
              "icon-1x1-small",
              "x-close",
              "invert"
            )}
            loading="lazy"
            width="auto"
            height="auto"
            fs-modal-element="close-4"
            fs-scrolldisable-element="enable"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c5bcbad80ced3f00b77913_x-symbol.svg"
          />
          <_Builtin.Heading
            className={_utils.cx(
              _styles,
              "heading-style-h4",
              "margin-bottom-24px"
            )}
            tag="h3"
          >
            {"The Matrix Touch System"}
          </_Builtin.Heading>
          <_Builtin.Paragraph
            className={_utils.cx(_styles, "margin-bottom-24px")}
          >
            {
              "The Matrix Touch System is a feature available on some of Matrix Mirrors' LED lighted mirrors. It allows for easy control of the mirror's lighting settings through a touch-sensitive interface. The system includes three main functions: On/Off, dimming, and color temperature tuning."
            }
          </_Builtin.Paragraph>
          <_Builtin.Image
            loading="lazy"
            height="auto"
            width="auto"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c9a23861637ec6b93ddd9d_touchSensors.jpg"
          />
        </_Builtin.Block>
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "lighting-popup")}
        tag="div"
        fs-modal-element="modal-5"
        fs-scrolldisable-element="preserve"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "pop-up-content-wrapper")}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(
              _styles,
              "icon-1x1-small",
              "x-close",
              "invert"
            )}
            loading="lazy"
            width="auto"
            height="auto"
            fs-modal-element="close-5"
            fs-scrolldisable-element="enable"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c5bcbad80ced3f00b77913_x-symbol.svg"
          />
          <_Builtin.Heading
            className={_utils.cx(
              _styles,
              "heading-style-h4",
              "margin-bottom-24px"
            )}
            tag="h5"
          >
            {"Lighting output"}
          </_Builtin.Heading>
          <_Builtin.Paragraph
            className={_utils.cx(_styles, "margin-bottom-24px")}
          >
            {
              "The standard lighting output includes a Color Rendering Index (CRI) of 90+ which refers to the ability of a light source to accurately render colors of the objects in comparison to natural daylight. This high CRI ensures that the colors of objects appear true and vibrant."
            }
            <br />
            <br />
            {
              "The standard lighting output also includes a luminous efficacy of 125 lumen/watt, which measures the amount of light produced by the LED lights in relation to the power consumed. This high efficacy means that the LED lights used in Matrix Mirrors' mirrors are efficient and produce a lot of light for the power consumed."
            }
            <br />
            {
              "Additionally, the standard lighting output has a R9 value of 64, which measures the ability of a light source to render red colors, a value of 64 indicates that red colors are rendered well and accurately."
            }
            <br />
            <br />
            {
              "Matrix Mirrors also offers lighting output with a CRI of 90+ upon special request, which can be requested for specific projects that require high color rendering."
            }
          </_Builtin.Paragraph>
          <_Builtin.Image
            className={_utils.cx(_styles, "padding-right", "padding-medium")}
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c9a5a77090641e421a4fa7_lightingOutput.jpg"
          />
        </_Builtin.Block>
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "dimming-popup")}
        tag="div"
        fs-modal-element="modal-6"
        fs-scrolldisable-element="preserve"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "pop-up-content-wrapper")}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(
              _styles,
              "icon-1x1-small",
              "x-close",
              "invert"
            )}
            loading="lazy"
            width="auto"
            height="auto"
            fs-modal-element="close-6"
            fs-scrolldisable-element="enable"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c5bcbad80ced3f00b77913_x-symbol.svg"
          />
          <_Builtin.Heading
            className={_utils.cx(
              _styles,
              "heading-style-h4",
              "margin-bottom-24px"
            )}
            tag="h5"
          >
            {"Dimming Options"}
          </_Builtin.Heading>
          <_Builtin.Paragraph>
            {
              "Matrix Mirrors offers different dimming options for their LED lighted mirrors, including E, V and N."
            }
            <br />
            <br />
            {
              "E: E stands for Electronic Low Voltage (ELV) dimmable, which means that the mirror can be dimmed using an electronic low voltage dimmer switch. This type of dimming provides smooth and precise control over the brightness of the lights, making it easy to create the perfect lighting environment for any bathroom or vanity space."
            }
            <br />
            <br />
            {
              "V: V stands for 0-10 Dimmable, which means that the mirror can be dimmed using a 0-10V dimmer switch. This type of dimming provides a precise control over the brightness of the lights, allowing you to adjust the lights to your desired level."
            }
            <br />
            <br />
            {
              "N: N stands for Non-Dimming, which means that the mirror does not have the ability to be dimmed. This type of mirror is suitable for those who prefer a fixed lighting level."
            }
            <br />
            <br />
            <_Builtin.Emphasized>
              {
                "* It's important to note that the type of dimmer switch used must be compatible with the type of dimming option the mirror has, in order to ensure proper functionality."
              }
            </_Builtin.Emphasized>
          </_Builtin.Paragraph>
        </_Builtin.Block>
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "size-popup")}
        tag="div"
        fs-modal-element="modal-8"
        fs-scrolldisable-element="preserve"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "pop-up-content-wrapper")}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(
              _styles,
              "icon-1x1-small",
              "x-close",
              "invert"
            )}
            loading="lazy"
            width="auto"
            height="auto"
            fs-modal-element="close-8"
            fs-scrolldisable-element="enable"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c5bcbad80ced3f00b77913_x-symbol.svg"
          />
          <_Builtin.Heading
            className={_utils.cx(
              _styles,
              "heading-style-h4",
              "margin-bottom-24px"
            )}
            tag="h5"
          >
            {"Sizing"}
          </_Builtin.Heading>
          <_Builtin.Paragraph>
            {
              'Matrix Mirrors offers a range of standard sizes as well as custom sizing options for their LED lighted mirrors. The standard sizes include popular sizes such as 24" x 36" and 36" x 48", however they also have a selection of larger sizes such as 60" x 72" or 48" x 72" and so on.'
            }
            <br />
            <br />
            {
              "Custom sizing options are also available, and the minimum size that can be customized is 18 inches x 24 inches, while the maximum size that can be customized is 60 inches x 144 inches. This allows customers to choose the perfect size for their bathroom or vanity space, and to ensure that the mirror fits seamlessly into the desired area."
            }
            <br />
            <br />
            {
              "Additionally, Matrix Mirrors also offers an inset frost option for certain mirrors, which allows for a frosted border around the mirror of up to 2 inches. This option can be helpful in order to provide a distinction between the mirror and the surrounding area, or for those who prefer a more subtle look."
            }
          </_Builtin.Paragraph>
          <_Builtin.Image
            className={_utils.cx(_styles, "padding-right", "padding-medium")}
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c9a74a5f6e82954e45280a_sizing.jpg"
          />
        </_Builtin.Block>
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "product-line-pop-up")}
        tag="div"
        fs-modal-element="modal-88"
        fs-scrolldisable-element="preserve"
        fs-modal-duration="500"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "pop-up-content-wrapper", "large")}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(
              _styles,
              "icon-1x1-small",
              "x-close",
              "invert"
            )}
            loading="lazy"
            width="auto"
            height="auto"
            fs-modal-element="close-88"
            fs-scrolldisable-element="enable"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/63c5bcbad80ced3f00b77913_x-symbol.svg"
          />
          <_Builtin.NotSupported _atom="DynamoWrapper" />
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
