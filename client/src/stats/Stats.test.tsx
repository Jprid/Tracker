import {StatsComponent} from "./Stats.tsx";
import {expect, test} from "vitest";
import type {SubstanceEntry} from "../interfaces.ts";

function createEntry(id: number, time: string, dose: number, notes: string, substance: string): SubstanceEntry {
    return {id, time, dose, notes, name: substance};
}

test ('renders without crashing', async () => {
    expect(new StatsComponent({entries: []})).toBeTruthy();
});

test('renders correctly', () => {
    const component = new StatsComponent({
        entries: [{id: 1, time: '9:00', dose: 60, notes: '', name: 'Caffeine'}]
    });
    expect(component.state.stats).toBeTruthy();
    console.log(component.state.stats);
    expect(component.state.stats['caffeine'].totalDose).toBe(60);
})

test('renders correctly with multiple entries', () => {
    const entries = [
      createEntry(1, '9:00', 60, '', 'Caffeine'),
      createEntry(2, '10:00', 6, '', 'Nicotine'),
      createEntry(3, '11:00', 60, '', 'Caffeine'),
    ];
    const component = new StatsComponent({entries});
    const stats = component.state.stats!;
    const caffeine = stats['caffeine']!;
    const nicotine = stats['nicotine']!;
    expect(caffeine.totalDose).toBe(120);
    expect(caffeine.frequency).toBe(2);
    expect(nicotine.totalDose).toBe(6);
    expect(nicotine.frequency).toBe(1);
})