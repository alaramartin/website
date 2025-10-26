/* todo: game for 404 page

    game idea: catch the falling bugs
    use arrows to move left or right while bugs fall from the sky randomly
    if caught, then get a point.
    if not caught, then lose
    ***have warnings and fatal errors. warnings = 3 makes you lose. fatal errors = lose after 1.
    ^^^ bugicon, yellow, is warning; bugbeetle, red, is fatal
*/

import { BugIcon, BugBeetleIcon } from "@phosphor-icons/react/dist/ssr";

export default function BugCatcherGame() {
    return (
        <div>
            <BugIcon />
            <BugBeetleIcon />
        </div>
    );
}
