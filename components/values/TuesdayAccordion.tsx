"use client";

import React, { useState } from "react";

interface TuesdayAccordionProps {
  id: number;
  name: string;
  description: string;
  tuesday: string;
}

export const TuesdayAccordion: React.FC<TuesdayAccordionProps> = ({
  id,
  name,
  description,
  tuesday,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={`value${isOpen ? " open" : ""}`}>
      <h4>{name}</h4>
      <button
        className="link more small"
        aria-expanded={isOpen}
        aria-controls={`tue-${id}`}
        data-tue={id}
        onClick={handleToggle}
      >
        On a Tuesday
      </button>
      <p>{description}</p>
      <div className="tue" id={`tue-${id}`}>
        <b>On a Tuesday:</b> {tuesday}
      </div>
    </div>
  );
};
