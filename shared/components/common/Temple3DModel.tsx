'use client'

import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Spinner } from '../ui'
import { ChevronDown } from 'lucide-react'
import { Box3, Vector3, Color } from 'three'

interface Temple3DModelProps {
  modelPath?: string
  width?: string | number
  height?: string | number
  minHeight?: string | number
  className?: string
}

function TempleFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-temple-maroon to-temple-gold">
      <div className="text-center">
        <div className="text-6xl mb-4">🏛️</div>
        <p className="text-white text-lg font-semibold">Sri Raghavendra Temple</p>
        <p className="text-white/80 text-sm mt-2">3D Model</p>
      </div>
    </div>
  )
}

function ModelContent({ modelPath = '/models/ragaveandra-temple.glb' }: { modelPath: string }) {
  const gltf = useGLTF(modelPath)

  if (!gltf?.scene) {
    return null
  }

  // Clone the scene to avoid mutating the cached geometry
  const clonedScene = gltf.scene.clone()

  // Compute bounding box and center
  const box = new Box3().setFromObject(clonedScene)
  const center = box.getCenter(new Vector3())
  const size = box.getSize(new Vector3())

  // Center the model horizontally and at origin
  clonedScene.position.x = -center.x
  clonedScene.position.y = -center.y
  clonedScene.position.z = -center.z

  return <primitive object={clonedScene} />
}

function Temple3DModelContent({
  modelPath = '/models/ragaveandra-temple.glb',
  width = '100%',
  height = '100%',
  minHeight = '300px',
  className = '',
}: Temple3DModelProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [containerHeight, setContainerHeight] = useState('400px')
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    const isMobileDevice = window.innerWidth < 768
    setIsMobile(isMobileDevice)

    // Set responsive height based on screen size
    if (isMobileDevice) {
      setContainerHeight(window.innerWidth > 480 ? '350px' : '280px')
    } else {
      setContainerHeight('500px')
    }

  }, [modelPath])

  const handleCanvasCreated = (state: any) => {
    // Set background color
    state.scene.background = new Color('#FFF8DC')

    // Give it a moment to render, then hide loading
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  if (error) {
    return (
      <div
        className={`relative rounded-lg overflow-hidden ${className}`}
        style={{
          width,
          height: containerHeight,
          minHeight,
        }}
      >
        <TempleFallback />
      </div>
    )
  }

  return (
    <div>
      <div
        className={`relative overflow-hidden ${className}`}
        style={{
          width,
          height: containerHeight,
          minHeight,
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Spinner />
          </div>
        )}

        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          onCreated={handleCanvasCreated}
          dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
          performance={{ min: 0.5, max: 1 }}
          onError={(error) => {
            console.error('Canvas error:', error)
            setError('Failed to load 3D model')
          }}
        >
          <Suspense fallback={null}>
            <ModelContent modelPath={modelPath} />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            enableRotate
            enableZoom
            autoRotate
            autoRotateSpeed={2}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            target={[0, 0, 0]}
          />

          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        </Canvas>
      </div>

      {/* Instructions Dropdown */}
      <div className="mt-4">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex items-center gap-2 text-xs font-semibold text-temple-maroon/70 hover:text-temple-maroon transition-colors uppercase tracking-wider"
        >
          <span>View Instructions</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-300 ${
              showInstructions ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showInstructions && (
          <div className="mt-3 p-4 bg-white space-y-4">
            {/* Desktop Instructions */}
            <div>
              <p className="text-xs font-semibold text-temple-maroon uppercase tracking-wider mb-2">
                Desktop
              </p>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-temple-gold mt-0.5">•</span>
                  <span><strong>Click & drag</strong> to rotate the temple</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-temple-gold mt-0.5">•</span>
                  <span><strong>Two-finger tap & drag</strong> <span className="text-gray-500">[trackpad]</span> to move the model</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-temple-gold mt-0.5">•</span>
                  <span><strong>Scroll</strong> to zoom in and out</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-temple-gold mt-0.5">•</span>
                  <span><strong>Release</strong> to auto-rotate</span>
                </li>
              </ul>
            </div>

            {/* Mobile Instructions */}
            <div>
              <p className="text-xs font-semibold text-temple-maroon uppercase tracking-wider mb-2">
                Mobile
              </p>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-temple-gold mt-0.5">•</span>
                  <span><strong>Single-finger drag</strong> to rotate the temple</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-temple-gold mt-0.5">•</span>
                  <span><strong>Two-finger drag</strong> to move the model</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-temple-gold mt-0.5">•</span>
                  <span><strong>Pinch</strong> to zoom in and out</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-temple-gold mt-0.5">•</span>
                  <span><strong>Release</strong> to auto-rotate</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Temple3DModel(props: Temple3DModelProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className={`flex items-center justify-center ${props.className}`}>
        <Spinner />
      </div>
    )
  }

  return <Temple3DModelContent {...props} />
}
