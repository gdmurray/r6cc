export const ROUTES = {
    LOGIN: "/login",
    MAPLIST: "/maps",
    MAPVIEW: "/map/:id",
    ADMIN: "/admin",
};

export const MODE = {
    EDITOR: 0,
    VIEWER: 1,
};

export const KEYCODES = {
    ENTER: 13,
    ARROW_UP: 38,
    ARROW_DOWN: 40,
};

export const TOOLS = {
    RECTANGLE: 0,
    POLYGON: 1,
    FOCAL: 2,
    TRANSFORM: 3,
    POINT_TRANSFORM: 4,
    EDIT: 5,
};

export const HOTSPOTS = {
    RECTANGLE: "rect",
    POLYGON: "poly",
};

export const EDIT_CALLOUTS_EVENT = {
    CANCEL: "CANCEL",
    SAVE: "SAVE",
    DELETE: "DELETE",
};

export const MAP_WIDTH = 2560;
export const MAP_HEIGHT = 1440;

export const ORDER_OPTIONS = [
    { key: "-1", text: "-1", value: -1 },
    { key: "0", text: "0", value: 0 },
    { key: "1", text: "1", value: 1 },
    { key: "2", text: "2", value: 2 },
    { key: "3", text: "3", value: 3 },
    { key: "4", text: "4", value: 4 },
    { key: "5", text: "5", value: 5 },
    { key: "6", text: "6", value: 6 },
    { key: "7", text: "7", value: 7 },
    { key: "8", text: "8", value: 8 },
    { key: "9", text: "9", value: 9 },
    { key: "10", text: "10", value: 10 },
];

export const DEFAULT_ZOOM_WIDTH = 1600;
export const DEFAULT_ZOOM_HEIGHT = 812;

export const MENU_HEIGHT = 64;

export const SNAP_TOLERANCE = 2;
