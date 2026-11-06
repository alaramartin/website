import { Composition, Still } from "remotion";
import { OgFrame } from "./OgFrame";
import { FPS, H, SEED, W, simulate } from "./timeline.ts";

const poses = simulate(SEED);

// The OG image: a level, right-facing stroke from the swim, pinned larger in the top left.
const STILL_FRAME = 694;
const STILL_PLACE = { x: 210, y: 112, scale: 1.5, pitch: 0, bend: 0, phase: 0.65 };

export const Root = () => (
    <>
        <Composition
            id="OgVideo"
            component={OgFrame}
            durationInFrames={poses.length}
            fps={FPS}
            width={W}
            height={H}
            defaultProps={{ poses }}
        />
        <Still id="OgImage" component={OgFrame} width={W} height={H} defaultProps={{ poses, frame: STILL_FRAME, place: STILL_PLACE }} />
    </>
);
