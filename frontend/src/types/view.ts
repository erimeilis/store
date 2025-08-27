import { OpenGraph } from './open-graph'
import { Article } from './article'
import { Manifest } from './manifest'

export interface ViewMeta {
  title?: string;
  description?: string;
  lang?: string;
  locale?: string;
  open_graph?: OpenGraph;
  article?: Article;
  manifest?: Manifest;
  view_name?: string;
}

export interface ViewData {
  meta: ViewMeta;
  props: any;
}