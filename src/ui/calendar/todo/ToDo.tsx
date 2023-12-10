

import React from 'react';

interface ListItem {
    id: number;
    text: string;
}

interface ListProps {
    // items: ListItem[];
}

const ToDo: React.FC<ListProps> = () => {
    const dummyData: ListItem[] = [
        { id: 1, text: "Item 1" },
        { id: 2, text: "Item 2" },
        { id: 3, text: "Item 3" },
    ];

    return (
        <div className="calendar">
            {dummyData.map((item) => (
                <div key={item.id} className="calendar-item">
                    <div className="calendar-date">{item.id}</div>
                    <div className="calendar-text">{item.text}</div>
                </div>
            ))}
        </div>
    );
};

export default ToDo;
