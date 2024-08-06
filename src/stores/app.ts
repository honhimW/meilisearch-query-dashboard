import { defineStore } from 'pinia';
import { MeiliSearch } from 'meilisearch'
import router from '@/router'
import mitt, { type Emitter, type EventType } from 'mitt'

interface IAppStore {
  themeMode: 'light' | 'dark'
  sidebarExpand: boolean
  wrapperWidth: number | string
  wrapperLeftOffset: number | string
  navWidth: number | string
  showDialog: boolean
  serverUrl?: string
  apiKey?: string
  serverVersion?: string
  experimentalFeatures?: Record<string, boolean>
  emitter?: Emitter<Record<EventType, unknown>>
}

const LIGHT = 'light';
const DARK = 'dark';
const THEME_KEY = 'themeMode';
const EXPAND = 280;
const SHRINKED = 72;

const SERVER_URL_KEY = 'meiliServer'
const SERVER_API_KEY_KEY = 'apiKey'
const SERVER_VERSION = 'pkgVersion'

export const useAppStore = defineStore('app', {
  state: () => <IAppStore>({
    themeMode: LIGHT,
    sidebarExpand: false,
    wrapperWidth: 0,
    wrapperLeftOffset: 0,
    navWidth: '100%',
    showDialog: false,
    serverUrl: undefined,
    apiKey: undefined,
    serverVersion: undefined,
    experimentalFeatures: undefined,
    emitter: mitt()
  }),
  getters: {
    theme: (state) => state.themeMode,
    isDark: (state) => state.themeMode === DARK,
    sidebarExpanded: (state) => state.sidebarExpand,
  },
  actions: {
    toggleDialog(show: boolean) {
      this.showDialog = !this.showDialog
    },
    toggleSidebar() {
      this.sidebarExpand = !this.sidebarExpand;
      if (window.innerWidth > 1024) {
        this.initWrapper();
      }
    },
    initWrapper() {
      if (window.innerWidth > 1024) {
        if (this.sidebarExpand) {
          this.wrapperWidth = EXPAND;
          this.wrapperLeftOffset = EXPAND;
        } else {
          this.wrapperWidth = SHRINKED;
          this.wrapperLeftOffset = SHRINKED;
        }
        this.navWidth = `calc(100% - ${this.wrapperWidth}px)`
      } else {
        this.navWidth = '100%';
        this.sidebarExpand = false;
        this.wrapperWidth = '100%';
        this.wrapperLeftOffset = '100%';
      }
    },
    initTheme() {
      const cache = localStorage.getItem(THEME_KEY);
      if (cache) {
        this.themeMode = cache as 'light' | 'dark';
      }
      window.addEventListener('resize', this.initWrapper);
      this.applyTheme();
      this.initWrapper();
    },
    setServerUrl(url: string | undefined) {
      this.serverUrl = url
      if (this.serverUrl) {
        localStorage.setItem(SERVER_URL_KEY, this.serverUrl)
      } else {
        localStorage.removeItem(SERVER_URL_KEY)
      }
    },
    setApiKey(apiKey: string | undefined) {
      this.apiKey = apiKey
      if (this.apiKey) {
        localStorage.setItem(SERVER_API_KEY_KEY, this.apiKey)
      } else {
        localStorage.removeItem(SERVER_API_KEY_KEY)
      }
    },
    initClient() {
      const url = localStorage.getItem(SERVER_URL_KEY);
      const apiKey = localStorage.getItem(SERVER_API_KEY_KEY);
      if (url) {
        this.serverUrl = url;
      }
      if (apiKey) {
        this.apiKey = apiKey
      }
      this.buildClient()
    },
    buildClient() {
      if (this.serverUrl) {
        window.msClient = new MeiliSearch({
          host: this.serverUrl,
          apiKey: this.apiKey
        })
        window.msClient.getVersion().then(value => {
          this.serverVersion = value.pkgVersion
          localStorage.setItem(SERVER_VERSION, value.pkgVersion)
        })
        window.msClient.httpRequest.get<Record<string, boolean>>('/experimental-features').then(value => {
          this.experimentalFeatures = value
        })
      }
    },
    stopClient() {
      this.setServerUrl(undefined)
      this.setApiKey(undefined)
      localStorage.removeItem(SERVER_VERSION)
      window.msClient = undefined
    },
    toggleTheme() {
      this.themeMode = this.themeMode === LIGHT ? DARK : LIGHT;
      this.applyTheme();
      localStorage.setItem(THEME_KEY, this.themeMode);
    },
    appUnmount() {
      window.removeEventListener('resize', this.initWrapper);
    },
    applyTheme() {
      document.documentElement.classList.remove(LIGHT, DARK);
      document.body.classList.remove(LIGHT, DARK);
      document.documentElement.classList.add(this.themeMode);
      document.body.classList.add(this.themeMode);
      window.dispatchEvent(new ThemeChangeEvent('themeChange', this.themeMode))
    },
  },
});

export const updateQueries = (key: string, updater: (oldValue: string | undefined) => string) => {
  const query = router.currentRoute.value.query
  const queryElement = query[key]
  const newValue = updater(queryElement as string)
  const newQueries = {
    ...query,
  }
  newQueries[key] = newValue
  router.push({
    query: newQueries
  })
}

export const getQuery = (key: string) : string | undefined => {
  const query = router.currentRoute.value.query
  const queryElement = query[key]
  if (queryElement) {
    return queryElement as string
  }
  return undefined
}

export class ThemeChangeEvent extends Event {
  theme: string;

  constructor(type: string, theme: string) {
    super(type);
    this.theme = theme;
  }
}
