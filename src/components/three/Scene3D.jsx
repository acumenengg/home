import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Edges, Float, Line } from '@react-three/drei';
import * as THREE from 'three';

const STEEL = { color: '#c8d0d8', metalness: 0.92, roughness: 0.18 };
const REBAR = { color: '#FF8C00', metalness: 0.88, roughness: 0.22 };
const SLAB = { color: '#4DA6FF', transparent: true, opacity: 0.14, metalness: 0.6, roughness: 0.35 };
const CONCRETE = { color: '#64748b', metalness: 0.45, roughness: 0.55 };

function RebarRod({ from, to, radius = 0.022 }) {
  const { position, rotation, length } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    const euler = new THREE.Euler().setFromQuaternion(quat);
    return {
      position: [mid.x, mid.y, mid.z],
      rotation: [euler.x, euler.y, euler.z],
      length: len,
    };
  }, [from, to]);

  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial {...REBAR} />
    </mesh>
  );
}

function ColumnRebarCage({ x, z, height, width = 0.35, depth = 0.35 }) {
  const hw = width / 2;
  const hd = depth / 2;
  const corners = [
    [x - hw, z - hd],
    [x + hw, z - hd],
    [x + hw, z + hd],
    [x - hw, z + hd],
  ];
  const tieHeights = [0.15, 0.45, 0.75, 1.05].filter((h) => h < height - 0.1);

  return (
    <group>
      {corners.map(([cx, cz], i) => (
        <RebarRod key={`v-${i}`} from={[cx, 0.05, cz]} to={[cx, height, cz]} />
      ))}
      {tieHeights.map((y, i) => (
        <group key={`tie-${i}`}>
          <RebarRod from={[corners[0][0], y, corners[0][1]]} to={[corners[1][0], y, corners[1][1]]} radius={0.018} />
          <RebarRod from={[corners[1][0], y, corners[1][1]]} to={[corners[2][0], y, corners[2][1]]} radius={0.018} />
          <RebarRod from={[corners[2][0], y, corners[2][1]]} to={[corners[3][0], y, corners[3][1]]} radius={0.018} />
          <RebarRod from={[corners[3][0], y, corners[3][1]]} to={[corners[0][0], y, corners[0][1]]} radius={0.018} />
        </group>
      ))}
    </group>
  );
}

function SteelMember({ position, size, rotation = [0, 0, 0] }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial {...STEEL} />
      <Edges color="#FF8C00" threshold={12} />
    </mesh>
  );
}

function SlabRebarMat({ y, width, depth, spacing = 0.22 }) {
  const bars = useMemo(() => {
    const items = [];
    const countX = Math.floor(width / spacing);
    const countZ = Math.floor(depth / spacing);
    const startX = -width / 2 + spacing / 2;
    const startZ = -depth / 2 + spacing / 2;

    for (let i = 0; i <= countX; i++) {
      const x = startX + i * spacing;
      items.push({ from: [x, y, -depth / 2 + 0.05], to: [x, y, depth / 2 - 0.05] });
    }
    for (let i = 0; i <= countZ; i++) {
      const z = startZ + i * spacing;
      items.push({ from: [-width / 2 + 0.05, y, z], to: [width / 2 - 0.05, y, z] });
    }
    return items;
  }, [y, width, depth, spacing]);

  return (
    <group>
      {bars.map((bar, i) => (
        <RebarRod key={i} {...bar} radius={0.016} />
      ))}
    </group>
  );
}

