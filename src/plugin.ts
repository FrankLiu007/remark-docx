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
import { parseLatexOMMLWithXSL, parseLatexOMMLWithLibrary } from "./latex-omml";
import { preprocessMathFormulas } from "./mathPreprocessor";

export type { DocxOptions };

const plugin: Plugin<[(DocxOptions | undefined)?]> = function (opts: DocxOptions | undefined = undefined) {
  let images: ImageDataMap = {};

  // 提供默认选项
  const defaultOpts: DocxOptions = {
    output: 'buffer',
    useOMML: true,
    useBrowserXSL: false,
    imageResolver: async (_url: string): Promise<ImageData> => {
      return {
        image: new Uint8Array(0),
        width: 100,
        height: 100
      };
    }
  };

  const finalOpts = { ...defaultOpts, ...opts };

  // 添加预处理步骤，将 LaTeX 格式的数学公式转换为 remark-math 支持的格式
  this.use(function() {
    return (tree: mdast.Root) => {
      // 遍历所有文本节点，预处理数学公式
      visit(tree, 'text', (node: mdast.Text) => {
        if (node.value) {
          node.value = preprocessMathFormulas(node.value);
        }
      });
      
      // 处理代码块中的数学公式（如果需要）
      visit(tree, 'code', (node: mdast.Code) => {
        if (node.value) {
          node.value = preprocessMathFormulas(node.value);
        }
      });
      
      // 处理 HTML 节点中的数学公式（如果需要）
      visit(tree, 'html', (node: mdast.HTML) => {
        if (node.value) {
          node.value = preprocessMathFormulas(node.value);
        }
      });
    };
  });

  // 确保 remark-math 正确配置以识别数学公式
  // this.use(math, { singleDollarTextMath: true });

  // 设置编译器
  this.Compiler = (node) => {
    // 根据选项选择 LaTeX 解析器
    let latexParser;
    if (finalOpts.useOMML) {
      if (finalOpts.useBrowserXSL) {
        // 使用真正的浏览器原生 XSL 转换（同步）
        latexParser = parseLatexOMMLWithXSL;

      } else {
        // 使用 mathml2omml 库
        latexParser = parseLatexOMMLWithLibrary;

      }
    } else {
      // 使用原始解析器
      latexParser = parseLatex;
    }
    
    return mdastToDocx(node as any, finalOpts, images, latexParser);
  };

  // 返回图片处理转换器
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

    const imageResolver = finalOpts.imageResolver;
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
export const remarkDocx = plugin;
export default plugin;
