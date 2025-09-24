import {useRef, type JSX, forwardRef, useImperativeHandle, useState, useEffect} from "react";
import type {EntryTerminalProps} from "../../types/interfaces.ts";
import './EntryTerminal.css';
import { useToast } from "../../hooks/useToast.ts";
import { EntryTerminalConstants } from "../../utils/constants.ts";

const EntryTerminal = forwardRef<{ focusInput: () => void; expandTerminal: () => void; collapseTerminal: () => void }, EntryTerminalProps>(function EntryTerminal(props: EntryTerminalProps, ref: React.Ref<{ focusInput: () => void; expandTerminal: () => void; collapseTerminal: () => void }>): JSX.Element {
    const commandInput = useRef<HTMLInputElement | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const toast = useToast();

    // Expose focus and expansion methods to parent components
    useImperativeHandle(ref, () => ({
        focusInput: () => {
            if (commandInput.current) {
                commandInput.current.focus();
            }
        },
        expandTerminal: () => {
            setIsExpanded(true);
        },
        collapseTerminal: () => {
            setIsExpanded(false);
        }
    }), []);

    // Handle clicks outside to collapse terminal
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isExpanded && commandInput.current && !commandInput.current.contains(event.target as Node)) {
                const terminalElement = commandInput.current.closest('.command-container');
                if (terminalElement && !terminalElement.contains(event.target as Node)) {
                    setIsExpanded(false);
                }
            }
        };

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    const commands: string[] = [
        EntryTerminalConstants.addCommandUsageText,
        EntryTerminalConstants.addEntryCommandUsageText
    ];

    const addMedicine = (parts: string[]) => {
        const substance = parts[1];
        const dose = parseInt(parts[2]);
        if (isNaN(dose)) {
            toast.error("Invalid dose", "Dose must be a number");
            return;
        }
        if (!substance) {
            toast.error("Invalid substance", "Must provide a substance name");
            return;
        }
        props.onAddMedicine({ name: substance, dose });
        if (commandInput.current) {
            commandInput.current.value = '';
        }
    };

    const addHabitEntry = (parts: string[]) => {
        const textParts = parts.slice(2);
        const lastPart = textParts[textParts.length - 1]?.toLowerCase();
        const completed = lastPart === 'complete';
        const text = completed ? textParts.slice(0, -1).join(' ') : textParts.join(' ');
        if (!text.trim()) {
            toast.error("Invalid entry", "Must provide entry text");
            return;
        }
        if (props.onAddEntry) {
            props.onAddEntry({ text, completed });
        } else {
            toast.error("Not supported", "Adding entries is not supported in this mode");
            return;
        }
        if (commandInput.current) {
            commandInput.current.value = '';
        }
    };

    const commandHandlers: { [key: string]: (parts: string[]) => void } = {
        add: (parts: string[]) => {
            if (EntryTerminalConstants.isAddMedicineCommand(parts)) {
                addMedicine(parts);
            } else if (EntryTerminalConstants.isAddEntryCommand(parts)) {
                addHabitEntry(parts);
            } else {
                toast.error("Invalid command", "Use 'add <substance> <dose>' or 'add entry <text> [complete]'");
            }
        },
        // update: updateEntry, // Not implemented
        // save: saveEntry, // Not implemented
    };

    const handleInputClick = () => {
        if (!isExpanded) {
            setIsExpanded(true);
        }
    };

    const handleSubmit = (): void => {
        if (commandInput.current?.value) {
            const input = commandInput.current.value.trim();
            const parts = input.split(/\s+/);
            const command = parts[0].toLowerCase();

            if (commandHandlers[command]) {
                commandHandlers[command](parts);
            } else {
                toast.error("Unknown command", `Command "${command}" is not recognized`);
            }
        }
    };

    return (
        <div className={`w-full command-container ${isExpanded ? 'expanded' : ''}`}>
            <div className="console-label">console</div>
            <div className="d-flex flex-row w-full">
                <form className="console-input" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <input
                        ref={commandInput}
                        placeholder="input command"
                        className="w-full d-flex mg-sm pd-sm border flex-fill"
                        aria-describedby="command-instructions"
                        onClick={handleInputClick}
                    />
                </form>
            </div>
            <div className="w-full command-display">
                <h3>Commands</h3>
                <div id="command-instructions">
                    {commands.map((cmd: string, index: number) => <p key={index} className="command-text">{cmd}</p>)}
                </div>
            </div>
        </div>
    );
});

export {EntryTerminal};