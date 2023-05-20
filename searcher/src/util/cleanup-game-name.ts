export const cleanupGameName = (name: string) =>
    name
        .replace(/:|™|®|-|\(|\)/g, '')
        .toLowerCase();
