type ClockIconProps = React.SVGProps<SVGSVGElement>;

export function ClockIcon(props: ClockIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="clock-icon"
            {...props}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
            />
        </svg>
    );
}

