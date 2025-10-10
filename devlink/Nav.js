"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./Nav.module.css";

export function Nav({ as: _Component = _Builtin.NavbarWrapper }) {
  return (
    <_Component
      className={_utils.cx(_styles, "navbar22_component")}
      tag="div"
      data-collapse="all"
      data-animation="default"
      data-duration="400"
      data-doc-height="1"
      fs-scrolldisable-element="smart-nav"
      config={{
        animation: "default",
        easing: "ease",
        easing2: "ease",
        duration: 0,
        collapse: "all",
        noScroll: false,
        docHeight: false,
      }}
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "navbar22_container")}
        tag="div"
      >
        <_Builtin.NavbarBrand
          className={_utils.cx(_styles, "navbar22_logo-link")}
          options={{
            href: "#",
          }}
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "navbar22_logo")}
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/639a318a3278f1633bee5c63_matrix_logo_PRIMARY-white-pv0du71ayys11ubj7zenwpssllu7z0yg49pmorkism.png"
          />
        </_Builtin.NavbarBrand>
        <_Builtin.Block
          className={_utils.cx(_styles, "navbar22_link-wrapper")}
          tag="div"
        >
          <_Builtin.Link
            className={_utils.cx(_styles, "navbar22_link")}
            button={false}
            block=""
            options={{
              href: "#",
            }}
          >
            {"Our Company"}
          </_Builtin.Link>
          <_Builtin.Link
            className={_utils.cx(_styles, "navbar22_link")}
            button={false}
            block=""
            options={{
              href: "#",
            }}
          >
            {"Our Mirrors"}
          </_Builtin.Link>
          <_Builtin.Link
            className={_utils.cx(_styles, "navbar22_link")}
            button={false}
            block=""
            options={{
              href: "#",
            }}
          >
            {"Reps & Showrooms"}
          </_Builtin.Link>
          <_Builtin.DropdownWrapper
            className={_utils.cx(_styles, "navbar22_menu-dropdown")}
            tag="div"
            delay="200"
            hover={true}
          >
            <_Builtin.DropdownToggle
              className={_utils.cx(_styles, "navbar22_dropdwn-toggle")}
              tag="div"
            >
              <_Builtin.HtmlEmbed
                className={_utils.cx(_styles, "dropdown-icon")}
                value="%3Csvg%20width%3D%22%20100%25%22%20height%3D%22%20100%25%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M2.55806%206.29544C2.46043%206.19781%202.46043%206.03952%202.55806%205.94189L3.44195%205.058C3.53958%204.96037%203.69787%204.96037%203.7955%205.058L8.00001%209.26251L12.2045%205.058C12.3021%204.96037%2012.4604%204.96037%2012.5581%205.058L13.4419%205.94189C13.5396%206.03952%2013.5396%206.19781%2013.4419%206.29544L8.17678%2011.5606C8.07915%2011.6582%207.92086%2011.6582%207.82323%2011.5606L2.55806%206.29544Z%22%20fill%3D%22currentColor%22%2F%3E%0A%3C%2Fsvg%3E"
              />
              <_Builtin.Block tag="div">{"Industries"}</_Builtin.Block>
            </_Builtin.DropdownToggle>
            <_Builtin.DropdownList
              className={_utils.cx(_styles, "navbar22_dropdown-list")}
              tag="nav"
            >
              <_Builtin.DropdownLink
                className={_utils.cx(_styles, "navbar22_link")}
                options={{
                  href: "#",
                }}
              >
                {"Architects & Designers"}
              </_Builtin.DropdownLink>
              <_Builtin.DropdownLink
                className={_utils.cx(_styles, "navbar22_link")}
                options={{
                  href: "#",
                }}
              >
                {"Multi-Family Owners"}
              </_Builtin.DropdownLink>
              <_Builtin.DropdownLink
                className={_utils.cx(_styles, "navbar22_link")}
                options={{
                  href: "#",
                }}
              >
                {"Showrooms & Dealers"}
              </_Builtin.DropdownLink>
              <_Builtin.DropdownLink
                options={{
                  href: "#",
                }}
              >
                {"Builders & Contractors"}
              </_Builtin.DropdownLink>
              <_Builtin.DropdownLink
                options={{
                  href: "#",
                }}
              >
                {"Healthcare"}
              </_Builtin.DropdownLink>
            </_Builtin.DropdownList>
          </_Builtin.DropdownWrapper>
        </_Builtin.Block>
        <_Builtin.Block className={_utils.cx(_styles, "div-block-5")} tag="div">
          <_Builtin.Link
            className={_utils.cx(_styles, "button", "is-header-button")}
            button={true}
            block=""
            options={{
              href: "#",
            }}
          >
            {"Custom Quote"}
          </_Builtin.Link>
          <_Builtin.Block
            className={_utils.cx(_styles, "navbar22_wrapper")}
            tag="div"
          >
            <_Builtin.NavbarMenu
              className={_utils.cx(_styles, "navbar22_menu")}
              tag="nav"
              role="navigation"
            >
              <_Builtin.Block
                className={_utils.cx(_styles, "navbar22_menu-wrapper")}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "navbar22_menu-left")}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cx(
                      _styles,
                      "navbar22_menu-links-wrapper"
                    )}
                    tag="div"
                  >
                    <_Builtin.NavbarLink
                      className={_utils.cx(_styles, "navbar22_link-large")}
                      options={{
                        href: "#",
                      }}
                    >
                      {"About Us"}
                    </_Builtin.NavbarLink>
                    <_Builtin.NavbarLink
                      className={_utils.cx(_styles, "navbar22_link-large")}
                      options={{
                        href: "#",
                      }}
                    >
                      {"Our Mirrors"}
                    </_Builtin.NavbarLink>
                    <_Builtin.NavbarLink
                      className={_utils.cx(_styles, "navbar22_link-large")}
                      options={{
                        href: "#",
                      }}
                    >
                      {"Reps & Showrooms"}
                    </_Builtin.NavbarLink>
                    <_Builtin.NavbarLink
                      className={_utils.cx(_styles, "navbar22_link-large")}
                      options={{
                        href: "#",
                      }}
                    >
                      {"Architects & Designers"}
                    </_Builtin.NavbarLink>
                    <_Builtin.NavbarLink
                      className={_utils.cx(_styles, "navbar22_link-large")}
                      options={{
                        href: "#",
                      }}
                    >
                      {"Multi-Family Owners"}
                    </_Builtin.NavbarLink>
                    <_Builtin.NavbarLink
                      className={_utils.cx(_styles, "navbar22_link-large")}
                      options={{
                        href: "#",
                      }}
                    >
                      {"Builders & Contractors"}
                    </_Builtin.NavbarLink>
                    <_Builtin.NavbarLink
                      className={_utils.cx(_styles, "navbar22_link-large")}
                      options={{
                        href: "#",
                      }}
                    >
                      {"Healthcare"}
                    </_Builtin.NavbarLink>
                    <_Builtin.NavbarLink
                      className={_utils.cx(_styles, "navbar22_link-large")}
                      options={{
                        href: "#",
                      }}
                    >
                      {"Catalogue"}
                    </_Builtin.NavbarLink>
                  </_Builtin.Block>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "button", "major")}
                    button={true}
                    block=""
                    options={{
                      href: "#",
                    }}
                  >
                    {"Custom Quote"}
                  </_Builtin.Link>
                </_Builtin.Block>
                <_Builtin.Block
                  className={_utils.cx(_styles, "navbar22_menu-right")}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cx(_styles, "navbar22_contact-form")}
                    tag="div"
                  >
                    <_Builtin.Block
                      className={_utils.cx(
                        _styles,
                        "margin-bottom",
                        "margin-xsmall"
                      )}
                      tag="div"
                    >
                      <_Builtin.Heading tag="h5">{"Contact"}</_Builtin.Heading>
                    </_Builtin.Block>
                    <_Builtin.Block
                      className={_utils.cx(
                        _styles,
                        "margin-bottom",
                        "margin-medium"
                      )}
                      tag="div"
                    >
                      <_Builtin.Block tag="div">
                        {"Lorem ipsum dolor sit amet, consectetur."}
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.FormWrapper
                      className={_utils.cx(_styles, "navbar22_form-wrapper")}
                    >
                      <_Builtin.FormForm
                        className={_utils.cx(_styles, "navbar22_form")}
                        name="wf-form-Contact-1-Form"
                        data-name="Contact 1 Form"
                        method="get"
                        id="wf-form-Contact-1-Form"
                      >
                        <_Builtin.Block
                          className={_utils.cx(_styles, "form-field-wrapper")}
                          tag="div"
                        >
                          <_Builtin.FormBlockLabel
                            className={_utils.cx(_styles, "field-label")}
                            htmlFor="Contact-1-Name-3"
                          >
                            {"Name"}
                          </_Builtin.FormBlockLabel>
                          <_Builtin.FormTextInput
                            className={_utils.cx(_styles, "form-input")}
                            autoFocus={false}
                            maxLength={256}
                            name="Contact-1-Name-2"
                            data-name="Contact 1 Name 2"
                            type="text"
                            disabled={false}
                            required={true}
                            id="Contact-1-Name-2"
                          />
                        </_Builtin.Block>
                        <_Builtin.Block
                          className={_utils.cx(_styles, "form-field-wrapper")}
                          tag="div"
                        >
                          <_Builtin.FormBlockLabel
                            className={_utils.cx(_styles, "field-label")}
                            htmlFor="Contact-1-Email-2"
                          >
                            {"Email"}
                          </_Builtin.FormBlockLabel>
                          <_Builtin.FormTextInput
                            className={_utils.cx(_styles, "form-input")}
                            autoFocus={false}
                            maxLength={256}
                            name="Contact-1-Email-2"
                            data-name="Contact 1 Email 2"
                            type="email"
                            disabled={false}
                            required={true}
                            id="Contact-1-Email-2"
                          />
                        </_Builtin.Block>
                        <_Builtin.Block
                          className={_utils.cx(_styles, "form-field-wrapper")}
                          tag="div"
                        >
                          <_Builtin.FormBlockLabel
                            className={_utils.cx(_styles, "field-label")}
                            htmlFor="Contact-1-Email-2"
                          >
                            {"Message"}
                          </_Builtin.FormBlockLabel>
                          <_Builtin.FormTextarea
                            className={_utils.cx(
                              _styles,
                              "form-input",
                              "is-text-area"
                            )}
                            placeholder="Type your message..."
                            maxLength={5000}
                            name="Contact-1-Message-2"
                            data-name="Contact 1 Message 2"
                            required={true}
                            autoFocus={false}
                            id="Contact-1-Message-2"
                          />
                        </_Builtin.Block>
                        <_Builtin.Block
                          className={_utils.cx(
                            _styles,
                            "margin-bottom",
                            "margin-xsmall"
                          )}
                          tag="div"
                        >
                          <_Builtin.FormCheckboxWrapper
                            className={_utils.cx(_styles, "form-checkbox")}
                            id="Contact-1-Checkbox"
                          >
                            <_Builtin.FormCheckboxInput
                              className={_utils.cx(
                                _styles,
                                "form-checkbox-icon"
                              )}
                              type="checkbox"
                              name="Contact-1-Checkbox-2"
                              data-name="Contact 1 Checkbox 2"
                              required={true}
                              checked={false}
                              id="Contact-1-Checkbox-2"
                              form={{
                                type: "checkbox-input",
                                name: "Contact 1 Checkbox 2",
                              }}
                              inputType="custom"
                              customClassName="w-checkbox-input--inputType-custom"
                            />
                            <_Builtin.FormInlineLabel
                              className={_utils.cx(
                                _styles,
                                "form-checkbox-label",
                                "text-size-small"
                              )}
                              htmlFor="Contact 1 Checkbox-2"
                            >
                              {"I accept the "}
                              <_Builtin.Link
                                className={_utils.cx(
                                  _styles,
                                  "text-style-link"
                                )}
                                button={false}
                                block=""
                                options={{
                                  href: "#",
                                }}
                              >
                                {"Terms"}
                              </_Builtin.Link>
                            </_Builtin.FormInlineLabel>
                          </_Builtin.FormCheckboxWrapper>
                        </_Builtin.Block>
                        <_Builtin.FormButton
                          className={_utils.cx(_styles, "button")}
                          id={_utils.cx(
                            _styles,
                            "w-node-_26c2c892-778c-358a-11cf-956af007009c-f0070053"
                          )}
                          type="submit"
                          value="Submit"
                          data-wait="Please wait..."
                        />
                      </_Builtin.FormForm>
                      <_Builtin.FormSuccessMessage
                        className={_utils.cx(_styles, "success-message")}
                      >
                        <_Builtin.Block
                          className={_utils.cx(_styles, "success-text")}
                          tag="div"
                        >
                          {"Thank you! Your submission has been received!"}
                        </_Builtin.Block>
                      </_Builtin.FormSuccessMessage>
                      <_Builtin.FormErrorMessage
                        className={_utils.cx(_styles, "error-message")}
                      >
                        <_Builtin.Block
                          className={_utils.cx(_styles, "error-text")}
                          tag="div"
                        >
                          {
                            "Oops! Something went wrong while submitting the form."
                          }
                        </_Builtin.Block>
                      </_Builtin.FormErrorMessage>
                    </_Builtin.FormWrapper>
                  </_Builtin.Block>
                </_Builtin.Block>
                <_Builtin.Block
                  className={_utils.cx(_styles, "navbar22_bottom")}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cx(
                      _styles,
                      "margin-bottom",
                      "margin-tiny"
                    )}
                    tag="div"
                  >
                    <_Builtin.Link
                      className={_utils.cx(_styles, "text-size-small")}
                      button={false}
                      block=""
                      options={{
                        href: "#",
                      }}
                    >
                      {"1800 123 4567"}
                    </_Builtin.Link>
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(
                      _styles,
                      "margin-bottom",
                      "margin-tiny"
                    )}
                    tag="div"
                  >
                    <_Builtin.Link
                      className={_utils.cx(_styles, "text-size-small")}
                      button={false}
                      block=""
                      options={{
                        href: "#",
                      }}
                    >
                      {"info@relume.io"}
                    </_Builtin.Link>
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-size-small")}
                    tag="div"
                  >
                    {"Level 1, 12 Sample St, Sydney NSW 2000"}
                  </_Builtin.Block>
                  <_Builtin.Grid
                    className={_utils.cx(_styles, "navbar22_social-list")}
                    tag="div"
                  >
                    <_Builtin.Link
                      className={_utils.cx(_styles, "navbar22_social-link")}
                      button={false}
                      block="inline"
                      options={{
                        href: "#",
                      }}
                    >
                      <_Builtin.HtmlEmbed
                        className={_utils.cx(_styles, "social-icon")}
                        value="%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M16.5%206H13.5C12.9477%206%2012.5%206.44772%2012.5%207V10H16.5C16.6137%209.99748%2016.7216%2010.0504%2016.7892%2010.1419C16.8568%2010.2334%2016.8758%2010.352%2016.84%2010.46L16.1%2012.66C16.0318%2012.8619%2015.8431%2012.9984%2015.63%2013H12.5V20.5C12.5%2020.7761%2012.2761%2021%2012%2021H9.5C9.22386%2021%209%2020.7761%209%2020.5V13H7.5C7.22386%2013%207%2012.7761%207%2012.5V10.5C7%2010.2239%207.22386%2010%207.5%2010H9V7C9%204.79086%2010.7909%203%2013%203H16.5C16.7761%203%2017%203.22386%2017%203.5V5.5C17%205.77614%2016.7761%206%2016.5%206Z%22%20fill%3D%22CurrentColor%22%2F%3E%0A%3C%2Fsvg%3E"
                      />
                    </_Builtin.Link>
                    <_Builtin.Link
                      className={_utils.cx(_styles, "navbar22_social-link")}
                      button={false}
                      block="inline"
                      options={{
                        href: "#",
                      }}
                    >
                      <_Builtin.HtmlEmbed
                        className={_utils.cx(_styles, "social-icon")}
                        value="%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M16%203H8C5.23858%203%203%205.23858%203%208V16C3%2018.7614%205.23858%2021%208%2021H16C18.7614%2021%2021%2018.7614%2021%2016V8C21%205.23858%2018.7614%203%2016%203ZM19.25%2016C19.2445%2017.7926%2017.7926%2019.2445%2016%2019.25H8C6.20735%2019.2445%204.75549%2017.7926%204.75%2016V8C4.75549%206.20735%206.20735%204.75549%208%204.75H16C17.7926%204.75549%2019.2445%206.20735%2019.25%208V16ZM16.75%208.25C17.3023%208.25%2017.75%207.80228%2017.75%207.25C17.75%206.69772%2017.3023%206.25%2016.75%206.25C16.1977%206.25%2015.75%206.69772%2015.75%207.25C15.75%207.80228%2016.1977%208.25%2016.75%208.25ZM12%207.5C9.51472%207.5%207.5%209.51472%207.5%2012C7.5%2014.4853%209.51472%2016.5%2012%2016.5C14.4853%2016.5%2016.5%2014.4853%2016.5%2012C16.5027%2010.8057%2016.0294%209.65957%2015.1849%208.81508C14.3404%207.97059%2013.1943%207.49734%2012%207.5ZM9.25%2012C9.25%2013.5188%2010.4812%2014.75%2012%2014.75C13.5188%2014.75%2014.75%2013.5188%2014.75%2012C14.75%2010.4812%2013.5188%209.25%2012%209.25C10.4812%209.25%209.25%2010.4812%209.25%2012Z%22%20fill%3D%22CurrentColor%22%2F%3E%0A%3C%2Fsvg%3E"
                      />
                    </_Builtin.Link>
                    <_Builtin.Link
                      className={_utils.cx(_styles, "navbar22_social-link")}
                      button={false}
                      block="inline"
                      options={{
                        href: "#",
                      }}
                    >
                      <_Builtin.HtmlEmbed
                        className={_utils.cx(_styles, "social-icon")}
                        value="%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M20.9728%206.7174C20.5084%207.33692%2019.947%207.87733%2019.3103%208.31776C19.3103%208.47959%2019.3103%208.64142%2019.3103%208.81225C19.3154%2011.7511%2018.1415%2014.5691%2016.0518%2016.6345C13.962%2018.6999%2011.1312%2019.8399%208.19405%2019.7989C6.49599%2019.8046%204.81967%2019.4169%203.29642%2018.6661C3.21428%2018.6302%203.16131%2018.549%203.16162%2018.4593V18.3604C3.16162%2018.2313%203.26623%2018.1267%203.39527%2018.1267C5.06442%2018.0716%206.67402%2017.4929%207.99634%2016.4724C6.48553%2016.4419%205.12619%2015.5469%204.5006%2014.1707C4.46901%2014.0956%204.47884%2014.0093%204.52657%2013.9432C4.57429%2013.8771%204.653%2013.8407%204.73425%2013.8471C5.19342%2013.8932%205.65718%2013.8505%206.1002%2013.7212C4.43239%2013.375%203.17921%2011.9904%202.99986%2010.2957C2.99349%2010.2144%203.02992%2010.1357%203.096%2010.0879C3.16207%2010.0402%203.24824%2010.0303%203.32338%2010.062C3.77094%2010.2595%204.25409%2010.3635%204.74324%2010.3676C3.28184%209.40846%202.65061%207.58405%203.20655%205.92622C3.26394%205.76513%203.40181%205.64612%203.5695%205.61294C3.73718%205.57975%203.90996%205.63728%204.02432%205.76439C5.99639%207.86325%208.70604%209.11396%2011.5819%209.25279C11.5083%208.95885%2011.4721%208.65676%2011.4741%208.35372C11.501%206.76472%2012.4842%205.34921%2013.9634%204.76987C15.4425%204.19054%2017.1249%204.56203%2018.223%205.71044C18.9714%205.56785%2019.695%205.31645%2020.3707%204.96421C20.4202%204.93331%2020.483%204.93331%2020.5325%204.96421C20.5634%205.01373%2020.5634%205.07652%2020.5325%205.12604C20.2052%205.87552%2019.6523%206.50412%2018.9509%206.92419C19.5651%206.85296%2020.1685%206.70807%2020.7482%206.49264C20.797%206.45942%2020.8611%206.45942%2020.9099%206.49264C20.9508%206.51134%2020.9814%206.54711%2020.9935%206.59042C21.0056%206.63373%2020.998%206.68018%2020.9728%206.7174Z%22%20fill%3D%22CurrentColor%22%2F%3E%0A%3C%2Fsvg%3E"
                      />
                    </_Builtin.Link>
                    <_Builtin.Link
                      className={_utils.cx(_styles, "navbar22_social-link")}
                      button={false}
                      block="inline"
                      options={{
                        href: "#",
                      }}
                    >
                      <_Builtin.HtmlEmbed
                        className={_utils.cx(_styles, "social-icon")}
                        value="%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M5%203H19C20.1046%203%2021%203.89543%2021%205V19C21%2020.1046%2020.1046%2021%2019%2021H5C3.89543%2021%203%2020.1046%203%2019V5C3%203.89543%203.89543%203%205%203ZM8%2018C8.27614%2018%208.5%2017.7761%208.5%2017.5V10.5C8.5%2010.2239%208.27614%2010%208%2010H6.5C6.22386%2010%206%2010.2239%206%2010.5V17.5C6%2017.7761%206.22386%2018%206.5%2018H8ZM7.25%209C6.42157%209%205.75%208.32843%205.75%207.5C5.75%206.67157%206.42157%206%207.25%206C8.07843%206%208.75%206.67157%208.75%207.5C8.75%208.32843%208.07843%209%207.25%209ZM17.5%2018C17.7761%2018%2018%2017.7761%2018%2017.5V12.9C18.0325%2011.3108%2016.8576%209.95452%2015.28%209.76C14.177%209.65925%2013.1083%2010.1744%2012.5%2011.1V10.5C12.5%2010.2239%2012.2761%2010%2012%2010H10.5C10.2239%2010%2010%2010.2239%2010%2010.5V17.5C10%2017.7761%2010.2239%2018%2010.5%2018H12C12.2761%2018%2012.5%2017.7761%2012.5%2017.5V13.75C12.5%2012.9216%2013.1716%2012.25%2014%2012.25C14.8284%2012.25%2015.5%2012.9216%2015.5%2013.75V17.5C15.5%2017.7761%2015.7239%2018%2016%2018H17.5Z%22%20fill%3D%22CurrentColor%22%2F%3E%0A%3C%2Fsvg%3E"
                      />
                    </_Builtin.Link>
                  </_Builtin.Grid>
                </_Builtin.Block>
              </_Builtin.Block>
            </_Builtin.NavbarMenu>
            <_Builtin.NavbarButton
              className={_utils.cx(_styles, "navbar22_menu-button")}
              tag="div"
            >
              <_Builtin.Block
                className={_utils.cx(_styles, "menu-icon4")}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "menu-icon4_wrapper")}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cx(_styles, "menu-icon4_line-top")}
                    tag="div"
                  />
                  <_Builtin.Block
                    className={_utils.cx(_styles, "menu-icon4_line-middle")}
                    tag="div"
                  >
                    <_Builtin.Block
                      className={_utils.cx(
                        _styles,
                        "menu-icon_line-middle-top"
                      )}
                      tag="div"
                    />
                    <_Builtin.Block
                      className={_utils.cx(
                        _styles,
                        "menu-icon_line-middle-base"
                      )}
                      tag="div"
                    />
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "menu-icon4_line-bottom")}
                    tag="div"
                  />
                </_Builtin.Block>
              </_Builtin.Block>
            </_Builtin.NavbarButton>
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
