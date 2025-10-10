"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _interactions from "./interactions";
import * as _utils from "./utils";
import _styles from "./DashNav.module.css";

const _interactionsData = JSON.parse(
  '{"events":{"e-1408":{"id":"e-1408","name":"","animationType":"preset","eventTypeId":"MOUSE_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-215","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1409"}},"mediaQueries":["small","tiny"],"target":{"id":"5879652f-58e6-67c3-5c8c-728ea3863aab","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"5879652f-58e6-67c3-5c8c-728ea3863aab","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716509909207},"e-1410":{"id":"e-1410","name":"","animationType":"preset","eventTypeId":"MOUSE_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-216","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1411"}},"mediaQueries":["small","tiny"],"target":{"id":"5879652f-58e6-67c3-5c8c-728ea3863aac","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"5879652f-58e6-67c3-5c8c-728ea3863aac","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716509909207}},"actionLists":{"a-215":{"id":"a-215","title":"Open Sidebar","actionItemGroups":[{"actionItems":[{"id":"a-215-n-7","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".dash_user-wrap","selectorGuids":["47ffc95d-3060-eae0-6fb6-13ae17739571"]},"value":"block"}},{"id":"a-215-n-8","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".dash_menu-text","selectorGuids":["9087756c-e544-b666-1450-9c73d3155ee0"]},"value":"block"}},{"id":"a-215-n-6","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"id":"66367e1fd2d3bf95de1a750b|5879652f-58e6-67c3-5c8c-728ea3863aac"},"value":"block"}},{"id":"a-215-n-9","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"id":"66367e1fd2d3bf95de1a750b|5879652f-58e6-67c3-5c8c-728ea3863aab"},"value":"none"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1714856305959},"a-216":{"id":"a-216","title":"Close Sidebar","actionItemGroups":[{"actionItems":[{"id":"a-216-n","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".dash_menu-text","selectorGuids":["9087756c-e544-b666-1450-9c73d3155ee0"]},"value":"none"}},{"id":"a-216-n-2","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".dash_user-wrap","selectorGuids":["47ffc95d-3060-eae0-6fb6-13ae17739571"]},"value":"none"}},{"id":"a-216-n-3","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"id":"66367e1fd2d3bf95de1a750b|5879652f-58e6-67c3-5c8c-728ea3863aac"},"value":"none"}},{"id":"a-216-n-5","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"id":"66367e1fd2d3bf95de1a750b|5879652f-58e6-67c3-5c8c-728ea3863aab"},"value":"block"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1714856305959}},"site":{"mediaQueries":[{"key":"main","min":992,"max":10000},{"key":"medium","min":768,"max":991},{"key":"small","min":480,"max":767},{"key":"tiny","min":0,"max":479}]}}'
);

