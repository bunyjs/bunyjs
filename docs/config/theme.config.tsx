import Image from "next/image";
import { useRouter } from "next/router";
import { useConfig, type DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  darkMode: true,
  backgroundColor: {
    dark: "#161616",
  },
  color: {
    hue: 51,
    saturation: 100,
    lightness: 66,
  },
  logo: (
    <div>
      <span>BunyJS</span>
    </div>
  ),
  head: function Head() {
    const { asPath } = useRouter();
    const config = useConfig();

    const pageTitle = config.frontMatter.title || config.title;

    const siteTitle = "BunyJS";
    const title = pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle;

    const url = `https://bunyjs.com${asPath}`;

    const description = "Astonishing Ioc framework to build your next application";

    return (
      <>
        <title>{ title }</title>
        <meta name={"robots"} content={"index,follow"}/>
        <meta name={"description"} content={description}/>
        <meta property={"og:title"} content={pageTitle}/>
        <meta property={"og:site_name"} content={siteTitle}/>
        <meta property={"og:description"} content={description}/>
        <meta property={"og:url"} content={url}/>
        <meta property={"og:image"} content={"/bunyjs.png"}/>
        <meta property={"og:locale"} content={"en_US"}/>
        <link rel={"canonical"} href={"https://bunyjs.com/"}/>
        <meta name={"viewport"} content={"width=device-width, initial-scale=1.0"}/>
      </>
    );
  },
  docsRepositoryBase: "https://github.com/bunyjs/buny/tree/main/docs",
  project: {
    link: "https://github.com/bunyjs/bunyjs",
    icon: (
      <Image
        alt={"Buny Logo"}
        src={"/bunyjs.png"}
        width={32}
        height={32}
      />
    ),
  },
  chat: {
    link: "https://discord.gg/kQw9CG9A7a",
  },
  editLink: {
    content: "Edit this page on GitHub",
  },
  feedback: {
    content: "Help us improve this page →",
    labels: "documentation",
  },
  footer: {
    content: "MIT © BunyJS | built with Nextra",
  },
  toc: {
    backToTop: true,
  },
  banner: {
    dismissible: false,
    content: "BunyJS is under development. Feel free to contribute!",
    key: "bunyjs-0.0.1",
  },
};

export default config;
