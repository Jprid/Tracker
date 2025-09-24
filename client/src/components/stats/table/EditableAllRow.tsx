import { useState, useCallback, type JSX, type MouseEvent } from "react";
import type { Entry, MedicineEntry } from "../../../types/interfaces.ts";

interface EditableAllRowProps {
  entry: Entry | MedicineEntry;
  isEditing: boolean;
  onContextMenu: (
    event: MouseEvent<HTMLTableCellElement>,
    entry: Entry | MedicineEntry
  ) => void;
  onSave: (entry: Entry | MedicineEntry) => void;
  onCancel: () => void;
}

type EntryFormData = {
  text: string;
  completed: boolean;
};

type MedicineFormData = {
  time: string;
  name: string;
  dose: string;
};

function EditableAllRow({
  entry,
  isEditing,
  onContextMenu,
  onSave,
  onCancel,
}: EditableAllRowProps): JSX.Element {
  const isEntry = 'text' in entry;

  const [entryFormData, setEntryFormData] = useState<EntryFormData>(() => ({
    text: (entry as Entry).text || '',
    completed: (entry as Entry).completed || false,
  }));

  const [medicineFormData, setMedicineFormData] = useState<MedicineFormData>(() => {
    const date = new Date((entry as MedicineEntry).created_at);
    const timeString = date.toTimeString().slice(0, 5); // Extract HH:MM format
    return {
      time: timeString,
      name: (entry as MedicineEntry).name || '',
      dose: (entry as MedicineEntry).dose?.toString() || '',
    };
  });

  const [error, setError] = useState<string>("");

  const handleInputChange = useCallback(
    (field: string, value: string | boolean) => {
      if (isEntry) {
        setEntryFormData((prev) => ({ ...prev, [field]: value }));
      } else {
        setMedicineFormData((prev) => ({ ...prev, [field]: value }));
      }
      if (error) setError("");
    },
    [error, isEntry]
  );

  const handleSave = useCallback(() => {
    if (isEntry) {
      // Handle Entry
      if (!entryFormData.text.trim()) {
        setError("Please enter entry text");
        return;
      }

      const updatedEntry: Entry = {
        ...entry,
        text: entryFormData.text,
        completed: entryFormData.completed,
      };

      onSave(updatedEntry);
    } else {
      // Handle MedicineEntry
      if (!medicineFormData.time) {
        setError("Please enter a time");
        return;
      }

      const utcTimeValue = new Date();
      const [hours, minutes] = medicineFormData.time.split(":").map(Number);
      utcTimeValue.setHours(hours, minutes, 0, 0);
      const timeString = utcTimeValue.toISOString().replace("Z", "");
      const updatedEntry: MedicineEntry & { created_at: string } = {
        ...entry,
        created_at: timeString,
        name: medicineFormData.name,
        dose: parseFloat(medicineFormData.dose),
      };

      onSave(updatedEntry);
    }
    setError("");
  }, [entry, entryFormData, medicineFormData, onSave, isEntry]);

  // Remove duplicate isEntry declaration

  return (
    <tr className="row">
      <td className="table-column" onContextMenu={(e) => onContextMenu(e, entry)}>
        {isEntry ? (
          entry.displayTime
        ) : isEditing ? (
          <input
            type="time"
            value={medicineFormData.time}
            onChange={(e) => handleInputChange("time", e.target.value)}
            className="form-control"
            aria-label="Medicine time"
          />
        ) : (
          entry.displayTime
        )}
      </td>
      <td className="table-column" onContextMenu={(e) => onContextMenu(e, entry)}>
        {isEntry ? (
          isEditing ? (
            <input
              type="text"
              value={entryFormData.text}
              onChange={(e) => handleInputChange("text", e.target.value)}
              className="form-control"
              placeholder="Entry text"
            />
          ) : (
            entry.text
          )
        ) : (
          isEditing ? (
            <input
              type="text"
              value={medicineFormData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="form-control"
              placeholder="Medicine name"
              aria-label="Medicine name"
            />
          ) : (
            entry.name
          )
        )}
      </td>
      <td className="table-column" onContextMenu={(e) => onContextMenu(e, entry)}>
        {isEntry ? (
          isEditing ? (
            <input
              type="checkbox"
              checked={entryFormData.completed}
              onChange={(e) => handleInputChange("completed", e.target.checked)}
              title="Completed"
            />
          ) : (
            <div className="h-full w-full d-flex flex-row justify-content-center align-items-center">
              <div className={`checkbox ${entry.completed ? 'checked' : ''}`}>{entry.completed ? '✔' : ''}</div>
            </div>
          )
        ) : (
          isEditing ? (
            <input
              type="number"
              value={medicineFormData.dose}
              onChange={(e) => handleInputChange("dose", e.target.value)}
              className="form-control"
              placeholder="Dose"
              aria-label="Medicine dose"
            />
          ) : (
            `${entry.dose}mg`
          )
        )}
      </td>
      <td className="table-column">
        <div className="d-flex flex-row align-items-center justify-content-center">
          <span className="entry-type-badge">
            {isEntry ? '📝' : '💊'}
          </span>
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
        </div>
      </td>
    </tr>
  );
}

export { EditableAllRow };
