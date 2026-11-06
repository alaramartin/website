import path from "node:path";
import { Config } from "@remotion/cli/config";

// The site's whale code imports its data as "@/app/data/whaleInk.json".
Config.overrideWebpackConfig((config) => ({
    ...config,
    resolve: {
        ...config.resolve,
        alias: {
            ...(config.resolve?.alias ?? {}),
            "@": path.resolve(process.cwd(), "../../src"),
            // ...and its React would otherwise resolve to the site's copy: keep to one React.
            react: path.resolve(process.cwd(), "node_modules/react"),
            "react-dom": path.resolve(process.cwd(), "node_modules/react-dom"),
        },
    },
}));
Config.setVideoImageFormat("png");
