import { useState, useCallback, type JSX, type MouseEvent } from "react";
import type { Entry } from "../../../types/interfaces.ts";
import './entry-row.css';

interface EditableEntryRowProps {
  entry: Entry;
  isEditing: boolean;
  onContextMenu: (
    event: MouseEvent<HTMLTableCellElement>,
    entry: Entry
  ) => void;
  onSave: (entry: Entry) => void;
  onCancel: () => void;
}

function EditableEntryRow({
  entry,
  isEditing,
  onContextMenu,
  onSave,
  onCancel,
}: EditableEntryRowProps): JSX.Element {
  const [formData, setFormData] = useState({
    text: entry.text,
    completed: entry.completed,
  });
  const [error, setError] = useState<string>("");

  const handleInputChange = useCallback(
    (field: string, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (error) setError("");
    },
    [error]
  );

  const handleSave = useCallback(() => {
    if (!formData.text.trim()) {
      setError("Please enter entry text");
      return;
    }

    const updatedEntry: Entry = {
      ...entry,
      text: formData.text,
      completed: formData.completed,
    };

    onSave(updatedEntry);
    setError(""); // Clear error on successful save
  }, [entry, formData, onSave]);

  return (
    <tr className="row">
      <td className="table-column" onContextMenu={(e) => onContextMenu(e, entry)}>
        {entry.displayTime}
      </td>
      <td className="table-column" onContextMenu={(e) => onContextMenu(e, entry)}>
        {isEditing ? (
          <input
            type="text"
            value={formData.text}
            onChange={(e) => handleInputChange("text", e.target.value)}
            className="form-control"
            placeholder="Entry text"
          />
        ) : (
          entry.text
        )}
      </td>
      <td className="table-column" onContextMenu={(e) => onContextMenu(e, entry)}>
        {isEditing ? (
          <input
            type="checkbox"
            checked={formData.completed}
            onChange={(e) => handleInputChange("completed", e.target.checked)}
            title="Completed"
          />
        ) : (
          <div className="h-full w-full d-flex flex-row justify-content-center align-items-center">
            <div className={`checkbox ${entry.completed ? 'checked' : ''}`}>{entry.completed ? '✔' : ''}</div>
          </div>
        )}
      </td>
      <td className="table-column">
        {isEditing && (
          <div className="d-flex">
            <button className="btn btn-link" onClick={onCancel}>
              ❌
            </button>
            <button className="btn btn-link" onClick={handleSave}>
              ✔️
            </button>
            {error && <div>{error}</div>}
          </div>
        )}
      </td>
    </tr>
  );
}

export { EditableEntryRow };
