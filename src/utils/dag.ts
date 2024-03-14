interface TreeNode {
    id: string;
    children: TreeNode[];
  }
  
  const isCyclicUtil = (node: TreeNode, visited: Set<string>, recStack: Set<string>): boolean => {
    if (!visited.has(node.id)) {
      // 将当前节点标记为已访问和记录堆栈
      visited.add(node.id);
      recStack.add(node.id);
  
      // 遍历所有相邻的顶点
      for (const child of node.children) {
        if (!visited.has(child.id) && isCyclicUtil(child, visited, recStack)) {
          return true; // 发现环
        } else if (recStack.has(child.id)) {
          return true; // 当前节点在递归堆栈中，意味着我们找到了一个环
        }
      }
    }
  
    // 移除节点从递归堆栈
    recStack.delete(node.id);
    return false;
  };
  
  const isCyclic = (nodes: TreeNode[]): boolean => {
    const visited = new Set<string>();
    const recStack = new Set<string>();
  
    for (const node of nodes) {
      if (isCyclicUtil(node, visited, recStack)) {
        return true;
      }
    }
  
    return false;
  };
  
  export { isCyclic };
  