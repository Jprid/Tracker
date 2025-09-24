import { type JSX } from "react";

interface BaseTableProps {
    headers: JSX.Element;
    content: JSX.Element;
}

function BaseTable({ headers, content }: BaseTableProps): JSX.Element {
    return (
        <div className="table-container d-flex flex-column">
            <table className="stats-table">
                <thead className="stats-table-header">
                    <tr>
                        {headers}
                    </tr>
                </thead>
                <tbody>
                    {content}
                </tbody>
            </table>
        </div>
    );
}

export { BaseTable };
