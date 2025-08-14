import {Component, JSX} from "react";
import type {EntryTerminalProps} from "../interfaces.ts";

class EntryTerminalConstants {
    public static addCommandUsageText: string = "add <substance> <dose>";
    public static newDayCommandUsageText: string = "new day [<save>]";
    public static saveCommandUsageText: string = "save <medium>";
    public static timeTransform: () => string = () => new Date().toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
    public static  isAddCommand = (parts: string[]) =>
        parts[0].toLowerCase() === 'add' && parts.length >= 3;

    public static isNewCommand = (parts: string[]) => parts[0].toLowerCase() === 'new';
    public static isSaveCommand = (parts: string[]) => parts[0].toLowerCase() === 'save';
}
class EntryTerminal extends Component<EntryTerminalProps, object> {
    private commandInput: HTMLInputElement | null = null;

    private commands: string[] = [
        EntryTerminalConstants.addCommandUsageText,
        EntryTerminalConstants.newDayCommandUsageText,
        EntryTerminalConstants.saveCommandUsageText,
    ];

    private handleSubmit = (): void => {
        if (this.commandInput?.value) {
            const input = this.commandInput.value.trim();
            const parts = input.split(/\s+/);

            if (EntryTerminalConstants.isAddCommand(parts)) {
                this.addEntry(parts);
            } else if (EntryTerminalConstants.isNewCommand(parts)) {
                console.log(parts);
                this.props.onClear();
            } else if (EntryTerminalConstants.isSaveCommand(parts)) {
                this.props.onSave(parts[1]);
            }
        }
    };

    private addEntry(parts: string[]) {
        const time = EntryTerminalConstants.timeTransform();
        const substance = parts[1];
        const dose = parseFloat(parts[2]);
        const notes = parts.slice(3).join(' ');
        if (!isNaN(dose)) {
            this.props.onAdd({time, substance, dose, notes});
            this.commandInput!.value = '';
        }
    }

    render(): JSX.Element {
        return (
            <div className="mb-4 w-full p-3 bg-gray-50 rounded">
                <h4 className="font-medium mb-2">Add Entry (Terminal)</h4>
                <div className="w-full">
                    {this.commands.map((cmd: string) => <p>{cmd}</p>)}
                </div>
                <div className="d-flex flex-row">
                    <input
                        // @ts-ignore
                        ref={(r) => (this.commandInput = r)}
                        placeholder="add substance dose notes..."
                        className="d-flex mg-sm pd-sm border flex-fill"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') this.handleSubmit();
                        }}
                    />
                </div>
            </div>
        );
    }

}

export {EntryTerminal};