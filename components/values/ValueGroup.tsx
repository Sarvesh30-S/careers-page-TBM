"use client";

import React from "react";
import { ValueGroup as ValueGroupType } from "@/types";
import { TuesdayAccordion } from "./TuesdayAccordion";

interface ValueGroupProps {
  group: ValueGroupType;
  groupIndex: number;
  startIndex: number;
}

export const ValueGroup: React.FC<ValueGroupProps> = ({
  group,
  groupIndex,
  startIndex,
}) => {
  return (
    <div className="vgroup" data-g={groupIndex}>
      <div className="vhead">
        <span className="n">0{groupIndex + 1}</span>
        <h3>{group.name}</h3>
        <p>{group.line}</p>
      </div>
      <div className="vrows">
        {group.behaviours.map(([name, desc, tuesday], i) => (
          <TuesdayAccordion
            key={name}
            id={startIndex + i}
            name={name}
            description={desc}
            tuesday={tuesday}
          />
        ))}
      </div>
    </div>
  );
};
