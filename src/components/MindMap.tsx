
import React, { useEffect, useState, useRef } from 'react';
import { FileData } from '../types/files';
import { Network, X, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type MindMapNode = {
  id: string;
  label: string;
  parent?: string;
  level: number;
  description: string;
};

const MindMap = ({ file }: { file: FileData }) => {
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Generate mind map nodes based on file topics with hierarchical structure
  useEffect(() => {
    const generateNodes = () => {
      const fileTopics = file.content.topics;
      
      // Main topic/root node
      const rootNode: MindMapNode = {
        id: 'root',
        label: file.name,
        level: 0,
        description: file.content.summary
      };
      
      // Generate section nodes (primary branches)
      const sectionNodes = fileTopics.map((topic, index) => ({
        id: `section-${index}`,
        label: topic,
        parent: 'root',
        level: 1,
        description: generateTopicDescription(topic, file)
      }));
      
      // Generate subtopic nodes (secondary branches)
      const subtopicNodes: MindMapNode[] = [];
      
      // For each section, create 2-3 subtopics with more spacing
      sectionNodes.forEach((sectionNode, sectionIndex) => {
        // Get data keys as potential subtopics
        const dataKeys = Object.keys(file.content.data || {});
        
        // Create subtopics based on data keys or generated content
        const subtopicsCount = Math.min(Math.floor(Math.random() * 2) + 2, dataKeys.length || 3);
        
        for (let i = 0; i < subtopicsCount; i++) {
          const subtopicLabel = dataKeys[i] || getRandomSubtopic(sectionNode.label, i);
          
          subtopicNodes.push({
            id: `subtopic-${sectionIndex}-${i}`,
            label: subtopicLabel,
            parent: sectionNode.id,
            level: 2,
            description: `This subtopic examines ${subtopicLabel} in relation to ${sectionNode.label}. It provides further analysis and insights from the document.`
          });
        }
      });
      
      return [rootNode, ...sectionNodes, ...subtopicNodes];
    };
    
    setNodes(generateNodes());
  }, [file]);
  
  const getRandomSubtopic = (topic: string, index: number) => {
    const subtopics = [
      `${topic} Analysis`,
      `${topic} Methodology`,
      `${topic} Impact Assessment`,
      `${topic} Future Trends`,
      `${topic} Key Metrics`,
      `${topic} Implementation`,
      `${topic} Challenges`
    ];
    return subtopics[index % subtopics.length];
  };
  
  const generateTopicDescription = (topic: string, file: FileData) => {
    const descriptions = [
      `<strong>${topic}</strong> is a critical component discussed in the ${file.name} document. It relates to the core industry metrics and contains valuable insights for operational decisions.`,
      `The document section covering <strong>${topic}</strong> presents key findings about industry trends and performance indicators relevant to oil & gas operations.`,
      `<strong>${topic}</strong> analysis in this document reveals important correlations between operational factors and business outcomes, with supporting data.`,
      `This section examines <strong>${topic}</strong> in detail, providing comparative analysis against industry benchmarks and historical performance data.`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const handleNodeClick = (node: MindMapNode) => {
    setSelectedNode(node);
  };
  
  const closePopup = () => {
    setSelectedNode(null);
  };
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.6));
  };
  
  const getNodePosition = (node: MindMapNode) => {
    // Calculate position based on level and hierarchy with improved spacing
    let x = 0, y = 0;
    
    if (node.level === 0) {
      // Root node at center-left
      x = 180;
      y = 250;
    } else if (node.level === 1) {
      // Section nodes arranged horizontally at equal intervals with more vertical spacing
      const sectionCount = nodes.filter(n => n.level === 1).length;
      const sectionIndex = nodes.filter(n => n.level === 1).findIndex(n => n.id === node.id);
      x = 400;
      y = 100 + (sectionIndex * (450 / Math.max(sectionCount, 1)));
    } else if (node.level === 2) {
      // Subtopic nodes positioned relative to their parent section with better distribution
      const parentNode = nodes.find(n => n.id === node.parent);
      if (parentNode) {
        const siblingCount = nodes.filter(n => n.parent === parentNode.id).length;
        const siblingIndex = nodes.filter(n => n.parent === parentNode.id).findIndex(n => n.id === node.id);
        
        const parentIndex = nodes.filter(n => n.level === 1).findIndex(n => n.id === parentNode.id);
        
        x = 650;
        y = 50 + (parentIndex * (450 / Math.max(nodes.filter(n => n.level === 1).length, 1))) + 
            ((siblingIndex + 0.5) * (350 / Math.max(siblingCount, 1)));
      }
    }
    
    return { x, y };
  };
  
  const renderNode = (node: MindMapNode) => {
    // Style based on node level
    const nodeClasses = {
      0: "bg-primary text-white font-medium mind-map-node-parent", // Root node
      1: "bg-blue-800/50 border-blue-600/50 text-blue-50", // Section node
      2: "bg-blue-900/30 border-blue-700/30 text-blue-100" // Subtopic node
    };
    
    // Get position and apply map position offset
    const { x, y } = getNodePosition(node);
    const posX = x + mapPosition.x;
    const posY = y + mapPosition.y;
    
    const nodeStyle = {
      left: `${posX}px`,
      top: `${posY}px`,
      transform: `scale(${zoomLevel})`,
      transformOrigin: 'center',
      zIndex: 10 - node.level, // Higher z-index for more important nodes
      maxWidth: node.level === 0 ? '200px' : node.level === 1 ? '180px' : '160px'
    };
    
    return (
      <div 
        key={node.id}
        className={`absolute rounded-lg p-3 shadow-lg cursor-pointer transition-all hover:shadow-primary/30 hover:scale-105 mind-map-node ${nodeClasses[node.level as keyof typeof nodeClasses]}`}
        style={nodeStyle}
        onClick={() => handleNodeClick(node)}
        data-node-id={node.id}
      >
        <div className="truncate">{node.label}</div>
      </div>
    );
  };

  const renderConnections = () => {
    return nodes
      .filter(node => node.parent)
      .map(node => {
        const child = node;
        const parent = nodes.find(n => n.id === child.parent);
        
        if (!parent) return null;
        
        // Get node positions and add offsets for connections
        const childPos = getNodePosition(child);
        const parentPos = getNodePosition(parent);
        
        // Calculate connection points based on node level
        let parentX, parentY, childX, childY;
        
        // Parent connection point (right side or center-bottom based on level)
        if (parent.level === 0) {
          parentX = parentPos.x + 100 + mapPosition.x; // right side of node
          parentY = parentPos.y + 20 + mapPosition.y; // center of node
        } else {
          parentX = parentPos.x + 90 + mapPosition.x; // right side of node
          parentY = parentPos.y + 20 + mapPosition.y; // center of node
        }
        
        // Child connection point (left side)
        childX = childPos.x + mapPosition.x; // left edge of node
        childY = childPos.y + 20 + mapPosition.y; // center of node
        
        // Draw SVG line between nodes
        return (
          <svg 
            key={`${parent.id}-${child.id}`} 
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <path
              d={`M ${parentX} ${parentY} C ${(parentX + childX) / 2 + 50} ${parentY}, ${(parentX + childX) / 2 - 50} ${childY}, ${childX} ${childY}`}
              className={`mind-map-link ${child.level === 1 ? 'stroke-primary/80' : 'stroke-primary/50'}`}
              fill="none"
              strokeWidth={child.level === 1 ? 2 : 1.5}
              strokeDasharray={child.level === 2 ? "5,5" : "none"}
            />
          </svg>
        );
      });
  };

  // Handle map movement
  const handleMapMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    const moveDistance = 80; // Increased from 50 to 80 for better navigation
    
    setMapPosition(prev => {
      switch(direction) {
        case 'up':
          return { ...prev, y: prev.y + moveDistance };
        case 'down':
          return { ...prev, y: prev.y - moveDistance };
        case 'left':
          return { ...prev, x: prev.x + moveDistance };
        case 'right':
          return { ...prev, x: prev.x - moveDistance };
        default:
          return prev;
      }
    });
  };
  
  // Add reset function to center the map
  const resetMapPosition = () => {
    setMapPosition({ x: 0, y: 0 });
    setZoomLevel(1);
  };
  
  return (
    <div className="mind-map-container relative">
      <div className="bg-blue-950/30 rounded-lg p-4 shadow-md backdrop-blur-sm border border-blue-900/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-blue-100 flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            Content Structure: {file.name}
          </h3>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-blue-900/40 border-blue-800/40 hover:bg-blue-800/60"
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-4 w-4 mr-1" /> Zoom In
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-blue-900/40 border-blue-800/40 hover:bg-blue-800/60"
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-4 w-4 mr-1" /> Zoom Out
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-blue-900/40 border-blue-800/40 hover:bg-blue-800/60"
              onClick={resetMapPosition}
            >
              Center
            </Button>
          </div>
        </div>
        
        {/* Navigation controls */}
        <div className="bg-blue-950/60 p-3 rounded-lg border border-blue-800/30 mb-4 flex flex-wrap gap-2">
          <p className="text-sm text-blue-300 mr-2">Map Navigation:</p>
          <div className="grid grid-cols-3 gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="aspect-square p-1 col-start-2"
              onClick={() => handleMapMove('up')}
            >
              <Move className="h-4 w-4 rotate-0" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="aspect-square p-1"
              onClick={() => handleMapMove('left')}
            >
              <Move className="h-4 w-4 -rotate-90" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="aspect-square p-1"
              onClick={() => handleMapMove('right')}
            >
              <Move className="h-4 w-4 rotate-90" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="aspect-square p-1 col-start-2"
              onClick={() => handleMapMove('down')}
            >
              <Move className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        </div>
        
        {/* Mind Map Visualization */}
        <div 
          ref={mapRef} 
          className="relative h-[600px] w-full overflow-hidden bg-blue-950/40 rounded-lg p-4 backdrop-blur-sm border border-blue-900/30"
        >
          {/* Render connections between nodes */}
          {renderConnections()}
          
          {/* Render nodes */}
          {nodes.map(renderNode)}
          
          {/* Node information popup */}
          {selectedNode && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-blue-950/80 backdrop-blur-sm p-4">
              <Card className="w-full max-w-md animate-fade-in relative bg-blue-900/90 border-blue-700/50 shadow-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-blue-300 hover:text-white hover:bg-blue-800/50"
                  onClick={closePopup}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <CardContent className="p-5">
                  <h4 className="text-lg font-semibold text-blue-100 mb-2 pb-2 border-b border-blue-700/50">
                    {selectedNode.label}
                  </h4>
                  <div className="bg-blue-950/50 p-4 rounded-lg border border-blue-800/30 mb-4">
                    <p className="text-blue-200" dangerouslySetInnerHTML={{ __html: selectedNode.description }}></p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Hierarchy information */}
                    <div>
                      <h5 className="text-sm text-blue-300 mb-2">Position in Document Structure</h5>
                      <div className="flex items-center text-xs space-x-2 bg-blue-900/40 p-2 rounded-md">
                        {selectedNode.level === 0 ? (
                          <span className="text-blue-200">Main Document</span>
                        ) : selectedNode.level === 1 ? (
                          <>
                            <span className="text-blue-200">Main Document</span>
                            <span className="text-blue-400">→</span>
                            <span className="text-primary">{selectedNode.label}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-blue-200">Main Document</span>
                            <span className="text-blue-400">→</span>
                            <span className="text-blue-200">
                              {nodes.find(n => n.id === selectedNode.parent)?.label}
                            </span>
                            <span className="text-blue-400">→</span>
                            <span className="text-primary">{selectedNode.label}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Related topics */}
                    <div>
                      <h5 className="text-sm text-blue-300 mb-2">Related Topics</h5>
                      <div className="flex flex-wrap gap-2">
                        {nodes
                          .filter(node => 
                            (node.parent === selectedNode.parent && node.id !== selectedNode.id) || 
                            node.id === selectedNode.parent ||
                            node.parent === selectedNode.id
                          )
                          .slice(0, 5)
                          .map(node => (
                            <Button 
                              key={node.id}
                              variant="outline" 
                              size="sm"
                              className="bg-blue-800/30 border-blue-700/50 text-blue-200 hover:bg-blue-800/50"
                              onClick={() => setSelectedNode(node)}
                            >
                              {node.label}
                            </Button>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Legend */}
          <div className="absolute bottom-3 right-3 bg-blue-950/70 p-3 rounded-lg shadow-md text-xs backdrop-blur-md border border-blue-800/40">
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
              <span className="text-blue-200">Main Document</span>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 bg-blue-800/50 border border-blue-600/50 rounded-full mr-2"></div>
              <span className="text-blue-200">Primary Topics</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-900/30 border border-blue-700/30 rounded-full mr-2"></div>
              <span className="text-blue-200">Related Concepts</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-950/40 rounded-lg border border-blue-900/30">
          <h4 className="text-sm font-medium mb-3 text-blue-100">How to use</h4>
          <p className="text-xs text-blue-300 mb-2">
            Click on any node to view detailed information. Use the navigation controls to move around the mind map and zoom controls to adjust the view.
          </p>
          <div className="flex gap-2 items-center text-primary text-xs">
            <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
            <span>Interactive visualization - click nodes to explore details and relationships</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindMap;
