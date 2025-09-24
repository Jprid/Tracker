import { useState, useCallback, type JSX, type MouseEvent } from "react";
import type { MedicineEntry } from "../../../types/interfaces.ts";

interface EditableMedicineRowProps {
  entry: MedicineEntry;
  isEditing: boolean;
  onContextMenu: (
    event: MouseEvent<HTMLTableCellElement>,
    entry: MedicineEntry
  ) => void;
  onSave: (entry: MedicineEntry) => void;
  onCancel: () => void;
}

function EditableMedicineRow({
  entry,
  isEditing,
  onContextMenu,
  onSave,
  onCancel,
}: EditableMedicineRowProps): JSX.Element {
  const [formData, setFormData] = useState({
    time: entry.created_at,
    name: entry.name,
    dose: entry.dose.toString(),
  });
  const [error, setError] = useState<string>("");

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (error) setError("");
    },
    [error]
  );
  const handleSave = useCallback(() => {
    if (!formData.time) {
      setError("Please enter a time");
      return;
    }

    const utcTimeValue = new Date();
    const [hours, minutes] = formData.time.split(":").map(Number);
    utcTimeValue.setHours(hours, minutes, 0, 0);
    const timeString = utcTimeValue.toISOString().replace("Z", "");
    const updatedEntry: MedicineEntry & { created_at: string } = {
      ...entry,
      created_at: timeString,
      name: formData.name,
      dose: parseFloat(formData.dose),
    };

    onSave(updatedEntry);
    setError(""); // Clear error on successful save
  }, [entry, formData, onSave]);
  return (
    <tr className="row">
      <td className="table-column" onContextMenu={(e) => onContextMenu(e, entry)}>
        {isEditing ? (
          <input
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange("time", e.target.value)}
            className="form-control"
          />
        ) : (
          entry.displayTime
        )}
      </td>
      <td className="table-column" onContextMenu={(e) => onContextMenu(e, entry)}>
        {isEditing ? (
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="form-control"
          />
        ) : (
          entry.name
        )}
      </td>
      <td className="table-column" onContextMenu={(e) => onContextMenu(e, entry)}>
        {isEditing ? (
          <input
            type="number"
            value={formData.dose}
            onChange={(e) => handleInputChange("dose", e.target.value)}
            className="form-control"
          />
        ) : (
          entry.dose
        )}
      </td>
      <td className="table-column">
        {isEditing && (
          <div className="d-flex flex-row">
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

export { EditableMedicineRow };
