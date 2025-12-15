// src/data/components.ts
// src/data/components.ts
import type { ComponentDef } from "../types/domain";
import frameIcon from "../assets/components/frame.png";
import wheelIcon from "../assets/components/wheel.png";
import seatIcon from "../assets/components/seat.png";
import handlebarIcon from "../assets/components/handlebar.png";
import legoIcon from "../assets/components/piece.png";
import carWheelIcon from "../assets/components/car.png";
import boxIcon from "../assets/icons/cube.png"
import sphereIcon from "../assets/icons/sphere.png"
import cylinderIcon from "../assets/icons/cylinder.png"
import coneIcon from "../assets/icons/cone.png"
import capsuleIcon from "../assets/icons/capsule.png"
import torusIcon from "../assets/icons/torus.png"
import torusKnotIcon from "../assets/icons/torus.png"
import tetrahedronIcon from "../assets/icons/tetrahedron.png"
import octahedronIcon from "../assets/icons/octahedron.png"
import dodecahedronIcon from "../assets/icons/dodecahedron.png"
import icosahedronIcon from "../assets/icons/icosahedron.png"
import tubeIcon from "../assets/icons/pvc-pipes.png"


export const COMPONENTS: ComponentDef[] = [
  {
    id: "frame",
    name: "Frame",
    icon: frameIcon,
    volumeFactor: 3,
    allowedMaterials: ["wood", "cardboard", "plastic", "metal", "recycled_plastic"],
  },
  {
    id: "bicycle_wheel",
    name: "Wheels",
    icon: wheelIcon,
    volumeFactor: 2,
    allowedMaterials: ["plastic", "metal", "recycled_plastic"],
  },
  {
    id: "seat",
    name: "Seat",
    icon: seatIcon,
    volumeFactor: 1,
    allowedMaterials: ["wood", "cardboard", "plastic", "recycled_plastic"],
  },
  {
    id: "handlebar",
    name: "Handlebar",
    icon: handlebarIcon,
    volumeFactor: 1,
    allowedMaterials: ["wood", "plastic", "metal", "recycled_plastic"],
  },
  {
    id: "lego",
    name: "Lego",
    icon: legoIcon,
    volumeFactor: 1,
    allowedMaterials: ["plastic"],
  },
  {
    id: "car_wheel",
    name: "Car wheel",
    icon: carWheelIcon,
    volumeFactor: 1,
    allowedMaterials: ["plastic"],
  },
  {
    id: "box",
    name: "Box",
    icon: boxIcon,
    volumeFactor: 1,
    allowedMaterials: ["wood", "plastic", "metal", "cardboard", "recycled_plastic"],
  },
  {
    id: "sphere",
    name: "Sphere",
    icon: sphereIcon,
    volumeFactor: 1,
    allowedMaterials: ["plastic", "metal", "recycled_plastic"],
  },
  {
    id: "cylinder",
    name: "Cylinder",
    icon: cylinderIcon,
    volumeFactor: 1,
    allowedMaterials: ["plastic", "metal", "wood", "recycled_plastic"],
  },
  {
    id: "cone",
    name: "Cone",
    icon: coneIcon,
    volumeFactor: 1,
    allowedMaterials: ["plastic", "metal", "recycled_plastic"],
  },
  {
    id: "capsule",
    name: "Capsule",
    icon: capsuleIcon,
    volumeFactor: 1,
    allowedMaterials: ["plastic", "recycled_plastic"],
  },
  {
    id: "torus",
    name: "Torus",
    icon: torusIcon,
    volumeFactor: 1,
    allowedMaterials: ["plastic", "metal", "recycled_plastic"],
  },
  {
    id: "torusKnot",
    name: "Torus Knot",
    icon: torusKnotIcon,
    volumeFactor: 2,
    allowedMaterials: ["plastic", "metal"],
  },

  // =========================
  // Polyhedra (math shapes)
  // =========================
  {
    id: "tetrahedron",
    name: "Tetrahedron",
    icon: tetrahedronIcon,
    volumeFactor: 1,
    allowedMaterials: ["plastic", "metal"],
  },
  {
    id: "octahedron",
    name: "Octahedron",
    icon: octahedronIcon,
    volumeFactor: 1,
    allowedMaterials: ["plastic", "metal"],
  },
  {
    id: "dodecahedron",
    name: "Dodecahedron",
    icon: dodecahedronIcon,
    volumeFactor: 2,
    allowedMaterials: ["plastic", "metal"],
  },
  {
    id: "icosahedron",
    name: "Icosahedron",
    icon: icosahedronIcon,
    volumeFactor: 2,
    allowedMaterials: ["plastic", "metal"],
  },

  // =========================
  // Advanced / procedural
  // (recommend hide by default)
  // =========================
  {
    id: "tube",
    name: "Tube",
    icon: tubeIcon,
    volumeFactor: 2,
    allowedMaterials: ["plastic", "metal"],
  },
];
