import { create } from 'zustand';
import type { ComponentId, MaterialId } from '../types/domain';
import { v4 as uuidv4 } from 'uuid';

export interface SceneObject {
  type: 'object';                 // 👈 NEW
  uuid: string;
  componentId: ComponentId;        // bicycle_wheel, frame, etc
  materialId: MaterialId;

  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface SceneGroup {
  type: 'group';
  uuid: string;
  children: SceneItem[];
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export type SceneItem = SceneObject | SceneGroup;

interface DesignState {
  sceneItems: SceneItem[];
  selectedItemId: string | null;

  addObject: (componentId: ComponentId, materialId: MaterialId, transform?: {
      position?: [number, number, number];
      rotation?: [number, number, number];
      scale?: [number, number, number];
    }) => void;
  addGroup: (group: SceneGroup) => void;
  setSelectedItemId: (uuid: string) => void;
  deleteSelectedItem: () => void;
  setMaterialForSelected: (materialId: MaterialId) => void;
  glueObjects: (groupData: SceneGroup, originalUuids: [string, string]) => void;
  deglueObject: (groupUuid: string, childrenWorld: SceneObject[]) => void;
  updateItemTransform: (uuid: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  sceneItems: [],
  selectedItemId: null,

  addObject: (
    componentId,
    materialId,
    transform?: {
      position?: [number, number, number];
      rotation?: [number, number, number];
      scale?: [number, number, number];
    }
  ) =>
    set((state) => {
      const newObject: SceneObject = {
        type: "object",
        uuid: uuidv4(),
        componentId,
        materialId,
        position: transform?.position,
        rotation: transform?.rotation,
        scale: transform?.scale,
      };

      return {
        sceneItems: [...state.sceneItems, newObject],
        selectedItemId: newObject.uuid,
      };
    }),


  setSelectedItemId: (uuid) => set({ selectedItemId: uuid }),

  deleteSelectedItem: () => set((state) => {
    if (!state.selectedItemId) return {};
    return {
      sceneItems: state.sceneItems.filter((item) => item.uuid !== state.selectedItemId),
      selectedItemId: null,
    };
  }),

  setMaterialForSelected: (materialId) => set((state) => {
    if (!state.selectedItemId) return {};

    const applyMaterial = (item: SceneItem): SceneItem => {
      if (item.type === "object") {
        return item.uuid === state.selectedItemId ? { ...item, materialId } : item;
      }
      return {
        ...item,
        children: item.children.map(applyMaterial),
      };
    };

    return { sceneItems: state.sceneItems.map(applyMaterial) };
  }),

  glueObjects: (groupData, originalUuids) => set((state) => {
    const remainingItems = state.sceneItems.filter(
      (item) => !originalUuids.includes(item.uuid)
    );
    return {
      sceneItems: [...remainingItems, groupData],
      selectedItemId: groupData.uuid,
    };
  }),
  deglueObject: (groupUuid: string, childrenWorld: SceneObject[]) =>
    set((state) => ({
      sceneItems: state.sceneItems.flatMap((item) => {
        if (item.type !== "group" || item.uuid !== groupUuid) return [item];
        return childrenWorld;
      }),
      selectedItemId: null,
    })),
  updateItemTransform: (uuid, position, rotation, scale) => set((state) => ({
    sceneItems: state.sceneItems.map((item) => {
      if (item.uuid === uuid) return { ...item, position, rotation, scale };

      // Optional: if you might transform groups too
      if (item.type === "group" && item.uuid === uuid) {
        return { ...item, position, rotation, scale };
      }

      return item;
    }),
  })),
  addGroup: (group) =>
  set((state) => ({
    sceneItems: [...state.sceneItems, group],
    selectedItemId: group.uuid,
  })),
}));