export default {
  index: "Introduction",
  prerequisites: "Prerequisites",
  getting_started: "Getting Started",
  core: {
    title: "Core",
    type: "menu",
    items: {
      app: {
        title: "App",
        href: "/core/app",
      },
      ioc: {
        title: "IoC",
        href: "/core/ioc",
      },
      config: {
        title: "Config",
        href: "/core/config",
      },
    },
  },
  database: {
    title: "Database",
    type: "menu",
    items: {
      typeorm: {
        title: "TypeORM",
        href: "/database/typeorm",
      },
      redis: {
        title: "Redis",
        href: "/database/redis",
      },
    },
  },
  cache: {
    title: "Cache",
    type: "menu",
    items: {
      cacheable: {
        title: "Cacheable",
        href: "/cache/cacheable",
      },
      keyv: {
        title: "Keyv",
        href: "/cache/keyv",
      },
    },
  },
  queue: {
    title: "Queue",
    type: "menu",
    items: {
      bull: {
        title: "Bull",
        href: "/queue/bull",
      },
    },
  },
  scheduler: {
    title: "Scheduler",
    type: "menu",
    items: {
      pulse: {
        title: "Pulse",
        href: "/scheduler/pulse",
      },
    },
  },
  bots: {
    title: "Bots",
    type: "menu",
    items: {
      discord: {
        title: "Discord",
        href: "/bots/discord",
      },
    },
  },
};
