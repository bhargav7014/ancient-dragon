export interface StageInfo {
  id: string;
  number: string;
  code: string;
  name: string;
  shortName: string;
  frameStart: number;
  frameEnd: number;
  progressStart: number;
  progressEnd: number;
  title: string;
  description: string;
  alignment: 'center' | 'left' | 'right';
}

export const TOTAL_FRAMES = 264;
export const START_FRAME = 7;
export const END_FRAME = 270;

export const STAGES: StageInfo[] = [
  {
    id: 'stage1',
    number: '01',
    code: 'ORIGIN',
    name: 'STAGE 01 // PRIMORDIAL FORM',
    shortName: 'STAGE 01',
    frameStart: 7,
    frameEnd: 70,
    progressStart: 0.12,
    progressEnd: 0.32,
    title: 'Primordial Form',
    description:
      'Before galaxies fully coalesced, the entity slumbered in crystalline stasis. An upright humanoid silhouette harbors ancient furnace cores within an unyielding celestial shell.',
    alignment: 'left',
  },
  {
    id: 'stage2',
    number: '02',
    code: 'AWAKENING',
    name: 'STAGE 02 // CORE IGNITION',
    shortName: 'STAGE 02',
    frameStart: 71,
    frameEnd: 140,
    progressStart: 0.34,
    progressEnd: 0.54,
    title: 'Core Ignition',
    description:
      'Sub-atomic resonance shatters the outer mantle. Blinding thermal energy surges through stellar veins, awakening millenia of dormant astral breath and unleashing primeval heat.',
    alignment: 'right',
  },
  {
    id: 'stage3',
    number: '03',
    code: 'EXPANSION',
    name: 'STAGE 03 // WING SPREAD',
    shortName: 'STAGE 03',
    frameStart: 141,
    frameEnd: 210,
    progressStart: 0.56,
    progressEnd: 0.76,
    title: 'Wing Spread',
    description:
      'Ethereal wings rupture the spacetime fabric, casting auroral shockwaves across the abyss. The creature breaks planetary gravity in sovereign ascent toward the void.',
    alignment: 'left',
  },
  {
    id: 'stage4',
    number: '04',
    code: 'APOTHEOSIS',
    name: 'STAGE 04 // CELESTIAL SOVEREIGN',
    shortName: 'STAGE 04',
    frameStart: 211,
    frameEnd: 270,
    progressStart: 0.78,
    progressEnd: 0.95,
    title: 'Celestial Sovereign',
    description:
      'Total transcendental metamorphosis. The ancient wyrm commands galaxies and cosmic winds — ruler of the boundless void and eternal guardian of astral cycles.',
    alignment: 'right',
  },
];

export function getFramePath(frameNumber: number): string {
  const pad = String(frameNumber).padStart(4, '0');
  return `/frames/frame_${pad}.jpg`;
}
