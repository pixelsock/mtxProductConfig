"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _interactions from "./interactions";
import * as _utils from "./utils";
import _styles from "./SizeSelector.module.css";

const _interactionsData = JSON.parse(
  '{"events":{"e-445":{"id":"e-445","name":"","animationType":"custom","eventTypeId":"MOUSE_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-54","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-446"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"715d71be-c88d-b9be-b4a9-11701db7baae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"715d71be-c88d-b9be-b4a9-11701db7baae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1674064358906},"e-446":{"id":"e-446","name":"","animationType":"custom","eventTypeId":"MOUSE_SECOND_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-55","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-445"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"715d71be-c88d-b9be-b4a9-11701db7baae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"715d71be-c88d-b9be-b4a9-11701db7baae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1674064358913},"e-1087":{"id":"e-1087","name":"","animationType":"preset","eventTypeId":"MOUSE_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-114","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1088"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"652c4a489c1f4e8c41182f08|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"652c4a489c1f4e8c41182f08|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1692750333199},"e-1088":{"id":"e-1088","name":"","animationType":"preset","eventTypeId":"MOUSE_SECOND_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-115","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1087"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"652c4a489c1f4e8c41182f08|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"652c4a489c1f4e8c41182f08|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1692750333199},"e-1245":{"id":"e-1245","name":"","animationType":"preset","eventTypeId":"MOUSE_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-114","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1246"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"653aec216550800452b043e4|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"653aec216550800452b043e4|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698360353649},"e-1246":{"id":"e-1246","name":"","animationType":"preset","eventTypeId":"MOUSE_SECOND_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-115","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1245"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"653aec216550800452b043e4|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"653aec216550800452b043e4|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698360353649},"e-1420":{"id":"e-1420","name":"","animationType":"preset","eventTypeId":"MOUSE_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-114","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1421"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66bf7409713b263adffd3264|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66bf7409713b263adffd3264|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1723823114441},"e-1421":{"id":"e-1421","name":"","animationType":"preset","eventTypeId":"MOUSE_SECOND_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-115","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1420"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66bf7409713b263adffd3264|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66bf7409713b263adffd3264|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1723823114441},"e-1430":{"id":"e-1430","name":"","animationType":"preset","eventTypeId":"MOUSE_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-114","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1431"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66bf78f0f5c358b6964b4920|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66bf78f0f5c358b6964b4920|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1723824369471},"e-1431":{"id":"e-1431","name":"","animationType":"preset","eventTypeId":"MOUSE_SECOND_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-115","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1430"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66bf78f0f5c358b6964b4920|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66bf78f0f5c358b6964b4920|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1723824369471},"e-1452":{"id":"e-1452","name":"","animationType":"preset","eventTypeId":"MOUSE_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-114","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1453"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66bfc8755bdde4989653b982|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66bfc8755bdde4989653b982|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1723844725509},"e-1453":{"id":"e-1453","name":"","animationType":"preset","eventTypeId":"MOUSE_SECOND_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-115","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1452"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66bfc8755bdde4989653b982|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66bfc8755bdde4989653b982|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1723844725509},"e-1462":{"id":"e-1462","name":"","animationType":"preset","eventTypeId":"MOUSE_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-114","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1463"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6764861164e2911f58ea139f|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6764861164e2911f58ea139f|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1734641172458},"e-1463":{"id":"e-1463","name":"","animationType":"preset","eventTypeId":"MOUSE_SECOND_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-115","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1462"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6764861164e2911f58ea139f|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6764861164e2911f58ea139f|99a9e293-64dc-7847-ed11-68db8bf08fed","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1734641172458},"e-1488":{"id":"e-1488","name":"","animationType":"preset","eventTypeId":"MOUSE_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-114","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1489"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"67ad2d9fe38983f8dc6d8698|3c187369-c9c8-94c8-edc4-3ef6474c7a66","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"67ad2d9fe38983f8dc6d8698|3c187369-c9c8-94c8-edc4-3ef6474c7a66","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1739402714980},"e-1489":{"id":"e-1489","name":"","animationType":"preset","eventTypeId":"MOUSE_SECOND_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-115","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1488"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"67ad2d9fe38983f8dc6d8698|3c187369-c9c8-94c8-edc4-3ef6474c7a66","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"67ad2d9fe38983f8dc6d8698|3c187369-c9c8-94c8-edc4-3ef6474c7a66","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1739402714980},"e-1496":{"id":"e-1496","name":"","animationType":"preset","eventTypeId":"MOUSE_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-114","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1497"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"67ad2e35d2fd33776bec09ec|d06309e5-06f3-fb69-1661-beefb7aae879","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"67ad2e35d2fd33776bec09ec|d06309e5-06f3-fb69-1661-beefb7aae879","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1739402814327},"e-1497":{"id":"e-1497","name":"","animationType":"preset","eventTypeId":"MOUSE_SECOND_CLICK","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-115","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1496"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"67ad2e35d2fd33776bec09ec|d06309e5-06f3-fb69-1661-beefb7aae879","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"67ad2e35d2fd33776bec09ec|d06309e5-06f3-fb69-1661-beefb7aae879","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1739402814327}},"actionLists":{"a-54":{"id":"a-54","title":"Toggle Switch","actionItemGroups":[{"actionItems":[{"id":"a-54-n-18","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".toggle-yes-text","selectorGuids":["4de64692-5387-328a-43d6-7cd862f1ccab"]},"value":0,"unit":""}},{"id":"a-54-n-22","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".custom-sizes","selectorGuids":["981c0503-be7b-46db-920d-48fbe7c777c5"]},"value":"none"}}]},{"actionItems":[{"id":"a-54-n","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":130,"target":{"useEventTarget":"CHILDREN","selector":".toggle","selectorGuids":["f834aad5-a8f2-46f1-859d-f317ec317714"]},"xValue":32,"xUnit":"px","yUnit":"PX","zUnit":"PX"}},{"id":"a-54-n-2","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":130,"target":{"useEventTarget":"CHILDREN","selector":".toggle","selectorGuids":["f834aad5-a8f2-46f1-859d-f317ec317714"]},"zValue":-90,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-54-n-3","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":130,"target":{"useEventTarget":"CHILDREN","selector":".top-line","selectorGuids":["7bee293f-d7a2-1dcb-4f4c-43b0e0b5b24e"]},"zValue":36,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-54-n-4","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".top-line","selectorGuids":["7bee293f-d7a2-1dcb-4f4c-43b0e0b5b24e"]},"xValue":null,"yValue":2,"xUnit":"px","yUnit":"px","zUnit":"PX"}},{"id":"a-54-n-5","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".top-line","selectorGuids":["7bee293f-d7a2-1dcb-4f4c-43b0e0b5b24e"]},"widthValue":15,"widthUnit":"px","heightUnit":"PX","locked":false}},{"id":"a-54-n-6","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".bottom-line","selectorGuids":["7bee293f-d7a2-1dcb-4f4c-43b0e0b5b24f"]},"zValue":-45,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-54-n-8","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":130,"target":{"useEventTarget":"CHILDREN","selector":".bottom-line","selectorGuids":["7bee293f-d7a2-1dcb-4f4c-43b0e0b5b24f"]},"widthValue":7,"widthUnit":"px","heightUnit":"PX","locked":false}},{"id":"a-54-n-7","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".bottom-line","selectorGuids":["7bee293f-d7a2-1dcb-4f4c-43b0e0b5b24f"]},"xValue":-5,"yValue":-4,"xUnit":"px","yUnit":"px","zUnit":"PX"}},{"id":"a-54-n-9","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":130,"target":{"useEventTarget":"CHILDREN","selector":".active-overlay","selectorGuids":["7bee293f-d7a2-1dcb-4f4c-43b0e0b5b24d"]},"value":1,"unit":""}},{"id":"a-54-n-19","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".toggle-yes-text","selectorGuids":["4de64692-5387-328a-43d6-7cd862f1ccab"]},"value":1,"unit":""}},{"id":"a-54-n-20","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".standard-sizes","selectorGuids":["2f46b408-c075-1b2f-324d-b3cd827c0423"]},"value":"none"}},{"id":"a-54-n-21","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".custom-sizes","selectorGuids":["981c0503-be7b-46db-920d-48fbe7c777c5"]},"value":"grid"}},{"id":"a-54-n-23","actionTypeId":"STYLE_BORDER","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":true,"id":"652c4a489c1f4e8c41182f13|511079f4-b9f1-cbdb-07a6-a2111ccde8cb"},"globalSwatchId":"150a737e","rValue":234,"bValue":234,"gValue":234,"aValue":1}}]}],"useFirstGroupAsInitialState":true,"createdOn":1674064362999},"a-55":{"id":"a-55","title":"Toggle Switch Off","actionItemGroups":[{"actionItems":[{"id":"a-55-n-3","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":130,"target":{"useEventTarget":"CHILDREN","selector":".toggle","selectorGuids":["f834aad5-a8f2-46f1-859d-f317ec317714"]},"xValue":0,"xUnit":"px","yUnit":"PX","zUnit":"PX"}},{"id":"a-55-n-4","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":130,"target":{"useEventTarget":"CHILDREN","selector":".toggle","selectorGuids":["f834aad5-a8f2-46f1-859d-f317ec317714"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-55-n-5","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":130,"target":{"useEventTarget":"CHILDREN","selector":".top-line","selectorGuids":["7bee293f-d7a2-1dcb-4f4c-43b0e0b5b24e"]},"zValue":45,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-55-n-6","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".top-line","selectorGuids":["7bee293f-d7a2-1dcb-4f4c-43b0e0b5b24e"]},"xValue":null,"yValue":0,"xUnit":"px","yUnit":"px","zUnit":"PX"}},{"id":"a-55-n-7","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".top-line","selectorGuids":["7bee293f-d7a2-1dcb-4f4c-43b0e0b5b24e"]},"widthValue":16,"widthUnit":"px","heightUnit":"PX","locked":false}},{"id":"a-55-n-8","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".bottom-line","selectorGuids":["7bee293f-d7a2-1dcb-4f4c-43b0e0b5b24f"]},"zValue":-45,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-55-n-9","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":130,"target":{"useEventTarget":"CHILDREN","selector":".bottom-line","selectorGuids":["7bee293f-d7a2-1dcb-4f4c-43b0e0b5b24f"]},"widthValue":16,"widthUnit":"px","heightUnit":"PX","locked":false}},{"id":"a-55-n-10","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".bottom-line","selectorGuids":["7bee293f-d7a2-1dcb-4f4c-43b0e0b5b24f"]},"xValue":0,"yValue":0,"xUnit":"px","yUnit":"px","zUnit":"PX"}},{"id":"a-55-n-11","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":130,"target":{"useEventTarget":"CHILDREN","selector":".active-overlay","selectorGuids":["7bee293f-d7a2-1dcb-4f4c-43b0e0b5b24d"]},"value":0,"unit":""}},{"id":"a-55-n-2","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".toggle-yes-text","selectorGuids":["4de64692-5387-328a-43d6-7cd862f1ccab"]},"value":0,"unit":""}},{"id":"a-55-n-13","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".custom-sizes","selectorGuids":["981c0503-be7b-46db-920d-48fbe7c777c5"]},"value":"none"}},{"id":"a-55-n-14","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".standard-sizes","selectorGuids":["2f46b408-c075-1b2f-324d-b3cd827c0423"]},"value":"grid"}},{"id":"a-55-n-15","actionTypeId":"STYLE_BACKGROUND_COLOR","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":true,"id":"652c4a489c1f4e8c41182f13|511079f4-b9f1-cbdb-07a6-a2111ccde8cb"},"globalSwatchId":"","rValue":0,"bValue":0,"gValue":0,"aValue":0}}]}],"useFirstGroupAsInitialState":false,"createdOn":1674064362999},"a-114":{"id":"a-114","title":"Custom Sizes [On]","actionItemGroups":[{"actionItems":[{"id":"a-114-n-5","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".custom-sizes","selectorGuids":["981c0503-be7b-46db-920d-48fbe7c777c5"]},"value":"none"}}]},{"actionItems":[{"id":"a-114-n","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"ease","duration":200,"target":{"useEventTarget":"SIBLINGS","selector":".filters2_toggle-button-circle","selectorGuids":["d7027724-f8b2-0217-3db3-5c7ee4b6f78d"]},"xValue":1,"xUnit":"rem","yUnit":"PX","zUnit":"PX"}},{"id":"a-114-n-2","actionTypeId":"STYLE_BACKGROUND_COLOR","config":{"delay":0,"easing":"ease","duration":0,"target":{"useEventTarget":"SIBLINGS","selector":".filters2_toggle-button-mask","selectorGuids":["d7027724-f8b2-0217-3db3-5c7ee4b6f78a"]},"globalSwatchId":"dccb7db6","rValue":0,"bValue":0,"gValue":0,"aValue":1}},{"id":"a-114-n-3","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".standard-sizes.margin-top.margin-xsmall","selectorGuids":["2f46b408-c075-1b2f-324d-b3cd827c0423","2a5100c7-a86f-029e-28b9-62c05e0895d3","563ec048-12a8-7c3a-b6f6-6b93ff2b98bf"]},"value":"none"}},{"id":"a-114-n-4","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".custom-sizes","selectorGuids":["981c0503-be7b-46db-920d-48fbe7c777c5"]},"value":"grid"}}]}],"useFirstGroupAsInitialState":true,"createdOn":1638537122270},"a-115":{"id":"a-115","title":"Custom Sizes [Off]","actionItemGroups":[{"actionItems":[{"id":"a-115-n","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"ease","duration":200,"target":{"useEventTarget":"SIBLINGS","selector":".filters2_toggle-button-circle","selectorGuids":["d7027724-f8b2-0217-3db3-5c7ee4b6f78d"]},"xValue":0,"xUnit":"rem","yUnit":"PX","zUnit":"PX"}},{"id":"a-115-n-2","actionTypeId":"STYLE_BACKGROUND_COLOR","config":{"delay":0,"easing":"ease","duration":0,"target":{"useEventTarget":"SIBLINGS","selector":".filters2_toggle-button-mask","selectorGuids":["d7027724-f8b2-0217-3db3-5c7ee4b6f78a"]},"globalSwatchId":"","rValue":198,"bValue":198,"gValue":198,"aValue":1}},{"id":"a-115-n-3","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".standard-sizes.margin-top.margin-xsmall","selectorGuids":["2f46b408-c075-1b2f-324d-b3cd827c0423","2a5100c7-a86f-029e-28b9-62c05e0895d3","563ec048-12a8-7c3a-b6f6-6b93ff2b98bf"]},"value":"block"}},{"id":"a-115-n-4","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"selector":".custom-sizes","selectorGuids":["981c0503-be7b-46db-920d-48fbe7c777c5"]},"value":"none"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1638537122270}},"site":{"mediaQueries":[{"key":"main","min":992,"max":10000},{"key":"medium","min":768,"max":991},{"key":"small","min":480,"max":767},{"key":"tiny","min":0,"max":479}]}}'
);

