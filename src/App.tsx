
import styles from './App.module.css'
import Card, { CardProps } from './Card'
import { Stage, Layer, Arrow } from 'react-konva'
import * as React from 'react';
import { isCyclic } from './utils/dag'
import { v4 as uuidv4 } from 'uuid'


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

interface TreeNode {
  id: string;
  title: string;
  content: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  type: 'data' | 'network' | 'output';
  children: TreeNode[];
}


function App() {
  const [cards, setCards] = React.useState<CardProps[]>([

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
  const [tree, setTree] = React.useState<TreeNode[]>([]);

  const [isDrawing, setIsDrawing] = React.useState(false);
  const [drawingStartId, setDrawingStartId] = React.useState<string | null>(null);
  const [tempArrow, setTempArrow] = React.useState({ startX: 0, startY: 0, endX: 0, endY: 0 });

  const handleStartDrawing = (cardId: string, startX: number, startY: number) => {
    const card = cards.find(card => card.id === cardId);
    if (!card) return;
    setIsDrawing(true);
    setDrawingStartId(cardId);
    setTempArrow({ startX: startX + card.x, startY: startY + card.y, endX: startX + card.x, endY: startY + card.y });
  };

  const handleDrawingMove = (e: any) => {
    if (!isDrawing) return;
    // 更新临时箭头的终点位置
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setTempArrow({ ...tempArrow, endX: point.x, endY: point.y });
  }

  const handleEndDrawing = (endCardId: string) => {
    if (!isDrawing || !drawingStartId) return;
    const newArrow = {
      startCardId: drawingStartId,
      endCardId: endCardId,
    };
    setArrows([...arrows, newArrow]);

    // 更新树
    updateTreeWithNewArrow(drawingStartId, endCardId);

    setIsDrawing(false);
    setDrawingStartId(null);
  };

  const deleteTreeNode = (nodes: TreeNode[], id: string): TreeNode[] => {
    return nodes
      .filter(node => node.id !== id) // 首先过滤掉直接匹配的节点
      .map(node => ({
        ...node,
        children: deleteTreeNode(node.children, id) // 递归处理子节点
      }));
  };

  const handleDeleteCard = (id: string) => {
    // 删除卡片和箭头
    setCards(cards.filter(card => card.id !== id));
    setArrows(arrows.filter(arrow => arrow.startCardId !== id && arrow.endCardId !== id));

    // 更新树结构
    setTree(currentTree => deleteTreeNode(currentTree, id));
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
  const handleAddCard = (type: 'data' | 'network' | 'output') => {
    const newCard: CardProps = {
      id: uuidv4(),
      title: `${type} ${cards.length + 1}`,
      content: `${type} Content ${cards.length + 1}`,
      x: Math.random() * 800,
      y: Math.random() * 250,
      width: 100,
      height: 100,
      type,
    };
    setCards([...cards, newCard]);
    // 更新树
    setTree(currentTree => {
      const newNode: TreeNode = {
        id: newCard.id,
        title: newCard.title,
        content: newCard.content,
        x: newCard.x,
        y: newCard.y,
        width: newCard.width,
        height: newCard.height,
        type: newCard.type,
        children: [],
      };
      return [...currentTree, newNode];
    });
  };
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

  const updateTreeWithNewArrow = (startCardId: string, endCardId: string) => {
    setTree(currentTree => {
      const startCard = cards.find(card => card.id === startCardId);
      const endCard = cards.find(card => card.id === endCardId);

      if (!startCard || !endCard) return currentTree; // 确保找到了卡片

      let startNode = findTreeNode(currentTree, startCardId);
      let endNode = findTreeNode(currentTree, endCardId);

      // 如果找不到节点，则基于卡片信息创建节点
      if (!startNode) {
        startNode = {
          id: startCard.id,
          title: startCard.title,
          content: startCard.content,
          x: startCard.x,
          y: startCard.y,
          width: startCard.width,
          height: startCard.height,
          type: startCard.type,
          children: [],
        };
        currentTree.push(startNode);
      }
      if (!endNode) {
        endNode = {
          id: endCard.id,
          title: endCard.title,
          content: endCard.content,
          x: endCard.x,
          y: endCard.y,
          width: endCard.width,
          height: endCard.height,
          type: endCard.type,
          children: [],
        };
        // 由于结束节点不一定是顶级节点，这里不直接添加到树中
      }

      // 更新父子关系
      if (!startNode.children.some(child => child.id === endNode.id)) {
        startNode.children.push(endNode);
      }

      return [...currentTree];
    });
  };


  // 查找函数，递归查找树节点
  const findTreeNode = (nodes: TreeNode[], id: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      const found = findTreeNode(node.children, id);
      if (found) {
        return found;
      }
    }
    return null;
  };
  const exportTreeToJson = (tree: TreeNode[]): string => {
    // 更新
    return JSON.stringify(tree, null, 2);
  };
  const buildGraph = (): TreeNode[] => {
    // 创建节点映射
    const nodes: Record<string, TreeNode> = {};
    cards.forEach(card => {
      nodes[card.id] = {
        id: card.id,
        title: card.title,
        content: card.content,
        type: card.type,
        children: []
      };
    });
    // 根据箭头添加边
    arrows.forEach(arrow => {
      const fromNode = nodes[arrow.startCardId];
      const toNode = nodes[arrow.endCardId];
      if (fromNode && toNode) {
        fromNode.children.push(toNode);
      }
    });

    return Object.values(nodes);
  };

  const checkCyclic = () => {
    const tempGraph = buildGraph(); // 使用临时状态构建图
    if (isCyclic(tempGraph)) {
      alert("Detected a cycle in the graph! Please check your connections.");
      setArrows(arrows);
    }
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
        <Layer style={{ border: '1px solid red' }}>
          {cards.map((card) => (
            <Card
              key={card.id}
              {...card}
              onDragMove={(newX, newY) => handleDragMove(card.id, newX, newY)}
              onStartDrawingArrow={handleStartDrawing}
              onEndDrawingArrow={handleEndDrawing}
              onDelete={() => handleDeleteCard(card.id)}
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
        <button onClick={() => handleAddCard('data')}>Add Data Processing Node</button>
        <button onClick={() => handleAddCard('network')}>Add Network Node</button>
        <button onClick={() => handleAddCard('output')}>Add Output Node</button>
        <button onClick={() => setCards([])}>Clear</button>
        {/* shuffle */}
        <button onClick={handleShuffleCards}>Shuffle</button>
        <button onClick={() => console.log(exportTreeToJson(tree))}>Export Tree to JSON</button>
        <button onClick={checkCyclic}>Check Cyclic</button>

      </div>
    </>
  )
}

export default App
