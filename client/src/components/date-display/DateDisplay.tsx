import { ClockIcon } from '../ui/ClockIcon.tsx';
import { ArrowLeftIcon } from '../ui/ArrowLeftIcon.tsx';
import { ArrowRightIcon } from '../ui/ArrowRightIcon.tsx';
import './DateDisplay.css';
interface DateDisplayProps {
    localTimeString: string;
    utcTimeString: string;
    viewingDate: Date;
    onDateChange: (date: Date) => void;
    onResetToToday: () => void;
}

function DateDisplay(props: DateDisplayProps) {
    const { localTimeString, utcTimeString, viewingDate, onDateChange, onResetToToday } = props;

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(viewingDate);
        if (direction === 'prev') {
            newDate.setDate(newDate.getDate() - 1);
        } else {
            newDate.setDate(newDate.getDate() + 1);
        }
        onDateChange(newDate);
    };

    const isToday = () => {
        const today = new Date();
        return viewingDate.toDateString() === today.toDateString();
    };

    const canNavigateForward = () => {
        return !isToday();
    };

    const formatViewingDate = () => {
        return viewingDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '-');
    };

    return (
        <div className="date-display-wrapper">
            <div className="date-display">
                <ClockIcon 
                    style={{ width: 24, height: 24, color: 'black', cursor: 'pointer' }}
                    onClick={onResetToToday}
                />
                <div className="date-text">
                    <p className="">{utcTimeString}</p>
                    <p className="">{localTimeString}</p>
                </div>
                <div className="date-controls">
                    <ArrowLeftIcon 
                        style={{ width: 24, height: 24, color: 'black', cursor: 'pointer' }}
                        onClick={() => navigateDate('prev')}
                    />
                    <ArrowRightIcon 
                        style={{ 
                            width: 24, 
                            height: 24, 
                            color: canNavigateForward() ? 'black' : 'black', 
                            cursor: canNavigateForward() ? 'pointer' : 'not-allowed',
                            opacity: canNavigateForward() ? 1 : 0.5
                        }}
                        onClick={canNavigateForward() ? () => navigateDate('next') : undefined}
                    />
                </div>
            </div>
                <div className={`viewing-date ${!isToday() ? 'visible' : ''}`}>
                    <p>Viewing: </p>
                    <p>{formatViewingDate()}</p>
                </div>
        </div>
    )
}

export default DateDisplay;