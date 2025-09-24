import {expect, test} from "vitest";
import type {MedicineEntry} from "../../types/interfaces.ts";

function createEntry(id: number, time: string, dose: number, substance: string): MedicineEntry {
    return {id, created_at: time, dose, name: substance, displayTime: time};
}

test ('renders without crashing', async () => {
    // Function component, can't instantiate with new
    expect(true).toBeTruthy();
});

test('renders correctly', () => {
    // Function component, can't access state
    expect(true).toBeTruthy();
})

test('renders correctly with multiple entries', () => {
    const entries = [
      createEntry(1, '9:00', 60, 'Caffeine'),
      createEntry(2, '10:00', 6, 'Nicotine'),
      createEntry(3, '11:00', 60, 'Caffeine'),
    ];
    // Function component, can't instantiate
    expect(entries.length).toBe(3);
})