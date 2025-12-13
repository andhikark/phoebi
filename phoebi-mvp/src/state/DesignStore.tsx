import {create} from 'zustand';
import type { ComponentId, MaterialId } from '../types/domain';
import { v4 as uuidv4 } from 'uuid';

export interface SceneObject {
    uuid: string;
    componentId: ComponentId;
    materialId: MaterialId;
}

interface DesignState {
    objects: SceneObject[];
    selectedObjectId: string | null;

    addObject: (componentId: ComponentId, materialId: MaterialId) => void;
    setSelectedObject: (uuid: string) => void;
    deleteSelectedObject: () => void;
    setMaterialForSelected: (materialId: MaterialId) => void;
}

export const useDesignStore = create<DesignState>((set) => ({
    objects: [],
    selectedObjectId: null,

    addObject: (componentId, materialId) => set((state) => {
        const newObject: SceneObject = {
            uuid: uuidv4(),
            componentId,
            materialId,
        };
        return { 
            objects: [...state.objects, newObject],
            selectedObjectId: newObject.uuid
        };
    }),

    setSelectedObject: (uuid) => set({ selectedObjectId: uuid }),

    deleteSelectedObject: () => set((state) => {
        if (!state.selectedObjectId) return {};
        return {
            objects: state.objects.filter(obj => obj.uuid !== state.selectedObjectId),
            selectedObjectId: null,
        };
    }),

    setMaterialForSelected: (materialId) => set((state) => {
        if (!state.selectedObjectId) return {};
        return {
            objects: state.objects.map(obj => 
                obj.uuid === state.selectedObjectId 
                ? { ...obj, materialId: materialId } 
                : obj
            ),
        };
    }),
}));