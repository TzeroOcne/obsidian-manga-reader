import { App, Plugin, PluginSettingTab, requestUrl, Setting } from 'obsidian';
import { CreateItemOptions, MangaChapterData, MangaReaderSettings } from './types';
import http from 'http';
import { createServer } from './server';

const DEFAULT_SETTINGS: MangaReaderSettings = {
  host: '127.0.0.1',
  port: 7000,
};

let server:http.Server|undefined

export default class MangaReader extends Plugin {
  settings!: MangaReaderSettings;

  async onunload(): Promise<void> {
    if (server) {
      server.close();
    }
  }

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addSettingTab(new MangaReaderSettingsTab(this.app, this))

    // Create the server
    server = createServer(this.app);

    // Specify the port and host
    const {
      host,
      port,
    } = this.settings;

    // Start the server
    server.listen(port, host, () => {
      console.log(`Manga reader listeing at http://${host}:${port}/`);
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
    super(app, plugin)
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
        .setValue(this.plugin.settings.host ?? '')
      )

    new Setting(containerEl)
      .setName('Port')
      .setDesc('port number to listen manga reading request')
      .addText((text) => {
        text.inputEl.type = 'number';
        text
          .setPlaceholder('host')
          .setValue(`${this.plugin.settings.port ?? 7000}`)
      })
  }
}
