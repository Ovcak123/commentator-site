// sanity/schemaTypes/index.ts

import author from "./author";
import editorialImage from "./editorialImage";
import post from "./post";
import newsItem from "./newsItem";
import feedRead from "./feedRead";

import aboutPage from "./aboutPage";
import freedomReloadedPage from "./freedomReloadedPage";
import contactPage from "./contactPage";

import richText from "./richText";

export const schemaTypes = [
  richText,
  editorialImage,
  author,
  post,
  newsItem,
  feedRead,
  aboutPage,
  freedomReloadedPage,
  contactPage,
];