import { App } from "obsidian";
import { CreateItemOptions } from "./types";

export async function createFolderIfNotExist(
  app: App,
  path: string,
  {
    parent = false,
  }: CreateItemOptions,
) {
  if (parent) {
    const parentPath = path.split('/').slice(0, -1).join('/');
    if (parentPath !== '') {
      await createFolderIfNotExist(app, parentPath, { parent });
    }
  }

  const folder = app.vault.getFolderByPath(path);
  if (folder) {
    return folder;
  }

  return app.vault.createFolder(path);
}
