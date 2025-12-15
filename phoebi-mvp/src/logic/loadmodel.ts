import * as Three from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import type { ComponentId } from '../types/domain';
import legoBricksUrl from '../assets/blueprint/lego_bricks.glb';
import wheelsUrl from '../assets/blueprint/wheel.glb';
import seat from '../assets/blueprint/bike_seat_concept.glb';
import car_wheel from '../assets/blueprint/car_wheels_and_tire.glb';
import frame2 from '../assets/blueprint/dh_bike_frame.glb';
import handlebar from '../assets/blueprint/handle_bar.glb'

const gltfLoader = new GLTFLoader();

const dracoLoader = new DRACOLoader();

const normalize_value = 5;

dracoLoader.setDecoderPath('/draco/');
gltfLoader.setDRACOLoader(dracoLoader);

const modelCache = new Map<ComponentId, Three.Group>();
const geometryCache = new Map<string, Three.BufferGeometry>();

export function preloadModels(): Promise<void[]> {
    const modelsToLoad: { id: ComponentId; url: string }[] = [
        { id: 'lego', url: legoBricksUrl },
        { id: 'bicycle_wheel', url: wheelsUrl },
        { id: 'seat', url: seat },
        { id: 'car_wheel', url: car_wheel },
        { id: 'frame', url: frame2 },
        { id: 'handlebar', url: handlebar }
    ];

    const promises = modelsToLoad.map(({ id, url }) =>
        new Promise<void>((resolve, reject) => {
            gltfLoader.load(
                url,
                (gltf) => {
                    const model = gltf.scene;

                    normalizeModelScale(model, normalize_value);

                    modelCache.set(id, model);

                    model.traverse((child) => {
                        if (child instanceof Three.Mesh) {
                            const geometryId = `${id}_${child.uuid}`;
                            geometryCache.set(geometryId, child.geometry);
                            (child as any).userData.geometryId = geometryId;
                        }
                    });

                    resolve();
                },
                undefined,
                (error) => {
                    console.error(`Failed to load model for ${id}:`, error);
                    reject(error);
                }
            );
        })
    );

    return Promise.all(promises);
}

export function getCachedGeometry(id: string): Three.BufferGeometry | undefined {
    return geometryCache.get(id)?.clone();
}

export function getCachedModel(id: ComponentId): Three.Group | undefined {
    const originalModel = modelCache.get(id);
    const model = originalModel ? originalModel.clone(true) : createPrimitive(id, normalize_value);
    if (!model) {
        console.error(`No model/primitive for component "${id}"`);
        return undefined;
    }
    return model;
}


function normalizeModelScale(object: Three.Object3D, targetSize = 1) {
    const box = new Three.Box3().setFromObject(object);
    const size = new Three.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim <= 0) return;

    const scale = targetSize / maxDim;
    object.scale.setScalar(scale);

    // center pivot at origin after scaling
    const center = new Three.Vector3();
    box.getCenter(center);
    object.position.sub(center.multiplyScalar(scale));
}

