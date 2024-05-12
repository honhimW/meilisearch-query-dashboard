interface IDashboardMenus {
  title: string
  icon: string
  path: string
  description?: string
  hidden?: boolean
}

export const SIDEBAR_EXPAND_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 72;
export const APP_MENU: Record<string, { name: string, routes: IDashboardMenus[] }> = {
  main: {
    name: 'Core',
    routes: [
      {
        title: 'Query',
        icon: 'TextSearch',
        path: 'query',
        description: 'Query documents'
      },
      // {
      //   path: 'query',
      //   title: 'Query',
      //   icon: 'Search',
      //   description: 'Query'
      // },
    ],
  },
  settings: {
    name: 'General',
    routes: [
      {
        path: 'settings',
        title: 'Settings',
        icon: 'Settings2',
        description: 'Settings'
      },
      {
        path: 'task',
        title: 'Tasks',
        icon: 'Tasks',
        description: 'Tasks'
      },
    ],
  },
};

export const globalSearch = {

};