export function SizeSelector({ as: _Component = _Builtin.Block }) {
  _interactions.useInteractions(_interactionsData, _styles);

  return (
    <_Component className={_utils.cx(_styles, "config-form-section")} tag="div">
      <_Builtin.Block
        className={_utils.cx(_styles, "product-header4_option")}
        tag="div"
      >
        <_Builtin.Heading
          className={_utils.cx(_styles, "heading-style-h6")}
          tag="h1"
        >
          {"Size In Inches"}
        </_Builtin.Heading>
        <_Builtin.Link
          className={_utils.cx(_styles, "learn-more-link")}
          button={false}
          fs-modal-element="open-8"
          fs-scrolldisable-element="disable"
          block=""
          options={{
            href: "#",
          }}
        >
          {"Learn More"}
        </_Builtin.Link>
      </_Builtin.Block>
      <_Builtin.Grid
        className={_utils.cx(_styles, "grid-options", "less-top")}
        tag="div"
        id="size-grid"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "toggle-switch-wrapper")}
          id={_utils.cx(
            _styles,
            "w-node-_715d71be-c88d-b9be-b4a9-11701db7baaa-1db7baa3"
          )}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "field-label")}
            tag="div"
          >
            {"Choose A Custom Size?"}
          </_Builtin.Block>
          <_Builtin.FormCheckboxWrapper
            className={_utils.cx(_styles, "toggle-wrap")}
          >
            <_Builtin.FormCheckboxInput
              className={_utils.cx(_styles, "toggle-ticker")}
              data-w-id="715d71be-c88d-b9be-b4a9-11701db7baae"
              macro={{
                guid: "75f2beb5-163a-f973-fedc-b167f121f145",
              }}
              type="checkbox"
              name="Toggle-Switch-2"
              data-name="Toggle Switch 2"
              required={false}
              checked={false}
              data-ix="toggle-switch"
              id="Toggle-Switch"
              form={{
                type: "checkbox-input",
                name: "Toggle Switch 2",
              }}
              inputType="default"
            />
            <_Builtin.FormInlineLabel
              className={_utils.cx(_styles, "toggle-label")}
              htmlFor="Toggle-Switch-2"
            />
            <_Builtin.Block
              className={_utils.cx(_styles, "toggle-yes-text")}
              tag="div"
            >
              {"Yes"}
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cx(_styles, "toggle-no-text")}
              tag="div"
            >
              {"No"}
            </_Builtin.Block>
            <_Builtin.Block className={_utils.cx(_styles, "toggle")} tag="div">
              <_Builtin.Block
                className={_utils.cx(_styles, "toggle-active")}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "active-overlay")}
                  tag="div"
                />
                <_Builtin.Block
                  className={_utils.cx(_styles, "top-line")}
                  tag="div"
                />
                <_Builtin.Block
                  className={_utils.cx(_styles, "bottom-line")}
                  tag="div"
                />
              </_Builtin.Block>
            </_Builtin.Block>
          </_Builtin.FormCheckboxWrapper>
        </_Builtin.Block>
        <_Builtin.Block
          className={_utils.cx(_styles, "custom-sizes")}
          id={_utils.cx(
            _styles,
            "w-node-_715d71be-c88d-b9be-b4a9-11701db7bab9-1db7baa3"
          )}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(
              _styles,
              "custom-size-wrapper",
              "field-label",
              "no-margin"
            )}
            id={_utils.cx(
              _styles,
              "w-node-_715d71be-c88d-b9be-b4a9-11701db7baba-1db7baa3"
            )}
            tag="div"
          >
            {"*Custom Sizes Can Be Specified To The Quarter Inch"}
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "custom-size-wrapper")}
            id={_utils.cx(
              _styles,
              "w-node-_715d71be-c88d-b9be-b4a9-11701db7babc-1db7baa3"
            )}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "field-label")}
              tag="div"
            >
              {"Height"}
            </_Builtin.Block>
            <_Builtin.FormTextInput
              className={_utils.cx(
                _styles,
                "w-node-_715d71be-c88d-b9be-b4a9-11701db7babf-1db7baa3"
              )}
              id={_utils.cx(_styles, "height")}
              autoFocus={false}
              maxLength={256}
              name="height-2"
              data-name="Height 2"
              placeholder="32.25"
              type="text"
              disabled={false}
              required={false}
            />
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "custom-size-wrapper")}
            id={_utils.cx(
              _styles,
              "w-node-_715d71be-c88d-b9be-b4a9-11701db7bac0-1db7baa3"
            )}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "field-label")}
              tag="div"
            >
              {"Width"}
            </_Builtin.Block>
            <_Builtin.FormTextInput
              autoFocus={false}
              maxLength={256}
              name="width-2"
              data-name="Width 2"
              placeholder="52.5"
              type="text"
              disabled={false}
              required={false}
              id="width"
            />
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "custom-size-wrapper")}
            id={_utils.cx(
              _styles,
              "w-node-_715d71be-c88d-b9be-b4a9-11701db7bac4-1db7baa3"
            )}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "field-label")}
              tag="div"
            >
              {"Diameter"}
            </_Builtin.Block>
            <_Builtin.FormTextInput
              autoFocus={false}
              maxLength={256}
              name="diameter-2"
              data-name="Diameter 2"
              placeholder="32.25"
              type="text"
              disabled={false}
              required={false}
              id="diameter"
            />
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "quantity-wrapper")}
            id={_utils.cx(
              _styles,
              "w-node-_715d71be-c88d-b9be-b4a9-11701db7bac8-1db7baa3"
            )}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "field-label")}
              tag="div"
            >
              {"Quantity"}
            </_Builtin.Block>
            <_Builtin.FormTextInput
              className={_utils.cx(_styles, "quantity")}
              autoFocus={false}
              maxLength={256}
              name="Modern-quantity"
              data-name="Modern quantity"
              type="number"
              disabled={false}
              required={false}
              fs-mirrorinput-element="target-15"
              id="quantity"
            />
          </_Builtin.Block>
        </_Builtin.Block>
        <_Builtin.Block
          className={_utils.cx(
            _styles,
            "standard-sizes",
            "w-node-_715d71be-c88d-b9be-b4a9-11701db7bacc-1db7baa3"
          )}
          id={_utils.cx(_styles, "standard-sizes")}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "standard-size-wrapper")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "field-label")}
              tag="div"
            >
              {"Standard Diameter"}
            </_Builtin.Block>
            <_Builtin.FormSelect
              name="Standard-Diameter"
              data-name="Standard Diameter"
              required={true}
              multiple={false}
              fs-mirrorinput-element="trigger"
              id="standard-round-sizes"
              options={[
                {
                  t: '32" Diameter',
                  v: "0032",
                },
                {
                  t: '36" Diameter',
                  v: "0036",
                },
              ]}
            />
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "standard-size-wrapper")}
            id={_utils.cx(
              _styles,
              "w-node-_715d71be-c88d-b9be-b4a9-11701db7bad1-1db7baa3"
            )}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "field-label")}
              tag="div"
            >
              {"Standard Sizes"}
            </_Builtin.Block>
            <_Builtin.FormSelect
              name="Standard-Sizes"
              data-name="Standard Sizes"
              required={true}
              multiple={false}
              id="field"
              options={[
                {
                  t: '18"x36"',
                  v: "1836",
                },
                {
                  t: '24"x36"',
                  v: "2436",
                },
                {
                  t: '24"x48"',
                  v: "2448",
                },
                {
                  t: '24"x60"',
                  v: "2460",
                },
                {
                  t: '30"x42"',
                  v: "3042",
                },
                {
                  t: '30"x70"',
                  v: "3070",
                },
                {
                  t: '36"x42"',
                  v: "3642",
                },
                {
                  t: '36"x48"',
                  v: "3648",
                },
                {
                  t: '36"x60"',
                  v: "3660",
                },
                {
                  t: '42"x60"',
                  v: "4260",
                },
              ]}
            />
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "quantity-wrapper")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "field-label")}
              tag="div"
            >
              {"Quantity"}
            </_Builtin.Block>
            <_Builtin.FormTextInput
              className={_utils.cx(_styles, "quantity")}
              autoFocus={false}
              maxLength={256}
              name="Modern-quantity"
              data-name="Modern quantity"
              type="number"
              disabled={false}
              required={false}
              fs-mirrorinput-element="trigger-15"
              id="quantity-standard"
            />
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Grid>
    </_Component>
  );
}