function createPrimitive(id: ComponentId, targetSize = 1): Three.Group | undefined {
    const group = new Three.Group();

    // keep default material; you overwrite it later with your getMaterialForComponent(...)
    const material = new Three.MeshStandardMaterial();

    let geom: Three.BufferGeometry | undefined;

    switch (id) {
        case "box":
            geom = new Three.BoxGeometry(1, 1, 1);
            break;

        case "capsule":
            geom = new Three.CapsuleGeometry(0.5, 1, 8, 16); // r, length, capSegs, radialSegs
            break;

        case "circle":
            geom = new Three.CircleGeometry(0.5, 32);
            break;

        case "cone":
            geom = new Three.ConeGeometry(0.5, 1, 24, 1);
            break;

        case "cylinder":
            geom = new Three.CylinderGeometry(0.5, 0.5, 1, 24, 1);
            break;

        case "dodecahedron":
            geom = new Three.DodecahedronGeometry(0.6, 0);
            break;

        case "icosahedron":
            geom = new Three.IcosahedronGeometry(0.6, 0);
            break;

        case "octahedron":
            geom = new Three.OctahedronGeometry(0.6, 0);
            break;

        case "tetrahedron":
            geom = new Three.TetrahedronGeometry(0.6, 0);
            break;

        case "sphere":
            geom = new Three.SphereGeometry(0.6, 24, 16);
            break;

        case "plane":
            geom = new Three.PlaneGeometry(1, 1, 1, 1);
            break;

        case "ring":
            geom = new Three.RingGeometry(0.25, 0.6, 32, 1);
            break;

        case "torus":
            geom = new Three.TorusGeometry(0.5, 0.18, 16, 48);
            break;

        case "torusKnot":
            geom = new Three.TorusKnotGeometry(0.45, 0.14, 120, 16);
            break;

        case "edges": {
            // edges needs a base geometry
            const base = new Three.BoxGeometry(1, 1, 1);
            geom = new Three.EdgesGeometry(base, 1);
            // EdgesGeometry renders best with LineSegments (not Mesh)
            const lineMat = new Three.LineBasicMaterial();
            const lines = new Three.LineSegments(geom, lineMat);
            group.add(lines);
            normalizeModelScale(group, targetSize);
            return group;
        }

        case "extrude": {
            // simple rounded rectangle-ish shape extruded
            const s = new Three.Shape();
            s.moveTo(-0.4, -0.25);
            s.lineTo(0.4, -0.25);
            s.lineTo(0.4, 0.25);
            s.lineTo(-0.4, 0.25);
            s.closePath();

            geom = new Three.ExtrudeGeometry(s, {
                depth: 0.25,
                bevelEnabled: true,
                bevelThickness: 0.05,
                bevelSize: 0.04,
                bevelSegments: 2,
                steps: 1,
            });
            break;
        }

        case "shape": {
            // a heart-like shape (nice for kids)
            const x = 0, y = 0;
            const shape = new Three.Shape();
            shape.moveTo(x + 0.25, y + 0.25);
            shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
            shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
            shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
            shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
            shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
            shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

            geom = new Three.ShapeGeometry(shape, 32);
            break;
        }

        case "lathe": {
            // vase-like profile
            const pts: Three.Vector2[] = [];
            for (let i = 0; i < 20; i++) {
                const t = i / 19;
                const r = 0.15 + 0.35 * Math.sin(t * Math.PI); // bulge
                const h = -0.5 + t * 1.0;
                pts.push(new Three.Vector2(r, h));
            }
            geom = new Three.LatheGeometry(pts, 32);
            break;
        }

        case "tube": {
            // a simple curve tube
            const points = [
                new Three.Vector3(-0.6, 0.0, 0.0),
                new Three.Vector3(-0.2, 0.3, 0.3),
                new Three.Vector3(0.2, -0.2, 0.2),
                new Three.Vector3(0.6, 0.2, 0.0),
            ];
            const path = new Three.CatmullRomCurve3(points, true, "catmullrom", 0.5);
            geom = new Three.TubeGeometry(path, 80, 0.1, 16, true);
            break;
        }

        case "polyhedron": {
            // A cube as a polyhedron (custom vertices + indices)
            const vertices = [
                -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
                -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
            ];
            const indices = [
                0, 1, 2, 2, 3, 0,  // front
                4, 6, 5, 6, 4, 7,  // back
                4, 5, 1, 1, 0, 4,  // bottom
                7, 3, 2, 2, 6, 7,  // top
                5, 6, 2, 2, 1, 5,  // right
                4, 0, 3, 3, 7, 4,  // left
            ];
            geom = new Three.PolyhedronGeometry(vertices, indices, 0.7, 0);
            break;
        }

        default:
            return undefined;
    }

    const mesh = new Three.Mesh(geom, material);
    group.add(mesh);

    normalizeModelScale(group, targetSize);
    return group;
}
