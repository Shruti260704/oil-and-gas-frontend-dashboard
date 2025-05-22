
import React, { useEffect, useState } from 'react';
import { FileData } from '../types/files';
import { Network, X } from 'lucide-react';
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
  
  // Generate mind map nodes based on file topics
  useEffect(() => {
    const generateNodes = () => {
      const fileTopics = file.content.topics;
      const rootNode: MindMapNode = {
        id: 'root',
        label: file.name,
        level: 0,
        description: file.content.summary
      };
      
      // Generate top-level nodes from topics
      const topicNodes = fileTopics.map((topic, index) => ({
        id: `topic-${index}`,
        label: topic,
        parent: 'root',
        level: 1,
        description: generateTopicDescription(topic, file)
      }));
      
      // Generate sub-nodes based on data keys
      const dataKeys = Object.keys(file.content.data || {});
      const subNodes: MindMapNode[] = [];
      
      topicNodes.forEach((topicNode, topicIndex) => {
        if (dataKeys[topicIndex]) {
          subNodes.push({
            id: `subtopic-${topicIndex}-0`,
            label: `${dataKeys[topicIndex]} Analysis`,
            parent: topicNode.id,
            level: 2,
            description: `Detailed analysis of ${dataKeys[topicIndex]} in relation to ${topicNode.label}.`
          });
        }
        
        // Add additional context sub-nodes
        subNodes.push({
          id: `subtopic-${topicIndex}-1`,
          label: getRandomSubtopic(topicNode.label),
          parent: topicNode.id,
          level: 2,
          description: `Additional context and information regarding ${topicNode.label} in the document.`
        });
      });
      
      return [rootNode, ...topicNodes, ...subNodes];
    };
    
    setNodes(generateNodes());
  }, [file]);
  
  const getRandomSubtopic = (topic: string) => {
    const subtopics = [
      `${topic} Impact`,
      `${topic} Methodology`,
      `${topic} Future Trends`,
      `${topic} Key Metrics`,
      `${topic} Challenges`
    ];
    return subtopics[Math.floor(Math.random() * subtopics.length)];
  };
  
  const generateTopicDescription = (topic: string, file: FileData) => {
    const descriptions = [
      `${topic} is a critical component discussed in the ${file.name} document. It relates to the core industry metrics and contains valuable insights for operational decisions.`,
      `The document section covering ${topic} presents key findings about industry trends and performance indicators relevant to oil & gas operations.`,
      `${topic} analysis in this document reveals important correlations between operational factors and business outcomes, with supporting data.`,
      `This section examines ${topic} in detail, providing comparative analysis against industry benchmarks and historical performance data.`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const handleNodeClick = (node: MindMapNode) => {
    setSelectedNode(node);
  };
  
  const closePopup = () => {
    setSelectedNode(null);
  };
  
  const renderNode = (node: MindMapNode, index: number) => {
    const levelClasses = {
      0: 'bg-primary text-white',
      1: 'bg-blue-800/50 border-blue-600/50',
      2: 'bg-blue-900/30 border-blue-700/30'
    };
    
    // Calculate position based on level and index
    let positionStyle = {};
    if (node.level === 0) {
      positionStyle = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    } else if (node.level === 1) {
      // Position level 1 nodes in a circle around the root
      const angle = (2 * Math.PI / file.content.topics.length) * index;
      const radius = 150;
      const x = Math.cos(angle) * radius + 50;
      const y = Math.sin(angle) * radius + 50;
      positionStyle = { left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' };
    } else if (node.level === 2) {
      // Find parent position and offset
      const parentNode = nodes.find(n => n.id === node.parent);
      if (parentNode && parentNode.level === 1) {
        const parentIndex = nodes.findIndex(n => n.id === parentNode.id);
        const angle = (2 * Math.PI / file.content.topics.length) * parentIndex;
        const subNodeAngleOffset = (index % 2 === 0) ? -0.3 : 0.3;
        const radius = 230;
        const x = Math.cos(angle + subNodeAngleOffset) * radius + 50;
        const y = Math.sin(angle + subNodeAngleOffset) * radius + 50;
        positionStyle = { left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' };
      }
    }
    
    return (
      <div 
        key={node.id}
        className={`absolute rounded-lg p-3 shadow-lg cursor-pointer transition-all hover:shadow-primary/30 hover:scale-105 ${levelClasses[node.level as keyof typeof levelClasses]}`}
        style={positionStyle}
        onClick={() => handleNodeClick(node)}
      >
        {node.label}
      </div>
    );
  };

  const renderConnections = () => {
    // Draw connections between parent and child nodes
    return nodes
      .filter(node => node.parent)
      .map(node => {
        const child = node;
        const parent = nodes.find(n => n.id === child.parent);
        
        if (!parent) return null;
        
        // Create SVG line between nodes
        return (
          <svg 
            key={`${parent.id}-${child.id}`} 
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <line 
              x1="50%" 
              y1="50%" 
              x2="50%" 
              y2="50%" 
              className="mind-map-link" 
              strokeDasharray={child.level === 2 ? "5,5" : "none"}
            />
          </svg>
        );
      });
  };
  
  return (
    <div className="mind-map-container relative">
      <div className="bg-blue-950/30 rounded-lg p-4 shadow-md mb-4 backdrop-blur-sm border border-blue-900/30">
        <h3 className="text-lg font-medium mb-3 text-blue-100 flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          Content Structure: {file.name}
        </h3>
        <p className="text-sm text-blue-300 mb-6">{file.content.summary}</p>
        
        {/* Mind Map Visualization */}
        <div className="relative h-[500px] w-full overflow-hidden bg-blue-950/40 rounded-lg p-4 backdrop-blur-sm border border-blue-900/30">
          {/* Render connections between nodes */}
          {renderConnections()}
          
          {/* Render nodes */}
          {nodes.map((node, index) => renderNode(node, index))}
          
          {/* Node information popup */}
          {selectedNode && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-blue-950/80 backdrop-blur-sm p-4">
              <Card className="w-full max-w-md relative bg-blue-900/90 border-blue-700/50">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-blue-300 hover:text-white hover:bg-blue-800/50"
                  onClick={closePopup}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <CardContent className="p-5">
                  <h4 className="text-lg font-medium text-blue-100 mb-2">{selectedNode.label}</h4>
                  <div className="bg-blue-950/50 p-4 rounded-lg border border-blue-800/30">
                    <p className="text-blue-200">{selectedNode.description}</p>
                  </div>
                  
                  {selectedNode.level > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm text-blue-300 mb-2">Related Topics</h5>
                      <div className="flex flex-wrap gap-2">
                        {nodes
                          .filter(node => 
                            node.parent === selectedNode.parent || 
                            node.id === selectedNode.parent ||
                            node.parent === selectedNode.id
                          )
                          .filter(node => node.id !== selectedNode.id)
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
                  )}
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
            Click on any node in the mind map to view detailed information and explore relationships between concepts.
          </p>
          <div className="flex gap-2 items-center text-primary text-xs">
            <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
            <span>Interactive visualization - click nodes to explore</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindMap;
