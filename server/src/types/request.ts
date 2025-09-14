interface MedicationRequest {
    name: string;
    dose?: number; // Optional, representing a decimal
    completed: boolean;
}

export {MedicationRequest};