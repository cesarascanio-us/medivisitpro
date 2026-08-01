/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React, { useCallback, useState } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    MarkerType,
    BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2, GitBranch } from 'lucide-react';

interface ProcessDiagramEditorProps {
    initialNodes?: Node[];
    initialEdges?: Edge[];
    onSave?: (nodes: Node[], edges: Edge[]) => void;
    title?: string;
}

const nodeTypes = {
    start: { label: 'Inicio', color: '#22c55e' },
    process: { label: 'Proceso', color: '#3b82f6' },
    decision: { label: 'Decisión', color: '#f59e0b' },
    end: { label: 'Fin', color: '#ef4444' },
    hazard: { label: 'Peligro', color: '#dc2626' },
};

const defaultNodes: Node[] = [
    {
        id: '1',
        type: 'input',
        data: { label: 'Inicio del Proceso' },
        position: { x: 250, y: 0 },
        style: { background: '#22c55e', color: 'white', border: 'none' },
    },
];

const defaultEdges: Edge[] = [];

export const ProcessDiagramEditor: React.FC<ProcessDiagramEditorProps> = ({
    initialNodes = defaultNodes,
    initialEdges = defaultEdges,
    onSave,
    title = 'Diagrama de Proceso',
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNodeType, setSelectedNodeType] = useState<keyof typeof nodeTypes>('process');

    // Sync state with props when process changes
    React.useEffect(() => {
        if (initialNodes) setNodes(initialNodes);
        if (initialEdges) setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) =>
            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        markerEnd: { type: MarkerType.ArrowClosed },
                        style: { strokeWidth: 2 },
                    },
                    eds
                )
            ),
        [setEdges]
    );

    const addNode = useCallback(() => {
        const nodeConfig = nodeTypes[selectedNodeType];
        const newNode: Node = {
            id: `node-${Date.now()}`,
            type: selectedNodeType === 'decision' ? 'default' : 'default',
            data: { label: nodeConfig.label },
            position: {
                x: Math.random() * 400 + 50,
                y: Math.random() * 300 + 100,
            },
            style: {
                background: nodeConfig.color,
                color: 'white',
                border: 'none',
                borderRadius: selectedNodeType === 'decision' ? '0' : '8px',
                transform: selectedNodeType === 'decision' ? 'rotate(45deg)' : 'none',
            },
        };
        setNodes((nds) => [...nds, newNode]);
    }, [selectedNodeType, setNodes]);

    const deleteSelectedNodes = useCallback(() => {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) =>
            eds.filter(
                (edge) =>
                    !nodes.find((n) => n.selected && (n.id === edge.source || n.id === edge.target))
            )
        );
    }, [nodes, setNodes, setEdges]);

    const handleSave = useCallback(() => {
        if (onSave) {
            onSave(nodes, edges);
        }
    }, [nodes, edges, onSave]);

    return (
        <Card className="w-full h-[600px]">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        {title}
                        <span className="ml-2 text-xs text-muted-foreground">
                            (Nodes: {nodes.length}, Edges: {edges.length})
                        </span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedNodeType}
                            onChange={(e) => setSelectedNodeType(e.target.value as keyof typeof nodeTypes)}
                            className="px-3 py-1.5 text-sm border rounded-md bg-background"
                        >
                            {Object.entries(nodeTypes).map(([key, { label }]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <Button variant="outline" size="sm" onClick={addNode}>
                            <Plus className="h-4 w-4 mr-1" />
                            Añadir
                        </Button>
                        <Button variant="outline" size="sm" onClick={deleteSelectedNodes}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-1" />
                            Guardar
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-60px)]">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    attributionPosition="bottom-left"
                >
                    <Controls />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </CardContent>
        </Card>
    );
};

export default ProcessDiagramEditor;
