import type { Plugin } from "unified";
import type * as mdast from "mdast";
import { visit } from "unist-util-visit";
import {
  mdastToDocx,
  DocxOptions,
  ImageDataMap,
  ImageData,
} from "./mdast-to-docx";
import { invariant } from "./utils";
import { parseLatex } from "./latex";
import { parseLatexOMML } from "./latex-omml";

export type { DocxOptions };

const plugin: Plugin<[(DocxOptions | undefined)?]> = function (opts: DocxOptions = {}) {
  let images: ImageDataMap = {};

  this.Compiler = (node) => {
    // 根据选项选择 LaTeX 解析器
    const latexParser = opts.useOMML ? parseLatexOMML : parseLatex;
    return mdastToDocx(node as any, opts, images, latexParser);
  };

  return async (node) => {
    const imageList: (mdast.Image | mdast.Definition)[] = [];
    visit(node as mdast.Root, "image", (node) => {
      imageList.push(node);
    });
    const defs = new Map<string, mdast.Definition>();
    visit(node as mdast.Root, "definition", (node) => {
      defs.set(node.identifier, node);
    });
    visit(node as mdast.Root, "imageReference", (node) => {
      const maybeImage = defs.get(node.identifier)!;
      if (maybeImage) {
        imageList.push(maybeImage);
      }
    });
    if (imageList.length === 0) {
      return node;
    }

    const imageResolver = opts.imageResolver;
    invariant(imageResolver, "options.imageResolver is not defined.");

    const resolved = new Set<string>();
    const promises: Promise<{ img: ImageData; url: string }>[] = [];
    imageList.forEach(({ url }) => {
      if (!resolved.has(url)) {
        resolved.add(url);
        promises.push(
          (async () => {
            const img = await imageResolver(url);
            return { img, url };
          })(),
        );
      }
    });
    images = (await Promise.all(promises)).reduce((acc, { img, url }) => {
      acc[url] = img;
      return acc;
    }, {} as ImageDataMap);
    return node;
  };
};
export default plugin;
