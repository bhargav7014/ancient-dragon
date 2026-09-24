# 3D Dragon Model Directory

Place your 3D dragon model here:
`public/models/dragon.glb`

## Model Specifications:
- **Format**: `.glb` (preferred, self-contained binary) or `.gltf`
- **File size**: Recommended < 15MB (Draco compressed if possible)
- **Scale**: Centered at origin `(0, 0, 0)`, normalized bounding box ~ 3 to 4 units
- **Lighting / Materials**: PBR (Roughness / Metalness), emissive maps for glowing runes/veins
- **Animations (optional)**: Embedded clips like `idle`, `transform`, `roar`, `wings` will automatically bind to scroll scrub progress.

## Automatic Fallback Behavior:
The application dynamically detects if `public/models/dragon.glb` is available.
- When `dragon.glb` is present: The React Three Fiber 3D scene renders the true 3D model with real-time lighting, bone animation, camera choreography, and scroll scrub.
- When `dragon.glb` is absent: The site gracefully runs the high-performance 264-frame evolution sequence with zero errors and smooth GSAP ScrollTrigger synchronization.
