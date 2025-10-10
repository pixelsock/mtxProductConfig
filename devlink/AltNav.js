"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _interactions from "./interactions";
import * as _utils from "./utils";
import _styles from "./AltNav.module.css";

const _interactionsData = JSON.parse(
  '{"events":{"e-439":{"id":"e-439","name":"","animationType":"preset","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-48","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1415"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"73bdc508-9639-2031-87e9-06ce79b4bb71","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"73bdc508-9639-2031-87e9-06ce79b4bb71","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1643147930078},"e-440":{"id":"e-440","name":"","animationType":"preset","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-49","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1432"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"73bdc508-9639-2031-87e9-06ce79b4bb71","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"73bdc508-9639-2031-87e9-06ce79b4bb71","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1643147930078},"e-1290":{"id":"e-1290","name":"","animationType":"preset","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-198","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1291"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"3c2f2722-e3c7-6f05-8576-623a08bbae4c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"3c2f2722-e3c7-6f05-8576-623a08bbae4c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1709227368141},"e-1291":{"id":"e-1291","name":"","animationType":"preset","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-199","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1290"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"3c2f2722-e3c7-6f05-8576-623a08bbae4c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"3c2f2722-e3c7-6f05-8576-623a08bbae4c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1709227368141},"e-1390":{"id":"e-1390","name":"","animationType":"custom","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-227","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1473"}},"mediaQueries":["main"],"target":{"id":"0435940c-f175-e9f6-3035-78f1013facc4","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"0435940c-f175-e9f6-3035-78f1013facc4","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1653380561820},"e-1391":{"id":"e-1391","name":"","animationType":"custom","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-228","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1472"}},"mediaQueries":["main"],"target":{"id":"0435940c-f175-e9f6-3035-78f1013facc4","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"0435940c-f175-e9f6-3035-78f1013facc4","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1653380561834},"e-1392":{"id":"e-1392","name":"","animationType":"custom","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-229","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1475"}},"mediaQueries":["medium","small","tiny"],"target":{"id":"0435940c-f175-e9f6-3035-78f1013facc4","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"0435940c-f175-e9f6-3035-78f1013facc4","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1653380616175},"e-1393":{"id":"e-1393","name":"","animationType":"custom","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-230","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1474"}},"mediaQueries":["medium","small","tiny"],"target":{"id":"0435940c-f175-e9f6-3035-78f1013facc4","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"0435940c-f175-e9f6-3035-78f1013facc4","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1653380616183},"e-1404":{"id":"e-1404","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-229","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1405"}},"mediaQueries":["medium","small","tiny"],"target":{"id":"652c4a489c1f4e8c41182fb1|2507236b-5e8a-fb13-a8d5-53fc0423040b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"652c4a489c1f4e8c41182fb1|2507236b-5e8a-fb13-a8d5-53fc0423040b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716485482046},"e-1405":{"id":"e-1405","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-230","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1404"}},"mediaQueries":["medium","small","tiny"],"target":{"id":"652c4a489c1f4e8c41182fb1|2507236b-5e8a-fb13-a8d5-53fc0423040b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"652c4a489c1f4e8c41182fb1|2507236b-5e8a-fb13-a8d5-53fc0423040b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716485482046},"e-1406":{"id":"e-1406","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-227","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1407"}},"mediaQueries":["main"],"target":{"id":"652c4a489c1f4e8c41182fb1|2507236b-5e8a-fb13-a8d5-53fc0423040b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"652c4a489c1f4e8c41182fb1|2507236b-5e8a-fb13-a8d5-53fc0423040b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716485482046},"e-1407":{"id":"e-1407","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-228","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1406"}},"mediaQueries":["main"],"target":{"id":"652c4a489c1f4e8c41182fb1|2507236b-5e8a-fb13-a8d5-53fc0423040b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"652c4a489c1f4e8c41182fb1|2507236b-5e8a-fb13-a8d5-53fc0423040b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716485482046},"e-1472":{"id":"e-1472","name":"","animationType":"custom","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-227","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1473"}},"mediaQueries":["main"],"target":{"id":"67817713d1a1923daf39bb12|aeb8312d-a4e2-43d5-9c0c-26efbc287dd7","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"67817713d1a1923daf39bb12|aeb8312d-a4e2-43d5-9c0c-26efbc287dd7","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1653380561820},"e-1473":{"id":"e-1473","name":"","animationType":"custom","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-228","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1472"}},"mediaQueries":["main"],"target":{"id":"67817713d1a1923daf39bb12|aeb8312d-a4e2-43d5-9c0c-26efbc287dd7","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"67817713d1a1923daf39bb12|aeb8312d-a4e2-43d5-9c0c-26efbc287dd7","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1653380561834},"e-1474":{"id":"e-1474","name":"","animationType":"custom","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-229","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1475"}},"mediaQueries":["medium","small","tiny"],"target":{"id":"67817713d1a1923daf39bb12|aeb8312d-a4e2-43d5-9c0c-26efbc287dd7","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"67817713d1a1923daf39bb12|aeb8312d-a4e2-43d5-9c0c-26efbc287dd7","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1653380616175},"e-1475":{"id":"e-1475","name":"","animationType":"custom","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-230","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1474"}},"mediaQueries":["medium","small","tiny"],"target":{"id":"67817713d1a1923daf39bb12|aeb8312d-a4e2-43d5-9c0c-26efbc287dd7","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"67817713d1a1923daf39bb12|aeb8312d-a4e2-43d5-9c0c-26efbc287dd7","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1653380616183},"e-1480":{"id":"e-1480","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-227","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1481"}},"mediaQueries":["main"],"target":{"id":"652c4a489c1f4e8c41182fb1|d6cd28fe-7df9-e5c9-e8fe-cafdfe248b0c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"652c4a489c1f4e8c41182fb1|d6cd28fe-7df9-e5c9-e8fe-cafdfe248b0c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1736539997321},"e-1481":{"id":"e-1481","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-228","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1480"}},"mediaQueries":["main"],"target":{"id":"652c4a489c1f4e8c41182fb1|d6cd28fe-7df9-e5c9-e8fe-cafdfe248b0c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"652c4a489c1f4e8c41182fb1|d6cd28fe-7df9-e5c9-e8fe-cafdfe248b0c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1736539997321},"e-1482":{"id":"e-1482","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-229","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1483"}},"mediaQueries":["medium","small","tiny"],"target":{"id":"652c4a489c1f4e8c41182fb1|d6cd28fe-7df9-e5c9-e8fe-cafdfe248b0c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"652c4a489c1f4e8c41182fb1|d6cd28fe-7df9-e5c9-e8fe-cafdfe248b0c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1736539997321},"e-1483":{"id":"e-1483","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-230","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-1482"}},"mediaQueries":["medium","small","tiny"],"target":{"id":"652c4a489c1f4e8c41182fb1|d6cd28fe-7df9-e5c9-e8fe-cafdfe248b0c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"652c4a489c1f4e8c41182fb1|d6cd28fe-7df9-e5c9-e8fe-cafdfe248b0c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1736539997321}},"actionLists":{"a-48":{"id":"a-48","title":"Navbar 10 [Open Menu]","actionItemGroups":[{"actionItems":[{"id":"a-48-n","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"inOutQuint","duration":200,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-middle","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f5"]},"widthValue":0,"widthUnit":"px","heightUnit":"PX","locked":false}},{"id":"a-48-n-2","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-bottom","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f7"]},"yValue":-8,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-48-n-3","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-top","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f4"]},"yValue":8,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-48-n-4","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-top","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f4"]},"zValue":-45,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-48-n-5","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-bottom","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f7"]},"zValue":45,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1626168378054},"a-49":{"id":"a-49","title":"Navbar 10 [Close Menu]","actionItemGroups":[{"actionItems":[{"id":"a-49-n","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-bottom","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f7"]},"yValue":0,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-49-n-2","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-top","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f4"]},"yValue":0,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-49-n-3","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-bottom","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f7"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-49-n-4","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-top","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f4"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-49-n-5","actionTypeId":"STYLE_SIZE","config":{"delay":400,"easing":"inOutQuint","duration":200,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-middle","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f5"]},"widthValue":24,"widthUnit":"px","heightUnit":"PX","locked":false}}]}],"useFirstGroupAsInitialState":false,"createdOn":1626168766736},"a-198":{"id":"a-198","title":"Navbar 10 [Open Menu] 2","actionItemGroups":[{"actionItems":[{"id":"a-198-n","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"inOutQuint","duration":200,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-middle","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f5"]},"widthValue":0,"widthUnit":"px","heightUnit":"PX","locked":false}},{"id":"a-198-n-2","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-bottom","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f7"]},"yValue":-8,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-198-n-3","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-top","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f4"]},"yValue":8,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-198-n-4","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-top","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f4"]},"zValue":-45,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-198-n-5","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-bottom","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f7"]},"zValue":45,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1626168378054},"a-199":{"id":"a-199","title":"Navbar 10 [Close Menu] 2","actionItemGroups":[{"actionItems":[{"id":"a-199-n","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-bottom","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f7"]},"yValue":0,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-199-n-2","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-top","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f4"]},"yValue":0,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-199-n-3","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-bottom","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f7"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-199-n-4","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-top","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f4"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-199-n-5","actionTypeId":"STYLE_SIZE","config":{"delay":400,"easing":"inOutQuint","duration":200,"target":{"useEventTarget":"CHILDREN","selector":".menu-icon_line-middle","selectorGuids":["3283fdd3-a246-cd2e-f1c5-dd5d593a63f5"]},"widthValue":24,"widthUnit":"px","heightUnit":"PX","locked":false}}]}],"useFirstGroupAsInitialState":false,"createdOn":1626168766736},"a-227":{"id":"a-227","title":"Navbar 1 dropdown [Open] [Desktop]","actionItemGroups":[{"actionItems":[{"id":"a-227-n","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".navbar1_dropdown-list","selectorGuids":["ea5e7bd4-4f90-81b3-5477-63baf87d5011"]},"yValue":3,"xUnit":"PX","yUnit":"rem","zUnit":"PX"}},{"id":"a-227-n-2","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".navbar1_dropdown-list","selectorGuids":["ea5e7bd4-4f90-81b3-5477-63baf87d5011"]},"value":0,"unit":""}}]},{"actionItems":[{"id":"a-227-n-3","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"ease","duration":300,"target":{"useEventTarget":"CHILDREN","selector":".navbar1_dropdown-list","selectorGuids":["ea5e7bd4-4f90-81b3-5477-63baf87d5011"]},"yValue":0,"xUnit":"PX","yUnit":"rem","zUnit":"PX"}},{"id":"a-227-n-4","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"ease","duration":200,"target":{"useEventTarget":"CHILDREN","selector":".navbar1_dropdown-list","selectorGuids":["ea5e7bd4-4f90-81b3-5477-63baf87d5011"]},"value":1,"unit":""}},{"id":"a-227-n-5","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"ease","duration":300,"target":{"useEventTarget":"CHILDREN","selector":".dropdown-chevron","selectorGuids":["9968b8e5-fbcd-c5a5-b2ea-0f12ff4d30fb"]},"zValue":180,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":true,"createdOn":1626241970095},"a-228":{"id":"a-228","title":"Navbar 1 dropdown [Close] [Desktop]","actionItemGroups":[{"actionItems":[{"id":"a-228-n","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"ease","duration":200,"target":{"useEventTarget":"CHILDREN","selector":".navbar1_dropdown-list","selectorGuids":["ea5e7bd4-4f90-81b3-5477-63baf87d5011"]},"value":0,"unit":""}},{"id":"a-228-n-2","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"ease","duration":300,"target":{"useEventTarget":"CHILDREN","selector":".dropdown-chevron","selectorGuids":["9968b8e5-fbcd-c5a5-b2ea-0f12ff4d30fb"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]},{"actionItems":[{"id":"a-228-n-3","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"ease","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".navbar1_dropdown-list","selectorGuids":["ea5e7bd4-4f90-81b3-5477-63baf87d5011"]},"yValue":4,"xUnit":"PX","yUnit":"rem","zUnit":"PX"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1626241970095},"a-229":{"id":"a-229","title":"Navbar 1 dropdown [Open] [Tablet]","actionItemGroups":[{"actionItems":[{"id":"a-229-n","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".navbar1_dropdown-list","selectorGuids":["ea5e7bd4-4f90-81b3-5477-63baf87d5011"]},"heightValue":0,"widthUnit":"px","heightUnit":"px","locked":false}}]},{"actionItems":[{"id":"a-229-n-2","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"ease","duration":300,"target":{"useEventTarget":"CHILDREN","selector":".navbar1_dropdown-list","selectorGuids":["ea5e7bd4-4f90-81b3-5477-63baf87d5011"]},"widthUnit":"PX","heightUnit":"AUTO","locked":false}},{"id":"a-229-n-3","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"ease","duration":300,"target":{"useEventTarget":"CHILDREN","selector":".dropdown-chevron","selectorGuids":["9968b8e5-fbcd-c5a5-b2ea-0f12ff4d30fb"]},"zValue":180,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":true,"createdOn":1626241970095},"a-230":{"id":"a-230","title":"Navbar 1 dropdown [Close] [Tablet]","actionItemGroups":[{"actionItems":[{"id":"a-230-n","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"ease","duration":200,"target":{"useEventTarget":"CHILDREN","selector":".navbar1_dropdown-list","selectorGuids":["ea5e7bd4-4f90-81b3-5477-63baf87d5011"]},"heightValue":0,"widthUnit":"PX","heightUnit":"px","locked":false}},{"id":"a-230-n-2","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"ease","duration":300,"target":{"useEventTarget":"CHILDREN","selector":".dropdown-chevron","selectorGuids":["9968b8e5-fbcd-c5a5-b2ea-0f12ff4d30fb"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1626241970095}},"site":{"mediaQueries":[{"key":"main","min":992,"max":10000},{"key":"medium","min":768,"max":991},{"key":"small","min":480,"max":767},{"key":"tiny","min":0,"max":479}]}}'
);

