import {type JSX} from "react";
import type { TabType } from "../../../types/interfaces";
import './TableTabs.css';

interface TableTabsProps {
    selectedTab: TabType;
    onTabChange: (tab: TabType) => void;
}

function TableTabs({ selectedTab, onTabChange }: TableTabsProps): JSX.Element {
    return (
        <div className="tabs d-flex flex-row">
            <button
                className={`tab tab-btn-${selectedTab === 'all' ? 'active' : ''}`}
                onClick={() => onTabChange('all')}
            >
                All Logs
            </button>
            <button
                className={`tab tab-btn-${selectedTab === 'entry' ? 'active' : ''}`}
                onClick={() => onTabChange('entry')}
            >
                Entry Log
            </button>
            <button
                className={`tab tab-btn-${selectedTab === 'medicine' ? 'active' : ''}`}
                onClick={() => onTabChange('medicine')}
            >
                Medicine Log
            </button>
        </div>
    );
}

export { TableTabs };
