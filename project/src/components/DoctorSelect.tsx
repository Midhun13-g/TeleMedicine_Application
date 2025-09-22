import React from "react";

interface Props {
    doctors: { id: number; name: string }[];
    selectedDoctor: number;
    onChange: (id: number) => void;
}

const DoctorSelect: React.FC<Props> = ({ doctors, selectedDoctor, onChange }) => {
    return (
        <select
            aria-label="Select doctor"
            value={selectedDoctor}
            onChange={e => onChange(Number(e.target.value))}
        >
            {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
        </select>
    );
};

export default DoctorSelect;
