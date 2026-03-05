export default {
    transform: {
        "^.+\\.tsx?$": ["ts-jest", { useESM: true }]
    },
    extensionsToTreatAsEsm: [".ts", ".tsx"], // Treat TypeScript files as ES modules
    preset:'ts-jest',
    testEnvironment: 'node'
};