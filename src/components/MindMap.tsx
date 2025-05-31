import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FileData } from '../types/files';
import { Network, X, ZoomIn, ZoomOut, Move, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import * as d3 from 'd3';

const API_BASE_URL = 'http://20.151.176.215:8000/api';

type MindMapNode = {
  id: string;
  label: string;
  parent?: string;
  level: number;
  collapsed?: boolean; // New property to track collapse state
  hasChildren?: boolean; // New property to indicate if node has children
};

type MindMapEdge = {
  source: string;
  target: string;
  relation: string;
};

type D3Node = d3.HierarchyNode<MindMapNode> & {
  x: number;
  y: number;
  data: MindMapNode;
};

const MindMap = ({ file }: { file: FileData }) => {
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [edges, setEdges] = useState<MindMapEdge[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('mindmap');
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Add a state to track the current d3 transform
  const [currentTransform, setCurrentTransform] = useState<d3.ZoomTransform | null>(null);

  // Helper functions for caching mind map data
  const getCachedMindMap = (fileId: string) => {
    try {
      const cacheKey = `mindmap_${fileId}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Error retrieving cached mind map:', error);
    }
    return null;
  };

  const cacheMindMap = (fileId: string, data: any) => {
    try {
      const cacheKey = `mindmap_${fileId}`;
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching mind map:', error);
    }
  };

  // Process mind map data from either cache or backend
  const processMindMapData = (data: any) => {
    // Add type assertion to data
    const typedData = data as { nodes: { id: string; label: string; }[]; edges: MindMapEdge[] };
    const backendNodes = typedData.nodes;
    const backendEdges = typedData.edges;

    // Build parent/level info
    const nodeMap: Record<string, MindMapNode> = {};
    backendNodes.forEach((n) => {
      nodeMap[n.id] = { ...n, level: -1, collapsed: true };
    });

    // Find root(s): nodes not targeted by any edge
    const targets = new Set(backendEdges.map((e) => e.target));
    const roots = backendNodes.filter((n) => !targets.has(n.id));
    roots.forEach((root) => {
      nodeMap[root.id].level = 0;
      nodeMap[root.id].collapsed = false; // Root node starts expanded
    });

    // BFS to assign parent and level
    const queue: { id: string; level: number }[] = roots.map((r) => ({ id: r.id, level: 0 }));
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;

      // Find all children for this node
      const children = backendEdges
        .filter((e) => e.source === id)
        .map((e) => e.target);

      // Set hasChildren flag
      nodeMap[id].hasChildren = children.length > 0;

      // Process children
      children.forEach((childId) => {
        if (nodeMap[childId]) {
          nodeMap[childId].parent = id;
          nodeMap[childId].level = level + 1;
          queue.push({ id: childId, level: level + 1 });
        }
      });
    }

    setNodes(Object.values(nodeMap));
    setEdges(backendEdges);
  };

  // Fetch mind map from backend with caching
  const fetchMindMap = async (forceRefresh = false) => {
    setLoading(true);
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedData = getCachedMindMap(file.id);
        if (cachedData) {
          console.log('Using cached mind map data');
          processMindMapData(cachedData);
          setLoading(false);
          return;
        }
      }

      // If cache is empty or refresh is forced, fetch from backend
      setRefreshing(forceRefresh);
      const res = await axios.post(`${API_BASE_URL}/mindmap`, {
        fileId: file.id,
      });

      // Cache the response
      cacheMindMap(file.id, res.data);

      // Process the data
      processMindMapData(res.data);
    } catch (err) {
      console.error('Error fetching mind map:', err);
      setNodes([
        {
          id: 'root',
          label: file.name,
          level: 0,
          collapsed: false,
          hasChildren: false
        },
      ]);
      setEdges([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle manual refresh of mind map
  const handleRefreshMindMap = () => {
    fetchMindMap(true); // Force refresh from backend
  };

  // Load mind map data when file changes
  useEffect(() => {
    fetchMindMap(false); // Use cache if available
  }, [file.id]); // Only depends on file ID

  // Color scale for different node levels
  const levelColors = [
    'url(#gradient-root)', // Level 0
    '#2563eb',             // Level 1
    '#38bdf8',             // Level 2
    '#a21caf',             // Level 3
    '#f59e42',             // Level 4+
  ];

  // Function to handle node collapse/expand with improved transition
  const toggleNodeCollapse = (nodeId: string, event: React.MouseEvent) => {
    // Prevent the event from propagating to avoid triggering node click
    event.stopPropagation();
    event.preventDefault();

    if (!svgRef.current) return;

    // Toggle the collapsed state for the node
    setNodes(currentNodes => {
      const updatedNodes = currentNodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, collapsed: !node.collapsed };
        }
        return node;
      });

      // Immediately update the arrow icon to reflect new state
      const nodeData = updatedNodes.find(n => n.id === nodeId);
      if (nodeData) {
        const arrowElement = svgRef.current?.querySelector(`.collapse-arrow[data-node-id="${nodeId}"] path`);
        if (arrowElement) {
          const newPath = nodeData.collapsed
            ? 'M-4,-4 L4,0 L-4,4'  // Right arrow (collapsed)
            : 'M4,-4 L-4,0 L4,4';  // Left arrow (expanded)
          arrowElement.setAttribute('d', newPath);
        }
      }

      return updatedNodes;
    });
  };

  // Function to get visible nodes based on collapsed state
  const getVisibleNodes = (): MindMapNode[] => {
    const visibleNodes: MindMapNode[] = [];
    // Create a map for quick lookup
    const nodeMap = new Map<string, MindMapNode>();

    // Populate the map for quick lookup
    nodes.forEach(node => nodeMap.set(node.id, node));

    // Check if a node should be visible based on parent's collapsed state
    nodes.forEach(node => {
      // Root nodes or nodes with no parent are always visible
      if (!node.parent) {
        visibleNodes.push(node);
        return;
      }

      // Check if any ancestor is collapsed
      let currentParentId = node.parent;
      let isVisible = true;

      while (currentParentId) {
        const parent = nodeMap.get(currentParentId);
        if (!parent) break;

        if (parent.collapsed) {
          isVisible = false;
          break;
        }

        currentParentId = parent.parent;
      }

      if (isVisible) {
        visibleNodes.push(node);
      }
    });

    return visibleNodes;
  };

  // Get visible edges based on visible nodes
  const getVisibleEdges = (visibleNodes: MindMapNode[]) => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return edges.filter(edge =>
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  };

  // Function to send query to chat
  const sendNodeQuery = (node: MindMapNode) => {
    // Create query from node data
    const query = `Tell me more about "${node.label}" in the context of ${file.name}`;

    // Add query to the chat state directly using a custom event
    if (window && window.dispatchEvent) {
      // Create a custom event with the query data
      const event = new CustomEvent('addQuery', {
        detail: {
          query,
        }
      });

      // Dispatch the event for other components to listen for
      window.dispatchEvent(event);
    }

    // Send the query to the backend directly
    axios.post(`${API_BASE_URL}/query`, {
      query: query,
      fileId: file.id,
      top_k: 100,
      include_images: false,
    }).catch(err => console.error('Error sending query:', err));

    // Store in localStorage for other components
    try {
      localStorage.setItem('pendingQuery', query);
      localStorage.setItem('pendingFileId', file.id);
    } catch (err) {
      console.error('Error storing query in localStorage:', err);
    }

    // Switch to the insights tab
    const insightsTab = document.querySelector('[data-tab="insights"]');
    if (insightsTab && insightsTab instanceof HTMLElement) {
      insightsTab.click();
    } else {
      // Alternative method - try to find tab by text content
      const tabs = document.querySelectorAll('button');
      for (const tab of tabs) {
        if (tab.textContent?.includes('Insights')) {
          tab.click();
          break;
        }
      }
    }
  };

  // Helper function to create a shared zoom behavior
  const createZoomBehavior = () => {
    return d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        // Only update the transform of the container group, don't trigger redraws
        d3.select(svgRef.current).select('g').attr('transform', event.transform);
        setZoomLevel(event.transform.k);
        // Don't update currentTransform here to avoid triggering useEffect
      });
  };

  // Helper function to encapsulate the mind map rendering logic
  const renderMindMap = (visibleNodes: MindMapNode[], visibleEdges: MindMapEdge[]) => {
    if (!svgRef.current || !containerRef.current) return;

    // Get the current transform to preserve view position
    const currentZoom = d3.zoomTransform(svgRef.current);

    // Store previous node positions for transition
    const prevNodePositions = new Map<string, { x: number, y: number }>();

    // Capture existing node positions if SVG already has nodes
    const existingNodes = d3.select(svgRef.current).selectAll('.node');
    if (!existingNodes.empty()) {
      existingNodes.each(function (d: any) {
        // Add explicit type checking to avoid errors
        if (d && d.data && typeof d.data.id === 'string') {
          const transform = d3.select(this).attr('transform');
          const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
          if (match) {
            prevNodePositions.set(d.data.id, {
              x: parseFloat(match[2]),
              y: parseFloat(match[1])
            });
          }
        }
      });
    }

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Get dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Find the root node
    const rootNode = visibleNodes.find(n => n.level === 0);
    if (!rootNode) return;

    // Create node map for quick lookup
    const nodeMap = new Map<string, MindMapNode>();
    nodes.forEach(node => nodeMap.set(node.id, node));

    // Function to get children for a node
    const getChildren = (nodeId: string) => {
      const node = nodeMap.get(nodeId);
      if (node?.collapsed) return [];
      const children = edges
        .filter(e => e.source === nodeId)
        .map(e => nodeMap.get(e.target))
        .filter(Boolean) as MindMapNode[];
      return children;
    };

    // Create hierarchy data
    const hierarchy = d3.hierarchy(rootNode, node => getChildren(node.id));

    // Create tree layout with increased spacing
    const treeLayout = d3.tree<MindMapNode>()
      .size([containerWidth - 100, containerHeight - 100])
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2.5));

    // Generate the tree data
    const treeData = treeLayout(hierarchy);

    // Get nodes and links
    const d3Nodes = treeData.descendants();
    const d3Links = treeData.links();

    // Create SVG container with zoom behavior
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight);

    // Use the shared zoom behavior
    const zoomBehavior = createZoomBehavior();
    svg.call(zoomBehavior);

    // Create a group for the mindmap
    const g = svg.append('g')
      .attr('transform', `translate(${containerWidth / 2}, 50)`)
      .attr('class', 'mindmap-container');

    // Create filter for glow effect
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Create gradients
    const rootGradient = defs.append('linearGradient')
      .attr('id', 'gradient-root')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');

    rootGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6');

    rootGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#60a5fa');

    const childGradient = defs.append('linearGradient')
      .attr('id', 'gradient-child')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');

    childGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#1e40af');

    childGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6');

    // Track which nodes are new or repositioned
    // Compare only nodes that have changed to avoid full redraws
    const changedNodeIds = new Set<string>();
    const toggledNodeIds = new Set<string>();

    // First pass: find nodes that were toggled (collapsed/expanded)
    d3Nodes.forEach(node => {
      // Check if the node exists in the previous map
      const prevPos = prevNodePositions.get(node.data.id);
      if (!prevPos) {
        // New node
        changedNodeIds.add(node.data.id);
        return;
      }
    });

    // Add nodes whose positions changed significantly
    d3Nodes.forEach(node => {
      const prevPos = prevNodePositions.get(node.data.id);
      if (prevPos) {
        // Check if position changed significantly (more than just rounding errors)
        const xDiff = Math.abs(prevPos.x - node.x);
        const yDiff = Math.abs(prevPos.y - node.y);

        if (xDiff > 1 || yDiff > 1) {
          changedNodeIds.add(node.data.id);
          // Also mark parent as changed (likely a toggle event)
          if (node.parent) {
            toggledNodeIds.add(node.parent.data.id);
          }
        }
      }
    });

    // Mark descendants of toggled nodes
    toggledNodeIds.forEach(id => {
      const node = d3Nodes.find(n => n.data.id === id);
      if (node) {
        node.descendants().forEach(desc => {
          changedNodeIds.add(desc.data.id);
        });
      }
    });

    // Draw links - ensuring all visible edges are rendered
    const links = g.append('g')
      .attr('class', 'links')
      .selectAll('.link')
      .data(d3Links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#60a5fa')
      .attr('stroke-width', 2)
      .attr('opacity', 0.4)
      .attr('filter', 'url(#glow)');

    // Set initial positions for links
    links.attr('d', d => {
      const source = d.source as D3Node;
      const target = d.target as D3Node;

      // If this is a new link or connected to a changed node, animate from source
      if (changedNodeIds.has(source.data.id) || changedNodeIds.has(target.data.id)) {
        return `M${source.y},${source.x}
                C${source.y},${source.x}
                 ${source.y},${source.x}
                 ${source.y},${source.x}`;
      } else {
        // Otherwise, show at final position immediately
        return `M${source.y},${source.x}
                C${(source.y + target.y) / 2},${source.x}
                 ${(source.y + target.y) / 2},${target.x}
                 ${target.y},${target.x}`;
      }
    });

    // Transition only changed links
    links.filter(d => {
      const source = d.source as D3Node;
      const target = d.target as D3Node;
      return changedNodeIds.has(source.data.id) || changedNodeIds.has(target.data.id);
    })
      .transition()
      .duration(800)
      .delay((d, i) => i * 20)
      .attr('d', d => {
        const source = d.source as D3Node;
        const target = d.target as D3Node;
        return `M${source.y},${source.x}
              C${(source.y + target.y) / 2},${source.x}
               ${(source.y + target.y) / 2},${target.x}
               ${target.y},${target.x}`;
      })
      .attr('opacity', 0.8);

    // Set all other links to full opacity immediately
    links.filter(d => {
      const source = d.source as D3Node;
      const target = d.target as D3Node;
      return !changedNodeIds.has(source.data.id) && !changedNodeIds.has(target.data.id);
    })
      .attr('opacity', 0.8);

    // Draw nodes with targeted transition
    const nodeGroups = g.append('g')
      .attr('class', 'nodes')
      .selectAll('.node')
      .data(d3Nodes, d => d.data.id)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => {
        // For changed nodes, start from parent's position or current position if it's the root
        if (changedNodeIds.has(d.data.id)) {
          if (d.parent) {
            return `translate(${d.parent.y},${d.parent.x})`;
          }
          return `translate(${d.y},${d.x})`;
        } else {
          // For unchanged nodes, place directly at their final position
          return `translate(${d.y},${d.x})`;
        }
      })
      .attr('opacity', d => changedNodeIds.has(d.data.id) ? 0.4 : 1);

    // Node background rectangles with color coding
    nodeGroups.append('rect')
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('width', d => {
        const level = d.data.level;
        return level === 0 ? 180 : 140;
      })
      .attr('height', 50)
      .attr('x', d => {
        const level = d.data.level;
        return level === 0 ? -90 : -70;
      })
      .attr('y', -25)
      .attr('fill', d => {
        const level = d.data.level;
        if (level === 0) return 'url(#gradient-root)';
        if (level === 1) return '#2563eb';
        if (level === 2) return '#38bdf8';
        if (level === 3) return '#a21caf';
        return '#f59e42';
      })
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('class', 'node-rect')
      .attr('transform', d => {
        // Only apply initial scale to new/affected nodes
        return changedNodeIds.has(d.data.id) ? 'scale(0.8)' : 'scale(1)';
      });

    // Node labels with conditional opacity
    nodeGroups.append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('font-size', d => d.data.level === 0 ? '14px' : '12px')
      .style('font-weight', d => d.data.level === 0 ? 'bold' : 'normal')
      .style('opacity', d => changedNodeIds.has(d.data.id) ? 0 : 1)
      .text(d => {
        const label = d.data.label;
        return label.length > 22 ? label.substring(0, 19) + '...' : label;
      });

    // Add collapse/expand arrows with better handling
    const arrowGroups = nodeGroups.filter(d => {
      // Only show arrow if node has children in data and those children exist in nodeMap
      const children = edges.filter(e => e.source === d.data.id).map(e => nodeMap.get(e.target)).filter(Boolean);
      return children.length > 0;
    })
      .append('g')
      .attr('class', 'collapse-arrow')
      .attr('data-node-id', d => d.data.id)
      .attr('transform', d => {
        const level = d.data.level;
        const width = level === 0 ? 180 : 160;
        return `translate(${width / 2 - 30}, 0)`;
      })
      .style('cursor', 'pointer');

    arrowGroups.append('circle')
      .attr('r', 12)
      .attr('fill', '#2563eb')
      .attr('stroke', '#1d4ed8')
      .attr('stroke-width', 1)
      .attr('opacity', 0.8);

    // Add arrow icons inside circles
    arrowGroups.append('path')
      .attr('d', d => {
        return d.data.collapsed
          ? 'M-4,-4 L4,0 L-4,4' // Right arrow (collapsed)
          : 'M4,-4 L-4,0 L4,4'  // Left arrow (expanded)
      })
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('opacity', 1);

    // Add explicit click handlers to arrow groups with improved event handling
    arrowGroups.on('click', function (event, d) {
      event.stopPropagation();
      event.preventDefault();
      toggleNodeCollapse(d.data.id, event);
    });

    // Pulse effect for arrow buttons
    arrowGroups.select('circle')
      .transition()
      .duration(1500)
      .attr('opacity', 0.6)
      .transition()
      .duration(1500)
      .attr('opacity', 0.9)
      .on('end', function repeat() {
        d3.select(this)
          .transition()
          .duration(1500)
          .attr('opacity', 0.6)
          .transition()
          .duration(1500)
          .attr('opacity', 0.9)
          .on('end', repeat);
      });

    // Apply transitions only to changed nodes
    nodeGroups.filter(d => changedNodeIds.has(d.data.id))
      .transition()
      .duration(800)
      .delay((d, i) => i * 20)
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .attr('opacity', 1)
      .on('end', function () {
        // Use this reference for the D3 selection
        // Capture sendNodeQuery function in closure for the event handler
        const sendQuery = sendNodeQuery;
        d3.select(this).on('click', function (event, d: any) {
          event.stopPropagation();
          // Ensure we have the correct data type
          if (d && d.data) {
            sendQuery(d.data);
          }
        });
      });

    // Add click events to all non-transitioning nodes immediately
    nodeGroups.filter(d => !changedNodeIds.has(d.data.id))
      .on('click', function (event, d: any) {
        event.stopPropagation();
        // Ensure we have the correct data type
        if (d && d.data) {
          sendNodeQuery(d.data);
        }
      });

    // Animate rectangles to final size (only for changed nodes)
    nodeGroups.filter(d => changedNodeIds.has(d.data.id))
      .select('rect')
      .transition()
      .duration(600)
      .delay((d, i) => i * 20 + 200)
      .attr('transform', 'scale(1)');

    // Fade in text (only for changed nodes)
    nodeGroups.filter(d => changedNodeIds.has(d.data.id))
      .select('text')
      .transition()
      .duration(400)
      .delay((d, i) => i * 20 + 400)
      .style('opacity', 1);

    // Restore the previous transform
    svg.call(zoomBehavior.transform as any, currentZoom);
  };

  // Render the D3 mind map, but only when nodes or edges change
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || loading || nodes.length === 0) return;

    const visibleNodes = getVisibleNodes();
    const visibleEdges = getVisibleEdges(visibleNodes);
    renderMindMap(visibleNodes, visibleEdges);

    // Clean up function
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).on('.zoom', null);
      }
    };
  }, [nodes, edges, loading]); // Remove currentTransform dependency

  // Handle zoom buttons with the shared zoom behavior
  const handleZoomIn = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = createZoomBehavior();

    svg.transition().duration(300).call(
      zoom.scaleBy as any, 1.2
    );
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = createZoomBehavior();

    svg.transition().duration(300).call(
      zoom.scaleBy as any, 0.8
    );
  };

  const handleResetView = () => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = createZoomBehavior();

    const containerWidth = containerRef.current.clientWidth;
    svg.transition().duration(300).call(
      zoom.transform as any,
      d3.zoomIdentity.translate(containerWidth / 2, 50)
    );
  };

  return (
    <div className="mind-map-container relative">
      <div className="bg-blue-950/30 rounded-lg p-3 md:p-4 shadow-md backdrop-blur-sm border border-blue-900/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 md:mb-4">
          <h3 className="text-lg font-medium text-blue-100 flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            <span className="truncate max-w-[180px] sm:max-w-[300px] md:max-w-none">
              File: {file.name}
            </span>
          </h3>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-900/40 border-blue-800/40 hover:bg-blue-800/60 text-xs sm:text-sm flex-1 sm:flex-none"
              onClick={handleRefreshMindMap}
              disabled={loading || refreshing}
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Updating...' : 'Refresh Map'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-900/40 border-blue-800/40 hover:bg-blue-800/60 text-xs sm:text-sm flex-1 sm:flex-none px-2 sm:px-3"
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1" />
              <span className="hidden xs:inline">Zoom In</span>
              <span className="xs:hidden">+</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-900/40 border-blue-800/40 hover:bg-blue-800/60 text-xs sm:text-sm flex-1 sm:flex-none px-2 sm:px-3"
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1" />
              <span className="hidden xs:inline">Zoom Out</span>
              <span className="xs:hidden">-</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-900/40 border-blue-800/40 hover:bg-blue-800/60 text-xs sm:text-sm flex-1 sm:flex-none"
              onClick={handleResetView}
            >
              <Move className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1 hidden xs:inline-block" />
              Center
            </Button>
          </div>
        </div>
        <div
          ref={containerRef}
          className="relative mx-auto"
          style={{
            width: '100%',
            height: 'min(70vh, 600px)', // Responsive height
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0f172a 60%, #1e293b 100%)',
            borderRadius: '1rem',
            border: '1px solid #334155',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-30 bg-blue-950/70">
              <span className="text-blue-200 text-sm sm:text-lg">Loading Mind Map...</span>
            </div>
          )}
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            className="cursor-grab active:cursor-grabbing touch-manipulation"
          />
          {/* Legend - hidden on very small screens */}
          <div className="absolute bottom-3 right-3 bg-blue-950/70 p-2 sm:p-3 rounded-lg shadow-md text-[10px] xs:text-xs backdrop-blur-md border border-blue-800/40 max-w-[140px] sm:max-w-none">
            <div className="flex items-center mb-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full mr-1 sm:mr-2"></div>
              <span className="text-blue-200 truncate">Main Document</span>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-800/50 border border-blue-600/50 rounded-full mr-1 sm:mr-2"></div>
              <span className="text-blue-200 truncate">Primary Topics</span>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-4 h-3 sm:w-6 sm:h-4 flex items-center justify-center bg-blue-950 rounded-full mr-1 sm:mr-2">
                <ChevronRight className="h-2 w-2 sm:h-3 sm:w-3 text-blue-300" />
              </div>
              <span className="text-blue-200 truncate">Expandable Topic</span>
            </div>
          </div>
        </div>
        <div className="mt-3 md:mt-4 p-3 md:p-4 bg-blue-950/40 rounded-lg border border-blue-900/30">
          <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-blue-100">How to use</h4>
          <p className="text-[10px] xs:text-xs text-blue-300 mb-2">
            Click on any node to query about that topic and view insights. Click on arrow buttons to expand or collapse nodes. Drag to pan the view, use mouse wheel or buttons to zoom.
          </p>
          <div className="flex gap-2 items-center text-primary text-[10px] xs:text-xs">
            <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full"></span>
            <span>Interactive visualization - explore topics and their relationships</span>
          </div>
          <div className="flex gap-2 items-center text-blue-300 text-[10px] xs:text-xs mt-1">
            <RefreshCw className="h-2 w-2 sm:h-3 sm:w-3 text-blue-400" />
            <span>Click "Refresh Map" to generate an updated mind map from the backend</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindMap;
