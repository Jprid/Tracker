export class API_CONSTANTS {
    static readonly API_BASE_URL = "http://localhost:5000/api";
    static readonly REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    static readonly ACCESS_TOKEN_COOKIE_NAME = "accessToken";
    static readonly MEDICINE_URL = "/medicine";
    static readonly ENTRIES_URL = "/entries";
}

export class UI_CONSTANTS {
    static readonly CONTEXT_MENU_WIDTH = 180;
    static readonly CONTEXT_MENU_HEIGHT = 44;
    static readonly CONTEXT_MENU_OFFSET = 8;
    static readonly MIN_MENU_POSITION = 8;
}

export const EntryTerminalConstants = {
    addCommandUsageText: "add <medication> <dose>",
    addEntryCommandUsageText: "add entry <text> [complete]",
    newDayCommandUsageText: "new day [<save>]",
    saveCommandUsageText: "save <medium>",
    timeTransform: () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
    isAddMedicineCommand: (parts: string[]) => parts[0].toLowerCase() === 'add' && parts.length >= 3 && parts[1]?.toLowerCase() !== 'entry',
    isAddEntryCommand: (parts: string[]) => parts[0].toLowerCase() === 'add' && parts[1]?.toLowerCase() === 'entry' && parts.length >= 3,
    isNewCommand: (parts: string[]) => parts[0].toLowerCase() === 'new',
    isSaveCommand: (parts: string[]) => parts[0].toLowerCase() === 'save',
    isUpdateCommand: (parts: string[]) => parts[0].toLowerCase() === 'update',
};