export function AltNav({ as: _Component = _Builtin.NavbarWrapper }) {
  _interactions.useInteractions(_interactionsData, _styles);

  return (
    <_Component
      className={_utils.cx(_styles, "navbar10_component")}
      data-w-id="73bdc508-9639-2031-87e9-06ce79b4bb71"
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
        <_Builtin.NavbarMenu
          className={_utils.cx(_styles, "navbar10_menu")}
          tag="nav"
          role="navigation"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "navbar10_menu-left")}
            tag="div"
          >
            <_Builtin.NavbarLink
              className={_utils.cx(_styles, "navbar10_link")}
              options={{
                href: "#",
                preload: "prefetch",
              }}
            >
              {"About US"}
            </_Builtin.NavbarLink>
            <_Builtin.DropdownWrapper
              className={_utils.cx(_styles, "navbar1_menu-dropdown")}
              data-w-id="d6cd28fe-7df9-e5c9-e8fe-cafdfe248b0c"
              tag="div"
              blocks-name="navbar1_menu-dropdown"
              delay="200"
              hover={false}
            >
              <_Builtin.DropdownToggle
                className={_utils.cx(_styles, "navbar10_link")}
                tag="div"
              >
                <_Builtin.Block tag="div">{"Our Products"}</_Builtin.Block>
              </_Builtin.DropdownToggle>
              <_Builtin.DropdownList
                className={_utils.cx(_styles, "navbar1_dropdown-list")}
                tag="nav"
              >
                <_Builtin.NavbarLink
                  className={_utils.cx(_styles, "navbar10_link-dropdown")}
                  options={{
                    href: "#",
                  }}
                >
                  {"View All"}
                </_Builtin.NavbarLink>
                <_Builtin.NotSupported _atom="DynamoWrapper" />
              </_Builtin.DropdownList>
            </_Builtin.DropdownWrapper>
            <_Builtin.NavbarLink
              className={_utils.cx(_styles, "navbar10_link")}
              options={{
                href: "#",
                preload: "prefetch",
              }}
            >
              {"M-Series"}
            </_Builtin.NavbarLink>
            <_Builtin.NavbarLink
              className={_utils.cx(_styles, "navbar10_link")}
              options={{
                href: "#",
              }}
            >
              {"Find Reps & Showrooms"}
            </_Builtin.NavbarLink>
            <_Builtin.NavbarLink
              className={_utils.cx(_styles, "navbar10_link")}
              options={{
                href: "#",
                preload: "prefetch",
              }}
            >
              {"Gallery"}
            </_Builtin.NavbarLink>
            <_Builtin.Link
              className={_utils.cx(
                _styles,
                "button",
                "is-downloadable",
                "show-on-mobile"
              )}
              id={_utils.cx(
                _styles,
                "w-node-_23cc1799-ed22-503a-b531-0e426bcb12ef-79b4bb71"
              )}
              button={true}
              block=""
              options={{
                href: "#",
              }}
            >
              {"Contact"}
            </_Builtin.Link>
            <_Builtin.Link
              className={_utils.cx(
                _styles,
                "button",
                "is-downloadable",
                "show-on-mobile",
                "is-logout"
              )}
              id={_utils.cx(
                _styles,
                "w-node-a65dc311-4439-8948-33c1-6ea2f354ab77-79b4bb71"
              )}
              button={true}
              data-ms-action="logout"
              block=""
              options={{
                href: "#",
              }}
            >
              {"Log Out"}
            </_Builtin.Link>
          </_Builtin.Block>
        </_Builtin.NavbarMenu>
        <_Builtin.Block
          className={_utils.cx(_styles, "navbar10_menu-right", "mobile")}
          tag="div"
        >
          <_Builtin.DropdownWrapper
            className={_utils.cx(_styles, "navbar1_menu-dropdown")}
            data-w-id="0435940c-f175-e9f6-3035-78f1013facc4"
            tag="div"
            blocks-name="navbar1_menu-dropdown"
            delay="200"
            hover={false}
          >
            <_Builtin.DropdownToggle
              className={_utils.cx(_styles, "button-configure")}
              tag="div"
              data-ms-content="!members"
            >
              <_Builtin.Block tag="div">{"Request A Quote"}</_Builtin.Block>
            </_Builtin.DropdownToggle>
            <_Builtin.DropdownList
              className={_utils.cx(_styles, "navbar1_dropdown-list")}
              tag="nav"
            >
              <_Builtin.NotSupported _atom="DynamoWrapper" />
            </_Builtin.DropdownList>
          </_Builtin.DropdownWrapper>
          <_Builtin.Link
            className={_utils.cx(
              _styles,
              "button",
              "is-secondary",
              "is-small",
              "hide-mobile-portrait"
            )}
            button={true}
            block=""
            options={{
              href: "#",
              preload: "prefetch",
            }}
          >
            {"Contact"}
          </_Builtin.Link>
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
          <_Builtin.NavbarButton
            className={_utils.cx(_styles, "navbar10_menu-button")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "menu-icon")}
              tag="div"
            >
              <_Builtin.Block
                className={_utils.cx(_styles, "menu-icon_line-top")}
                tag="div"
              />
              <_Builtin.Block
                className={_utils.cx(_styles, "menu-icon_line-middle")}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "menu-icon_line-middle-inner")}
                  tag="div"
                />
              </_Builtin.Block>
              <_Builtin.Block
                className={_utils.cx(_styles, "menu-icon_line-bottom")}
                tag="div"
              />
            </_Builtin.Block>
          </_Builtin.NavbarButton>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
