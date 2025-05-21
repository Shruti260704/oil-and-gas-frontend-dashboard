
import React, { useEffect } from 'react';
import { FileData } from '../types/files';

const MindMap = ({ file }: { file: FileData }) => {
  useEffect(() => {
    // This would integrate with a real mind mapping library in a production app
    console.log("Rendering mind map for:", file);
  }, [file]);

  // Generate a simple mind map based on file topics
  // In a real implementation, you would use a proper library like react-d3-tree
  const renderMindMap = () => {
    const topics = file.content.topics;
    
    if (!topics || topics.length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-gray-500">No topic structure available for this file</p>
        </div>
      );
    }
    
    return (
      <div className="relative h-[400px] w-full overflow-auto bg-blue-50/50 rounded-lg p-4">
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Center node (file name) */}
          <div className="relative">
            <div className="mind-map-node mind-map-node-parent bg-primary text-white px-4 py-2 rounded-lg shadow">
              {file.name}
            </div>
            
            {/* Topic nodes surrounding the center */}
            <div className="absolute top-[-80px] left-1/2 transform -translate-x-1/2">
              {/* Topic 1 */}
              {topics[0] && (
                <>
                  <div className="mind-map-node">{topics[0]}</div>
                  <svg className="absolute top-[25px] left-1/2 transform -translate-x-1/2" width="2" height="40">
                    <line x1="1" y1="0" x2="1" y2="40" className="mind-map-link" />
                  </svg>
                </>
              )}
            </div>
            
            <div className="absolute left-[-120px] top-0">
              {/* Topic 2 */}
              {topics[1] && (
                <>
                  <div className="mind-map-node">{topics[1]}</div>
                  <svg className="absolute top-[12px] left-[100%]" width="40" height="2">
                    <line x1="0" y1="1" x2="40" y2="1" className="mind-map-link" />
                  </svg>
                </>
              )}
            </div>
            
            <div className="absolute right-[-120px] top-0">
              {/* Topic 3 */}
              {topics[2] && (
                <>
                  <div className="mind-map-node">{topics[2]}</div>
                  <svg className="absolute top-[12px] right-[100%]" width="40" height="2">
                    <line x1="0" y1="1" x2="40" y2="1" className="mind-map-link" />
                  </svg>
                </>
              )}
            </div>
            
            {/* Add subtopics with connections for demonstration */}
            <div className="absolute top-[80px] left-[-60px]">
              {/* Subtopic 1 */}
              <div className="mind-map-node text-xs">Key Metrics</div>
              <svg className="absolute bottom-[100%] left-1/2 transform -translate-x-1/2" width="2" height="25">
                <line x1="1" y1="0" x2="1" y2="25" className="mind-map-link" />
              </svg>
            </div>
            
            <div className="absolute top-[80px] left-[60px]">
              {/* Subtopic 2 */}
              <div className="mind-map-node text-xs">Analysis Results</div>
              <svg className="absolute bottom-[100%] left-1/2 transform -translate-x-1/2" width="2" height="25">
                <line x1="1" y1="0" x2="1" y2="25" className="mind-map-link" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-2 right-2 bg-white p-2 rounded shadow-sm text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
            <span>Main Topic</span>
          </div>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 border border-blue-300 bg-white rounded-full mr-2"></div>
            <span>Subtopic</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mind-map-container">
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <h3 className="text-lg font-medium mb-2">File Structure: {file.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{file.content.summary}</p>
        {renderMindMap()}
        
        <div className="mt-4 bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">Content Topics</h4>
          <ul className="list-disc pl-5 text-sm">
            {file.content.topics.map((topic, index) => (
              <li key={index} className="mb-1">{topic}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MindMap;
