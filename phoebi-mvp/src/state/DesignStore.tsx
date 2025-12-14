import {create} from 'zustand';
import type { ComponentId, MaterialId } from '../types/domain';
import { v4 as uuidv4 } from 'uuid';

export interface SceneMesh {
    type: 'mesh';
    uuid: string;
    componentId: ComponentId;
    materialId: MaterialId;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
}

export interface SceneGroup { 
    type: 'group'; 
    uuid: string; 
    children: SceneMesh[];
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
}

export type SceneItem = SceneMesh | SceneGroup;

interface DesignState {
    sceneItems: SceneItem[]; 
    selectedItemId: string | null; 

    addObject: (componentId: ComponentId, materialId: MaterialId) => void;
    setSelectedItemId: (uuid: string) => void;
    deleteSelectedItem: () => void;
    setMaterialForSelected: (materialId: MaterialId) => void;
    glueObjects: (groupData: SceneGroup, originalUuids: [string, string]) => void; 
    ungroupSelectedItem: () => void;
    updateItemTransform: (uuid: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
}

export const useDesignStore = create<DesignState>((set) => ({
    sceneItems: [],
    selectedItemId: null,

    addObject: (componentId, materialId) => set((state) => {
        const newObject: SceneMesh = {
            type: 'mesh', 
            uuid: uuidv4(),
            componentId,
            materialId,
        };
        return { 
            sceneItems: [...state.sceneItems, newObject],
            selectedItemId: newObject.uuid
        };
    }),

    setSelectedItemId: (uuid) => set({ selectedItemId: uuid }),

    deleteSelectedItem: () => set((state) => {
        if (!state.selectedItemId) return {};
        return {
            sceneItems: state.sceneItems.filter(item => item.uuid !== state.selectedItemId),
            selectedItemId: null,
        };
    }),

    setMaterialForSelected: (materialId) => set((state) => {
        if (!state.selectedItemId) return {};
        return {
            sceneItems: state.sceneItems.map(item => {
                if (item.uuid !== state.selectedItemId) {
                    return item;
                }

                if (item.type === 'mesh') { 
                    return { ...item, materialId: materialId }; 
                } 
                
                if (item.type === 'group') { 
                    // Apply material to all children of the group 
                    const updatedChildren = item.children.map(child => ({ 
                        ...child, 
                        materialId: materialId 
                    })); 
                    return { ...item, children: updatedChildren }; 
                } 

                return item; 
            }),
        };
    }),

    glueObjects: (groupData, originalUuids) => set(state => { 
        // Remove the original top-level items (which could be meshes or groups) 
        const remainingItems = state.sceneItems.filter(item => !originalUuids.includes(item.uuid)); 
        
        return { 
            sceneItems: [...remainingItems, groupData], 
            selectedItemId: groupData.uuid, // Select the new group 
        }; 
    }),
    ungroupSelectedItem: () => set(state => { 
        if (!state.selectedItemId) return {}; 

        const selectedItem = state.sceneItems.find(item => item.uuid === state.selectedItemId); 

        // Only proceed if the selected item is a group 
        if (!selectedItem || selectedItem.type !== 'group') { 
            return {}; 
        } 

        const group = selectedItem as SceneGroup; 
        const groupPosition = group.position || [0, 0, 0]; 

        // Unpack children and calculate their new world positions. 
        // Note: This simplified calculation assumes the group is not rotated. 
        const unpackedChildren: SceneMesh[] = group.children.map(child => { 
            const childPosition = child.position || [0, 0, 0]; 
            const newWorldPosition: [number, number, number] = [ 
                groupPosition[0] + childPosition[0], 
                groupPosition[1] + childPosition[1], 
                groupPosition[2] + childPosition[2], 
            ]; 
            return { ...child, position: newWorldPosition }; 
        }); 

        // Remove the old group and add the unpacked children back to the main list 
        const remainingItems = state.sceneItems.filter(item => item.uuid !== group.uuid); 

        return { 
            sceneItems: [...remainingItems, ...unpackedChildren], 
            selectedItemId: null, // Deselect after ungrouping 
        }; 
    }),
    updateItemTransform: (uuid, position, rotation, scale) => set(state => ({
        sceneItems: state.sceneItems.map(item => {
            if (item.uuid === uuid) {
                return { ...item, position, rotation, scale };
            }
            return item;
        })
    }))
}));