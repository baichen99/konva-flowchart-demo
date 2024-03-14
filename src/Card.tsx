import * as React from 'react'
import { Rect, Group, Text, Circle } from 'react-konva'


export interface CardProps {
    id: string
    title: string
    content: string
    x: number
    y: number
    width: number
    height: number
    type: 'data' | 'network' | 'output'
    onDragMove?: (newX: number, newY: number) => void
    onStartDrawingArrow?: (cardId: string, x: number, y: number) => void
    onEndDrawingArrow?: (cardId: string, x: number, y: number) => void
    onDelete?: (id: string) => void
}


const Card: React.FC<CardProps> = React.memo(({type, id, x, y, width, height, title, content, onDragMove, onStartDrawingArrow, onEndDrawingArrow, onDelete}) => {
    const portRadius = 5
    const inputPortX = portRadius
    const inputPortY = height / 2
    const outputPortX = width - portRadius
    const outputPortY = height / 2
    const handleDragMove = (e: any) => {
        onDragMove && onDragMove(e.target.x(), e.target.y())
    }
    const handleOutputPortClick = (id: string) => {
        onStartDrawingArrow && onStartDrawingArrow(id, outputPortX, outputPortY)
    }
    const handleInputPortClick = (id: string) => {
        console.log('click input port');
        onEndDrawingArrow && onEndDrawingArrow(id, inputPortX, inputPortY)
    }
    
    return (
        <Group
            x={x}
            y={y}
            width={width}
            height={height}
            draggable
            onDragMove={handleDragMove}
        >   
            <Text
                text={title}
                x={0}
                y={10}
                width={width}
                height={10}
                align='center'></Text>
            <Text
                text={content}
                x={0}
                y={width/2}
                width={width}
                height={height}
                align='center'></Text>
            <Rect
                x={0}
                y={0}
                width={width}
                height={height}
                stroke={
                    type === 'data' ? 'green' :
                    type === 'network' ? 'black' : 'purple'
                }
            >
            </Rect>
            <Circle
                className='input-port'
                x={inputPortX}
                y={inputPortY}
                radius={portRadius}
                fill='red'
                onClick={() => handleInputPortClick(id)}
            />
            <Circle
                className='output-port'
                x={outputPortX}
                y={outputPortY}
                radius={portRadius}
                fill='blue'
                onClick={() => handleOutputPortClick(id)}
            />
            {/* delete button */}
            <Rect 
                x={width - 20}
                y={0}
                width={20}
                height={20}
                fill='red'
                onClick={() => onDelete && onDelete(id)}
            />
        </Group>
    )
})

export default Card