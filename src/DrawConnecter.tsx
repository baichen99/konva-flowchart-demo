import React from 'react';
import { Arrow } from 'react-konva';

export interface ConnectorProps {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }

const DrawConnector: React.FC<ConnectorProps> = ({startX, startY, endX, endY}) => {
    const controlPointX = (startX + endX) / 2;
    const controlPointY = startY < endY ? startY - 50 : startY + 50;
    const points = [startX, startY, controlPointX, controlPointY, endX, endY];
    return <Arrow  points={points} stroke="black" fill="black" />;
}

export default DrawConnector;