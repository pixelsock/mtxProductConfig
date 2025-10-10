"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _interactions from "./interactions";
import * as _utils from "./utils";
import _styles from "./PortalNav.module.css";

const _interactionsData = JSON.parse(
  '{"events":{"e-1290":{"id":"e-1290","name":"","animationType":"preset","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-198","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1291"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"3c2f2722-e3c7-6f05-8576-623a08bbae4c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"3c2f2722-e3c7-6f05-8576-623a08bbae4c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1709227368141},"e-1291":{"id":"e-1291","name":"","animationType":"preset","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-199","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1290"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"3c2f2722-e3c7-6f05-8576-623a08bbae4c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"3c2f2722-e3c7-6f05-8576-623a08bbae4c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1709227368141},"e-1408":{"id":"e-1408","name":"","animationType":"preset","eventTypeId":"MOUSE_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-215","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1409"}},"mediaQueries":["small","tiny"],"target":{"id":"5879652f-58e6-67c3-5c8c-728ea3863aab","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"5879652f-58e6-67c3-5c8c-728ea3863aab","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716509909207},"e-1410":{"id":"e-1410","name":"","animationType":"preset","eventTypeId":"MOUSE_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-216","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1411"}},"mediaQueries":["small","tiny"],"target":{"id":"5879652f-58e6-67c3-5c8c-728ea3863aac","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"5879652f-58e6-67c3-5c8c-728ea3863aac","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716509909207}},"actionLists":{"a-198":{"id":"a-198","title":"Navbar 10 [Open Menu] 2","actionItemGroups":[{"actionItems":[{"id":"a-198-n","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"inOutQuint","duration":200,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-middle","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f5"]},"widthValue":0,"widthUnit":"px","heightUnit":"PX","locked":false}},{"id":"a-198-n-2","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-bottom","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f7"]},"yValue":-8,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-198-n-3","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-top","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f4"]},"yValue":8,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-198-n-4","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-top","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f4"]},"zValue":-45,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-198-n-5","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-bottom","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f7"]},"zValue":45,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1626168378054},"a-199":{"id":"a-199","title":"Navbar 10 [Close Menu] 2","actionItemGroups":[{"actionItems":[{"id":"a-199-n","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-bottom","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f7"]},"yValue":0,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-199-n-2","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-top","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f4"]},"yValue":0,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-199-n-3","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-bottom","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f7"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-199-n-4","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-top","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f4"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-199-n-5","actionTypeId":"STYLE_SIZE","config":{"delay":400,"easing":"inOutQuint","duration":200,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-middle","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f5"]},"widthValue":24,"widthUnit":"px","heightUnit":"PX","locked":false}}]}],"useFirstGroupAsInitialState":false,"createdOn":1626168766736},"a-215":{"id":"a-215","title":"Open Sidebar","actionItemGroups":[{"actionItems":[{"id":"a-215-n-7","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".dash_user-wrap","selectorGuids":["47ffc95d-3060-eae0-6fb6-13ae17739571"]},"value":"block"}},{"id":"a-215-n-8","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".dash_menu-text","selectorGuids":["9087756c-e544-b666-1450-9c73d3155ee0"]},"value":"block"}},{"id":"a-215-n-6","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"id":"66367e1fd2d3bf95de1a750b|5879652f-58e6-67c3-5c8c-728ea3863aac"},"value":"block"}},{"id":"a-215-n-9","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"id":"66367e1fd2d3bf95de1a750b|5879652f-58e6-67c3-5c8c-728ea3863aab"},"value":"none"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1714856305959},"a-216":{"id":"a-216","title":"Close Sidebar","actionItemGroups":[{"actionItems":[{"id":"a-216-n","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".dash_menu-text","selectorGuids":["9087756c-e544-b666-1450-9c73d3155ee0"]},"value":"none"}},{"id":"a-216-n-2","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".dash_user-wrap","selectorGuids":["47ffc95d-3060-eae0-6fb6-13ae17739571"]},"value":"none"}},{"id":"a-216-n-3","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"id":"66367e1fd2d3bf95de1a750b|5879652f-58e6-67c3-5c8c-728ea3863aac"},"value":"none"}},{"id":"a-216-n-5","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"id":"66367e1fd2d3bf95de1a750b|5879652f-58e6-67c3-5c8c-728ea3863aab"},"value":"block"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1714856305959}},"site":{"mediaQueries":[{"key":"main","min":992,"max":10000},{"key":"medium","min":768,"max":991},{"key":"small","min":480,"max":767},{"key":"tiny","min":0,"max":479}]}}'
);

