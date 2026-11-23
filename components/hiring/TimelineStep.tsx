"use client";

import React from "react";

interface TimelineStepProps {
  title: string;
  timeframe: string;
  description: string;
}

export const TimelineStep: React.FC<TimelineStepProps> = ({
  title,
  timeframe,
  description,
}) => {
  return (
    <li>
      <h3>
        <small>{timeframe}</small>
        {title}
      </h3>
      <p>{description}</p>
    </li>
  );
};

export default TimelineStep;