/** Combined steel frame + rebar cages + BIM wireframe slabs */
function StructuralBIMModel({ detailed = true }) {
  const groupRef = useRef();

  const floors = useMemo(
    () =>
      (detailed ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3]).map((i) => ({
        y: i * 0.62 + 0.08,
        width: 2.4 - i * 0.06,
        depth: 1.8 - i * 0.04,
      })),
    [detailed]
  );

  const columns = useMemo(
    () =>
      detailed
        ? [
            [-0.95, -0.75],
            [0.95, -0.75],
            [0.95, 0.75],
            [-0.95, 0.75],
            [-0.95, 0],
            [0.95, 0],
            [0, -0.75],
            [0, 0.75],
          ]
        : [
            [-0.95, -0.75],
            [0.95, -0.75],
            [0.95, 0.75],
            [-0.95, 0.75],
          ],
    [detailed]
  );

  const totalHeight = floors[floors.length - 1].y + 0.5;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Foundation */}
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[2.6, 0.16, 2.0]} />
        <meshStandardMaterial {...CONCRETE} transparent opacity={0.85} />
        <Edges color="#FF8C00" threshold={15} />
      </mesh>
      <SlabRebarMat y={0.02} width={2.3} depth={1.75} spacing={0.2} />

      {/* Steel columns */}
      {columns.map(([x, z], i) => (
        <SteelMember
          key={`col-${i}`}
          position={[x, totalHeight / 2, z]}
          size={[0.09, totalHeight, 0.09]}
        />
      ))}

      {/* Rebar column cages at corners */}
      {[
        [-0.95, -0.75],
        [0.95, -0.75],
        [0.95, 0.75],
        [-0.95, 0.75],
      ].map(([x, z], i) => (
        <ColumnRebarCage key={`cage-${i}`} x={x} z={z} height={totalHeight - 0.1} width={0.28} depth={0.28} />
      ))}

      {/* Floor slabs + steel beams + slab rebar */}
      {floors.map((floor, i) => {
        const beamY = floor.y + 0.22;
        return (
          <group key={`floor-${i}`}>
            {/* BIM transparent slab */}
            <mesh position={[0, floor.y, 0]}>
              <boxGeometry args={[floor.width, 0.06, floor.depth]} />
              <meshStandardMaterial {...SLAB} />
              <Edges color="#FF8C00" linewidth={1} threshold={10} />
            </mesh>

            {/* Slab rebar reinforcement */}
            <SlabRebarMat y={floor.y + 0.02} width={floor.width - 0.15} depth={floor.depth - 0.15} spacing={detailed ? 0.24 : 0.32} />

            {/* Primary steel beams along width */}
            <SteelMember position={[0, beamY, -floor.depth / 2 + 0.08]} size={[floor.width, 0.07, 0.07]} />
            <SteelMember position={[0, beamY, floor.depth / 2 - 0.08]} size={[floor.width, 0.07, 0.07]} />
            <SteelMember position={[0, beamY, 0]} size={[floor.width, 0.06, 0.06]} />

            {/* Cross beams along depth */}
            <SteelMember
              position={[-floor.width / 2 + 0.08, beamY, 0]}
              size={[0.07, 0.07, floor.depth]}
            />
            <SteelMember
              position={[floor.width / 2 - 0.08, beamY, 0]}
              size={[0.07, 0.07, floor.depth]}
            />

            {/* Diagonal bracing on lower floors */}
            {i < 2 && detailed && (
              <>
                <Line
                  points={[
                    [-floor.width / 2 + 0.1, beamY, -floor.depth / 2 + 0.1],
                    [floor.width / 2 - 0.1, beamY, floor.depth / 2 - 0.1],
                  ]}
                  color="#FF8C00"
                  lineWidth={1.5}
                  transparent
                  opacity={0.7}
                />
                <Line
                  points={[
                    [floor.width / 2 - 0.1, beamY, -floor.depth / 2 + 0.1],
                    [-floor.width / 2 + 0.1, beamY, floor.depth / 2 - 0.1],
                  ]}
                  color="#FF8C00"
                  lineWidth={1.5}
                  transparent
                  opacity={0.7}
                />
              </>
            )}
          </group>
        );
      })}

      {/* Roof steel truss hint */}
      <SteelMember
        position={[0, totalHeight + 0.15, 0]}
        size={[2.0, 0.06, 0.06]}
      />
      <SteelMember
        position={[-0.7, totalHeight + 0.35, 0]}
        size={[0.06, 0.06, 1.2]}
        rotation={[0, 0, 0.55]}
      />
      <SteelMember
        position={[0.7, totalHeight + 0.35, 0]}
        size={[0.06, 0.06, 1.2]}
        rotation={[0, 0, -0.55]}
      />
    </group>
  );
}

function Building({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <StructuralBIMModel />
    </group>
  );
}

function SteelFrame({ position = [0, 0, 0] }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={ref} position={position} scale={0.85}>
        <StructuralBIMModel />
      </group>
    </Float>
  );
}

function RebarGrid({ position = [0, 0, 0] }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3;
    }
  });

  return (
    <group ref={ref} position={position}>
      <ColumnRebarCage x={0} z={0} height={2.2} width={0.9} depth={0.9} />
      <SlabRebarMat y={0.1} width={1.6} depth={1.6} spacing={0.18} />
      <SlabRebarMat y={0.55} width={1.6} depth={1.6} spacing={0.18} />
      {[-0.4, 0, 0.4].map((x) => (
        <SteelMember key={x} position={[x, 1.1, 0]} size={[0.06, 1.4, 0.06]} />
      ))}
    </group>
  );
}

function SceneContent({ variant = 'building', showGrid = true, detailed = true }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 10, 5]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-4, 5, -3]} intensity={0.5} color="#4DA6FF" />
      <pointLight position={[2, 4, 3]} intensity={0.7} color="#FF8C00" />
      <pointLight position={[-2, 2, -2]} intensity={0.35} color="#FF8C00" />

      {variant === 'building' && (
        <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.25}>
          <group scale={0.95}>
            <StructuralBIMModel detailed={detailed} />
          </group>
        </Float>
      )}
      {variant === 'steel' && <SteelFrame />}
      {variant === 'rebar' && <RebarGrid />}
      {variant === 'office' && (
        <>
          <Building scale={0.75} position={[-0.8, 0, 0]} />
          <SteelFrame position={[1.4, 0, 0]} />
        </>
      )}

      {showGrid && (
        <Grid
          position={[0, -0.2, 0]}
          args={[12, 12]}
          cellSize={0.4}
          cellThickness={0.4}
          cellColor="#1e293b"
          sectionSize={1.6}
          sectionThickness={0.8}
          sectionColor="#FF8C00"
          fadeDistance={14}
          fadeStrength={1}
          infiniteGrid
        />
      )}
    </>
  );
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < breakpoint
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [breakpoint]);

  return isMobile;
}

export default function Scene3D({ variant = 'building', className = '', autoRotate = true }) {
  const isMobile = useIsMobile();

  return (
    <div className={`scene-3d ${className}`}>
      <Canvas
        camera={{ position: [3.8, 2.8, 4.8], fov: isMobile ? 48 : 42 }}
        dpr={isMobile ? 1 : [1, 1.5]}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        style={{ background: 'transparent', width: '100%', height: '100%', display: 'block' }}
      >
        <Suspense fallback={null}>
          <SceneContent variant={variant} showGrid={!isMobile} detailed={!isMobile} />
          {autoRotate && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.65}
              maxPolarAngle={Math.PI / 2.1}
              minPolarAngle={Math.PI / 5}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

export { Building, SteelFrame, RebarGrid, StructuralBIMModel };