export function PortalNav({ as: _Component = _Builtin.NavbarWrapper }) {
  _interactions.useInteractions(_interactionsData, _styles);

  return (
    <_Component
      className={_utils.cx(_styles, "navbar10_component")}
      data-w-id="3c2f2722-e3c7-6f05-8576-623a08bbae4c"
      tag="div"
      fs-scrolldisable-element="smart-nav"
      config={{
        animation: "default",
        collapse: "medium",
        docHeight: false,
        duration: 400,
        easing: "ease",
        easing2: "ease",
        noScroll: false,
      }}
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "navbar10_container")}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "dash_logo-wrap")}
          tag="div"
        >
          <_Builtin.HtmlEmbed
            className={_utils.cx(
              _styles,
              "icon-embed-small",
              "text-color-gold",
              "open-sidebar"
            )}
            data-w-id="5879652f-58e6-67c3-5c8c-728ea3863aab"
            value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--carbon%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2032%2032%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M28%204H4c-1.1%200-2%20.9-2%202v20c0%201.1.9%202%202%202h24c1.1%200%202-.9%202-2V6c0-1.1-.9-2-2-2M10%2026H4V6h6zm18%200H12v-9h10.2l-3.6%203.6L20%2022l6-6l-6-6l-1.4%201.4l3.6%203.6H12V6h16z%22%2F%3E%3C%2Fsvg%3E"
          />
          <_Builtin.HtmlEmbed
            className={_utils.cx(
              _styles,
              "icon-embed-small",
              "text-color-gold",
              "",
              "close-sidebar"
            )}
            data-w-id="5879652f-58e6-67c3-5c8c-728ea3863aac"
            value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--carbon%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2032%2032%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M28%204H4c-1.1%200-2%20.9-2%202v20c0%201.1.9%202%202%202h24c1.1%200%202-.9%202-2V6c0-1.1-.9-2-2-2m0%2011H17.8l3.6-3.6L20%2010l-6%206l6%206l1.4-1.4l-3.6-3.6H28v9H12V6h16z%22%2F%3E%3C%2Fsvg%3E"
          />
          <_Builtin.NavbarBrand
            className={_utils.cx(_styles, "navbar10_logo-link")}
            options={{
              href: "#",
            }}
          >
            <_Builtin.Image
              className={_utils.cx(_styles, "navbar10_logo")}
              loading="lazy"
              width="auto"
              height="auto"
              alt=""
              src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/67d1e7a9d695f8628a8b61db_MATRIX%20MIRRORS%20LOGO%20WY.avif"
            />
          </_Builtin.NavbarBrand>
        </_Builtin.Block>
      </_Builtin.Block>
      <_Builtin.DropdownWrapper
        tag="div"
        data-ms-content="members"
        delay={0}
        hover={false}
      >
        <_Builtin.DropdownToggle
          className={_utils.cx(_styles, "ms-profile-dropdown")}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "ms-dropdown-image")}
            loading="auto"
            width="auto"
            height="auto"
            data-ms-member="profile-image"
            src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/664fb0d9e89af2b4fc0a4e6f_transparent%20white%20profile%20image.svg"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "ms-dropdown-text")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "ms-dropdown-name")}
              tag="div"
            >
              <_Builtin.Block tag="div" data-ms-member="first-name">
                {"First"}
              </_Builtin.Block>
              <_Builtin.Block tag="div" data-ms-member="last-name">
                {"Last"}
              </_Builtin.Block>
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cx(_styles, "ms-dropdown-email")}
              tag="div"
              data-ms-member="email"
            >
              {"email@email.com"}
            </_Builtin.Block>
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "ms-profile-svg-wrap")}
            tag="div"
          >
            <_Builtin.HtmlEmbed
              className={_utils.cx(_styles, "ms-profile-icon")}
              value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--ic%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22m8.71%2011.71l2.59%202.59c.39.39%201.02.39%201.41%200l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89%200-1.33%201.08-.7%201.71z%22%2F%3E%3C%2Fsvg%3E"
            />
          </_Builtin.Block>
        </_Builtin.DropdownToggle>
        <_Builtin.DropdownList
          className={_utils.cx(_styles, "ms-dropdown-menu")}
          tag="nav"
        >
          <_Builtin.Link
            className={_utils.cx(_styles, "ms-dropdown-link")}
            button={false}
            data-ms-action="profile-image"
            block="inline"
            options={{
              href: "#",
            }}
          >
            <_Builtin.Image
              loading="lazy"
              width="16"
              height="auto"
              src="https://cdn.prod.website-files.com/638fbc9b6d164e234dc677d7/664fb0d9e89af2b4fc0a4e47_file_upload_black_24dp%20(1).svg"
            />
            <_Builtin.Block tag="div">{"Update Image"}</_Builtin.Block>
          </_Builtin.Link>
          <_Builtin.DropdownLink
            className={_utils.cx(_styles, "ms-dropdown-link")}
            data-ms-modal="profile"
            options={{
              href: "#",
            }}
          >
            {"My Profile"}
          </_Builtin.DropdownLink>
          <_Builtin.DropdownLink
            className={_utils.cx(_styles, "ms-dropdown-link")}
            options={{
              href: "#",
            }}
          >
            {"Build A Quote"}
          </_Builtin.DropdownLink>
          <_Builtin.DropdownLink
            className={_utils.cx(_styles, "ms-dropdown-link")}
            options={{
              href: "#",
            }}
          >
            {"Contact Us"}
          </_Builtin.DropdownLink>
          <_Builtin.DropdownLink
            className={_utils.cx(_styles, "ms-dropdown-link")}
            data-ms-action="logout"
            options={{
              href: "#",
            }}
          >
            {"Logout"}
          </_Builtin.DropdownLink>
        </_Builtin.DropdownList>
      </_Builtin.DropdownWrapper>
    </_Component>
  );
}
