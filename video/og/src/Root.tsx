import { Composition, Still } from "remotion";
import { OgFrame } from "./OgFrame";
import { FPS, H, SEED, W, simulate } from "./timeline.ts";

const poses = simulate(SEED);

// The OG image: the whale pinned large in the top left, level and facing right. Every pose field is
// set here, so it doesn't change when the video's seed does.
const STILL_FRAME = 0;
const STILL_PLACE = { x: 210, y: 112, scale: 1.5, pitch: 0, bend: 0, phase: 0.65, dir: 1, effort: 1 };

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