export function DashNav({ as: _Component = _Builtin.Block }) {
  _interactions.useInteractions(_interactionsData, _styles);

  return (
    <_Component className={_utils.cx(_styles, "dash_nav-wrap")} tag="div">
      <_Builtin.Block className={_utils.cx(_styles, "dash_nav-menu")} tag="div">
        <_Builtin.Link
          className={_utils.cx(_styles, "dash_nav-link")}
          button={false}
          block="inline"
          options={{
            href: "#",
          }}
        >
          <_Builtin.HtmlEmbed
            className={_utils.cx(_styles, "icon-embed-xsmall")}
            value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--ic%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M10%2019v-5h4v5c0%20.55.45%201%201%201h3c.55%200%201-.45%201-1v-7h1.7c.46%200%20.68-.57.33-.87L12.67%203.6c-.38-.34-.96-.34-1.34%200l-8.36%207.53c-.34.3-.13.87.33.87H5v7c0%20.55.45%201%201%201h3c.55%200%201-.45%201-1%22%2F%3E%3C%2Fsvg%3E"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "dash_menu-text")}
            tag="div"
          >
            {"Main Site"}
          </_Builtin.Block>
        </_Builtin.Link>
        <_Builtin.Link
          className={_utils.cx(_styles, "dash_nav-link")}
          button={false}
          block="inline"
          options={{
            href: "#",
          }}
        >
          <_Builtin.HtmlEmbed
            className={_utils.cx(_styles, "icon-embed-xsmall")}
            value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--ic%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22m19.41%207.41l-4.83-4.83c-.37-.37-.88-.58-1.41-.58H6c-1.1%200-1.99.9-1.99%202L4%2020c0%201.1.89%202%201.99%202H18c1.1%200%202-.9%202-2V8.83c0-.53-.21-1.04-.59-1.42M14%2013c.55%200%201%20.45%201%201v3c0%20.55-.45%201-1%201h-1c0%20.55-.45%201-1%201s-1-.45-1-1h-1c-.55%200-1-.45-1-1s.45-1%201-1h3v-1h-3c-.55%200-1-.45-1-1v-3c0-.55.45-1%201-1h1c0-.55.45-1%201-1s1%20.45%201%201h1c.55%200%201%20.45%201%201s-.45%201-1%201h-3v1zm0-5c-.55%200-1-.45-1-1V3.5L17.5%208z%22%2F%3E%3C%2Fsvg%3E"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "dash_menu-text")}
            tag="div"
          >
            {"Build A Quote"}
          </_Builtin.Block>
        </_Builtin.Link>
        <_Builtin.Link
          className={_utils.cx(_styles, "dash_nav-link")}
          button={false}
          block="inline"
          options={{
            href: "#",
          }}
        >
          <_Builtin.HtmlEmbed
            className={_utils.cx(_styles, "icon-embed-xsmall")}
            value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--ic%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20fill-rule%3D%22evenodd%22%20d%3D%22M17%206H8a2%202%200%200%200-2%202v11a2%202%200%200%200%202%202h11c1.1%200%202-.9%202-2v-9zM8%209.5A1.5%201.5%200%200%201%209.5%208h4a1.5%201.5%200%200%201%200%203h-4A1.5%201.5%200%200%201%208%209.5m5.5%209.5a2.5%202.5%200%201%200%200-5a2.5%202.5%200%200%200%200%205%22%20clip-rule%3D%22evenodd%22%2F%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M2%204a2%202%200%200%201%202-2h9a1%201%200%201%201%200%202H5a1%201%200%200%200-1%201v8a1%201%200%201%201-2%200z%22%2F%3E%3C%2Fsvg%3E"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "dash_menu-text")}
            tag="div"
          >
            {"Saved Quotes"}
          </_Builtin.Block>
        </_Builtin.Link>
        <_Builtin.Link
          className={_utils.cx(_styles, "dash_nav-link")}
          button={false}
          block="inline"
          options={{
            href: "#",
            target: "_blank",
          }}
        >
          <_Builtin.HtmlEmbed
            className={_utils.cx(_styles, "icon-embed-xsmall")}
            value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--ic%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M16.59%209H15V4c0-.55-.45-1-1-1h-4c-.55%200-1%20.45-1%201v5H7.41c-.89%200-1.34%201.08-.71%201.71l4.59%204.59c.39.39%201.02.39%201.41%200l4.59-4.59c.63-.63.19-1.71-.7-1.71M5%2019c0%20.55.45%201%201%201h12c.55%200%201-.45%201-1s-.45-1-1-1H6c-.55%200-1%20.45-1%201%22%2F%3E%3C%2Fsvg%3E"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "dash_menu-text")}
            tag="div"
          >
            {"Retail Pricing"}
          </_Builtin.Block>
        </_Builtin.Link>
        <_Builtin.Link
          className={_utils.cx(_styles, "dash_nav-link")}
          button={false}
          block="inline"
          options={{
            href: "#",
            target: "_blank",
          }}
        >
          <_Builtin.HtmlEmbed
            className={_utils.cx(_styles, "icon-embed-xsmall")}
            value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--ic%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M16.59%209H15V4c0-.55-.45-1-1-1h-4c-.55%200-1%20.45-1%201v5H7.41c-.89%200-1.34%201.08-.71%201.71l4.59%204.59c.39.39%201.02.39%201.41%200l4.59-4.59c.63-.63.19-1.71-.7-1.71M5%2019c0%20.55.45%201%201%201h12c.55%200%201-.45%201-1s-.45-1-1-1H6c-.55%200-1%20.45-1%201%22%2F%3E%3C%2Fsvg%3E"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "dash_menu-text")}
            tag="div"
          >
            {"Distributor Pricing"}
          </_Builtin.Block>
        </_Builtin.Link>
        <_Builtin.Link
          className={_utils.cx(_styles, "dash_nav-link")}
          button={false}
          block="inline"
          options={{
            href: "#",
            target: "_blank",
          }}
        >
          <_Builtin.HtmlEmbed
            className={_utils.cx(_styles, "icon-embed-xsmall")}
            value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--ic%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M16.59%209H15V4c0-.55-.45-1-1-1h-4c-.55%200-1%20.45-1%201v5H7.41c-.89%200-1.34%201.08-.71%201.71l4.59%204.59c.39.39%201.02.39%201.41%200l4.59-4.59c.63-.63.19-1.71-.7-1.71M5%2019c0%20.55.45%201%201%201h12c.55%200%201-.45%201-1s-.45-1-1-1H6c-.55%200-1%20.45-1%201%22%2F%3E%3C%2Fsvg%3E"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "dash_menu-text")}
            tag="div"
          >
            {"M-Series Pricing"}
          </_Builtin.Block>
        </_Builtin.Link>
        <_Builtin.Link
          className={_utils.cx(_styles, "dash_nav-link")}
          button={false}
          block="inline"
          options={{
            href: "#",
            target: "_blank",
          }}
        >
          <_Builtin.HtmlEmbed
            className={_utils.cx(_styles, "icon-embed-xsmall")}
            value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--ic%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M19%207H9c-1.1%200-2%20.9-2%202v10c0%201.1.9%202%202%202h10c1.1%200%202-.9%202-2V9c0-1.1-.9-2-2-2m0%202v2H9V9zm-6%206v-2h2v2zm2%202v2h-2v-2zm-4-2H9v-2h2zm6-2h2v2h-2zm-8%204h2v2H9zm8%202v-2h2v2zM6%2017H5c-1.1%200-2-.9-2-2V5c0-1.1.9-2%202-2h10c1.1%200%202%20.9%202%202v1h-2V5H5v10h1z%22%2F%3E%3C%2Fsvg%3E"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "dash_menu-text")}
            tag="div"
          >
            {"All Products CSV"}
          </_Builtin.Block>
        </_Builtin.Link>
        <_Builtin.Link
          className={_utils.cx(_styles, "dash_nav-link")}
          button={false}
          block="inline"
          options={{
            href: "#",
            target: "_blank",
          }}
        >
          <_Builtin.HtmlEmbed
            className={_utils.cx(_styles, "icon-embed-xsmall")}
            value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--ic%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Ccircle%20cx%3D%226.18%22%20cy%3D%2217.82%22%20r%3D%222.18%22%20fill%3D%22currentColor%22%2F%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M5.59%2010.23c-.84-.14-1.59.55-1.59%201.4c0%20.71.53%201.28%201.23%201.4c2.92.51%205.22%202.82%205.74%205.74c.12.7.69%201.23%201.4%201.23c.85%200%201.54-.75%201.41-1.59a9.894%209.894%200%200%200-8.19-8.18m-.03-5.71C4.73%204.43%204%205.1%204%205.93c0%20.73.55%201.33%201.27%201.4c6.01.6%2010.79%205.38%2011.39%2011.39c.07.73.67%201.28%201.4%201.28c.84%200%201.5-.73%201.42-1.56c-.73-7.34-6.57-13.19-13.92-13.92%22%2F%3E%3C%2Fsvg%3E"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "dash_menu-text")}
            tag="div"
          >
            {"JSON Feed"}
          </_Builtin.Block>
        </_Builtin.Link>
        <_Builtin.Link
          className={_utils.cx(_styles, "dash_nav-link")}
          button={false}
          block="inline"
          options={{
            href: "#",
          }}
        >
          <_Builtin.HtmlEmbed
            className={_utils.cx(_styles, "icon-embed-xsmall")}
            value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--ic%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%222%22%20fill%3D%22currentColor%22%2F%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M19%203H5a2%202%200%200%200-2%202v14a2%202%200%200%200%202%202h14a2%202%200%200%200%202-2V5a2%202%200%200%200-2-2m-3.25%209c0%20.22-.03.42-.06.63l.84.73c.18.16.22.42.1.63l-.59%201.02c-.12.21-.37.3-.59.22l-1.06-.36c-.32.27-.68.48-1.08.63l-.22%201.09c-.05.23-.25.4-.49.4h-1.18c-.24%200-.44-.17-.49-.4l-.22-1.09c-.4-.15-.76-.36-1.08-.63l-1.06.36a.496.496%200%200%201-.59-.22l-.59-1.02a.503.503%200%200%201%20.1-.63l.84-.73c-.05-.21-.08-.41-.08-.63s.03-.42.06-.63l-.84-.73a.503.503%200%200%201-.1-.63l.59-1.02c.12-.21.37-.3.59-.22l1.06.36c.32-.27.68-.48%201.08-.63l.22-1.09c.06-.24.26-.41.5-.41h1.18c.24%200%20.44.17.49.4l.22%201.09c.4.15.76.36%201.08.63l1.06-.36c.23-.08.47.02.59.22l.59%201.02c.12.21.08.47-.1.63l-.84.73c.04.22.07.42.07.64%22%2F%3E%3C%2Fsvg%3E"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "dash_menu-text")}
            tag="div"
          >
            {"Profile Settings"}
          </_Builtin.Block>
        </_Builtin.Link>
        <_Builtin.Block className={_utils.cx(_styles, "spacer-s")} tag="div" />
        <_Builtin.Block
          className={_utils.cx(_styles, "dash_user-wrap")}
          tag="div"
        >
          <_Builtin.Heading
            className={_utils.cx(_styles, "dash_user-name")}
            tag="h5"
          >
            <_Builtin.Span data-ms-member="first-name">
              {"Harriet"}
            </_Builtin.Span>{" "}
            <_Builtin.Span data-ms-member="last-name">{"Tubman"}</_Builtin.Span>
          </_Builtin.Heading>
          <_Builtin.Block
            className={_utils.cx(_styles, "dash_user-email")}
            tag="div"
            data-ms-member="company"
          >
            {"company"}
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
