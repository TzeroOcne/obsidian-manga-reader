import http from 'http';
import { App, FileSystemAdapter, Plugin, PluginSettingTab, Setting } from 'obsidian';
import path from 'path';
import { handlePost } from './handler';
import { createServer } from './server';
import { MangaReaderSettings } from './types';
import initSqlJs from 'sql.js';

const DEFAULT_SETTINGS: MangaReaderSettings = {
  host: '127.0.0.1',
  port: 7000,
};

let server:http.Server|undefined;

export default class MangaReader extends Plugin {
  settings!: MangaReaderSettings;
  basePath!: string;

  async onunload(): Promise<void> {
    if (server) {
      server.close();
    }
  }

  getBasePath() {
    if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
      throw new Error('Failed get base path');
    }

    return this.app.vault.adapter.getBasePath();
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

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addSettingTab(new MangaReaderSettingsTab(this.app, this));
    this.basePath = this.getBasePath();

    // Create the server
    server = createServer({
      post: handlePost(this.app),
    }, this.pluginFile('static', true));

    //console.log(this.pluginFile('sql-wasm.wasm', true));
    initSqlJs({
      locateFile: _file => 'http://127.0.0.1:7000/static/sql-wasm.wasm',
    }).then(console.log).catch(console.error);

    // Specify the port and host
    const {
      host,
      port,
    } = this.settings;

    // Start the server
    server.listen(port, host, () => {
      console.log(`Manga reader listening at http://${host}:${port}/`);
    });
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
