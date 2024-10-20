import http from 'http';
import { App, FileSystemAdapter, FileView, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf } from 'obsidian';
import path from 'path';
import { handlePost } from './handler';
import { createServer } from './server';
import { MangaReaderSettings } from './types';

const DEFAULT_SETTINGS: MangaReaderSettings = {
  host: '127.0.0.1',
  port: 7000,
};

export default class MangaReader extends Plugin {
  settings!: MangaReaderSettings;
  basePath!: string;
  server!:http.Server;
  map!: Record<string, string>;

  async onunload(): Promise<void> {
    if (this.server) {
      this.server.close();
    }
    if (this.map) {
      this.saveData(this.map);
    }
  }

  getBasePath() {
    if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
      throw new Error('Failed get base path');
    }

    return this.app.vault.adapter.getBasePath();
  }

  writeFile(path: string, data: Buffer) {
    if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
      throw new Error('Failed write file');
    }

    return this.app.vault.adapter.writeBinary(path, data);
  }

  readFile(entry: string|TFile) {
    const file = typeof entry === 'string' ? this.app.vault.getFileByPath(entry) : entry;
    if (!file) {
      throw new Error('Reading file failed: File not found');
    }

    return this.app.vault.readBinary(file);
  }

  pluginFile (filename: string, _absolute = false) {
    const filePath = path.resolve(
      this.basePath,
      this.app.vault.configDir,
      'plugins',
      'manga-reader',
      filename,
    );

    return filePath;
  }

  isPluginFileExist(filename: string) {
    return Boolean(
      this.pluginFile(filename),
    );
  }

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addSettingTab(new MangaReaderSettingsTab(this.app, this));
    this.basePath = this.getBasePath();
    const map:Record<string, string> = await this.loadData() ?? {};
    this.map = map;

    this.registerMarkdownPostProcessor((element, context) => {
      if (!context.frontmatter) {
        return;
      }
      const { frontmatter } = context;
      if (!frontmatter.tags) {
        return;
      }
      const tags:string[] = frontmatter.tags;

      if (!tags.includes('manga-chapter')) {
        return;
      }

      const tryOpenChapter = async (name: string) => {
        if (!(name in map)) {
          return console.error('Target chapter data not found');
        }
        const targetPath = map[name];
        {
          const targetOpenedLeaf = await (new Promise<WorkspaceLeaf|undefined>((resolve) => {
            this.app.workspace.iterateAllLeaves((leaf) => {
              if (!(leaf.view instanceof FileView)) {
                return;
              }
              const { file } = leaf.view;
              if (!file) {
                return;
              }
              if (file.path !== targetPath) {
                return;
              }

              resolve(leaf);
            });

            resolve(undefined);
          }));

          if (targetOpenedLeaf) {
            return this.app.workspace.setActiveLeaf(targetOpenedLeaf);
          }
        }

        const targetFile = this.app.vault.getFileByPath(targetPath);
        if (!targetFile) {
          return console.error('Target chapter not found');
        }

        const activeLeaf = this.app.workspace.getLeaf();
        return activeLeaf.openFile(targetFile);
      };

      const prevButton = <HTMLButtonElement>element.find('button#prev-button');
      if (prevButton) {
        prevButton.onclick = () => tryOpenChapter(prevButton.name);
      }
      const nextButton = <HTMLButtonElement>element.find('button#next-button');
      if (nextButton) {
        nextButton.onclick = () => tryOpenChapter(nextButton.name);
      }
    });

    this.registerEvent(this.app.vault.on('delete', (file) => {
      if (path.extname(file.name) !== '.md') {
        return;
      }
      for (const key in map) {
        if (map[key] === file.path) {
          delete map[key];
        }
      }
    }));

    const {
      host,
      port,
    } = this.settings;

    // Create the server
    this.server = createServer(
      {
        post: handlePost(this.app, this.map),
      },
      {
        staticFolder: this.pluginFile('static', true),
      },
    );

    // Start the server
    this.server.listen(
      port,
      host,
      () => {
        const address = this.server.address();
        if (!address || typeof address === 'string') {
          throw new Error('Failed to get server address');
        }
        const serverPost = address.port;
        const item = this.addStatusBarItem();
        item.createEl('span', { text: `[Manga Reader: ${host}:${port}]` });

        console.log(`Manga reader running at https://127.0.0.1:${serverPost}`);
      },
    );
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettinsg() {
    await this.saveData(this.settings);
  }
}

class MangaReaderSettingsTab extends PluginSettingTab {
  plugin: MangaReader;

  constructor(app: App, plugin: MangaReader) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    const title = containerEl.createEl('h1', { text: 'Manga Reader Settings' });
    containerEl.append(title);

    new Setting(containerEl)
      .setName('Host')
      .setDesc('host address to listen manga reading request')
      .addText((text) => text
        .setPlaceholder('host')
        .setValue(this.plugin.settings.host ?? ''),
      );

    new Setting(containerEl)
      .setName('Port')
      .setDesc('port number to listen manga reading request')
      .addText((text) => {
        text.inputEl.type = 'number';
        text
          .setPlaceholder('host')
          .setValue(`${this.plugin.settings.port ?? 7000}`);
      });
  }
}
