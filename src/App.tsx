
import styles from './App.module.css'
import Card, { CardProps } from './Card'
import { Stage, Layer, Arrow } from 'react-konva'
import * as React from 'react';


interface ArrowProps {
  startCardId: string
  endCardId: string
}

interface ArrowPosition {
  startX: number
  startY: number
  endX: number
  endY: number
}

function App() {
  const [cards, setCards] = React.useState<CardProps[]>([
    {
      id: '1',
      title: 'Card 1',
      content: 'Content 1',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    },
    {
      id: '2',
      title: 'Card 2',
      content: 'Content 2',
      x: 200,
      y: 50,
      width: 100,
      height: 100,
    }
  ])
  const [arrows, setArrows] = React.useState<ArrowProps[]>([
  ])
  const arrowPositions: ArrowPosition[] = React.useMemo((): ArrowPosition[] => {
    return arrows.map(arrow => {
      const cardStart = cards.find(card => card.id === arrow.startCardId)
      const cardEnd = cards.find(card => card.id === arrow.endCardId)

      if (!cardStart || !cardEnd) {
        return { startX: 0, startY: 0, endX: 0, endY: 0 }
      }
      return {
        startX: cardStart.x + cardStart.width,
        startY: cardStart.y + cardStart.height / 2,
        endX: cardEnd.x,
        endY: cardEnd.y + cardEnd.height / 2,
      }
    })
  }, [cards, arrows])

  const [isDrawing, setIsDrawing] = React.useState(false);
  const [drawingStartId, setDrawingStartId] = React.useState<string | null>(null);
  const [tempArrow, setTempArrow] = React.useState({ startX: 0, startY: 0, endX: 0, endY: 0 });

  const handleStartDrawing = (cardId: string, startX: number, startY: number) => {
    const card = cards.find(card => card.id === cardId);
    if (!card) return;
    setIsDrawing(true);
    setDrawingStartId(cardId);
    setTempArrow({ startX: startX + card.x, startY: startY + card.y, endX: startX + card.x, endY: startY + card.y});
  };


  const handleDrawingMove = (e: any) => {
    if (!isDrawing) return;
    // 更新临时箭头的终点位置
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setTempArrow({ ...tempArrow, endX: point.x, endY: point.y });
  };

  const handleEndDrawing = (endCardId: string) => {
    if (!isDrawing || !drawingStartId) return;
    const newArrow = {
      startCardId: drawingStartId,
      endCardId: endCardId,
    };
    setArrows([...arrows, newArrow]);
    setIsDrawing(false);
    setDrawingStartId(null);
  };

  const handleDragMove = (id: string, newX: number, newY: number) => {
    setCards(cards.map(card => {
      if (card.id === id) {
        return { ...card, x: newX, y: newY }
      }
      return card
    }))
  }
  const handleCloseDrawing = (e: any) => {
    if (!isDrawing) return;
    
    const endPosition = e.target.getStage().getPointerPosition()
    // 判断是否在卡片上
    const card = cards.find(card => {
      return endPosition.x >= card.x && endPosition.x <= card.x + card.width && endPosition.y >= card.y && endPosition.y <= card.y + card.height
    })
    if (card) {
      handleEndDrawing(card.id)
    }
    setIsDrawing(false);
    setDrawingStartId(null);
  }
  const handleAddCard = () => {
    setCards([...cards, {
      id: String(cards.length + 1),
      title: `Card ${cards.length + 1}`,
      content: `Content ${cards.length + 1}`,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    }])
  }
  const handleShuffleCards = () => {
    // 改变x y
    setCards(cards.map(card => {
      return {
        ...card,
        x: Math.random() * 800,
        y: Math.random() * 250
      }
    }))
  }
  return (
    <>
      <Stage
        className={styles.stage}
        width={1000}
        height={500}
        onMouseMove={handleDrawingMove}
        onClick={handleCloseDrawing}
      >
        <Layer style={{border: '1px solid red'}}>
          {cards.map((card) => (
            <Card
              id={card.id}
              key={card.id}
              x={card.x}
              y={card.y}
              width={card.width}
              height={card.height}
              title={card.title}
              content={card.content}
              onDragMove={(newX, newY) => handleDragMove(card.id, newX, newY)}
              onStartDrawingArrow={handleStartDrawing}
              onEndDrawingArrow={handleEndDrawing}
            />
          ))}
          {arrowPositions.map((arrow, index) => (
            <Arrow
              key={index}
              points={[arrow.startX, arrow.startY, arrow.endX, arrow.endY]}
              stroke="black"
              fill="black"
              strokeWidth={4}
              pointerLength={10}
              pointerWidth={10}
            />
          ))}
          {
            isDrawing && (
              <Arrow
                points={[tempArrow.startX, tempArrow.startY, tempArrow.endX, tempArrow.endY]}
                stroke="black"
                fill="black"
                strokeWidth={4}
                pointerLength={10}
                pointerWidth={10}
              />
            )
          }
        </Layer>
      </Stage>
      <div className={styles.toolbar}>
        <button onClick={handleAddCard}>Add Card</button>
        <button onClick={() => setCards([])}>Clear</button>
        {/* shuffle */}
        <button onClick={handleShuffleCards}>Shuffle</button>
      </div>
    </>
  )
}

export default App
