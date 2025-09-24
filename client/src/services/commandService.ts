interface CMD<T> {
    name: string;
    usage: string;
    args: string[];
    execute(): Promise<T>;
    result?: T[];
}

class Command<T> implements CMD<T> {
    name: string;
    usage: string;
    args: string[];
    executeFn: () => Promise<T>;
    constructor(name: string, usage: string, args: string[], executeFn: () => Promise<T>) {
        this.name = name;
        this.usage = usage;
        this.args = args;
        this.executeFn = executeFn;
    }

    async execute(): Promise<T> {
        return this.executeFn();
    }
}

class CommandService {
    private commands: { [key: string]: Command<object> } = {};
    constructor() {
        // Initialization code if needed
    }

    async executeCommand<T>(cmd: CommandRequest<Command<T>>): Promise<T> {
        const command = this.commands[cmd.type.name];
        if (!command) {
            throw new Error(`Command "${cmd.type.name}" not found`);
        }
        return command.execute() as Promise<T>;
    }
}

interface CommandRequest<Command> {
    args: string[];
    type: Command;
}

export default CommandService;