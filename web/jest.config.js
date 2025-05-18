export default {
    transform: {
        "^.+\\.tsx?$": "ts-jest", // Use ts-jest to handle TypeScript files
    },
    extensionsToTreatAsEsm: [".ts", ".tsx"], // Treat TypeScript files as ES modules
};