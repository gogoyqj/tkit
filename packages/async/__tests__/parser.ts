/**
 * @todo 2019-06-20 讲道理，这个文件应该共享，但是放在 tkit-scripts 里居然不能正常 work，待进一步研究
 */
import * as path from 'path';
import * as ts from 'typescript';

export const parser = (files: string[], directory: string) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { compilerOptions } = require(path.join('..', 'tsconfig.json'));
  const fileNameMap: { [file: string]: any[] } = {};
  const errorMap: { [file: string]: any[] } = {};
  const program = ts.createProgram(
    files.map(file => {
      const p = path.join(__dirname, directory, file);
      fileNameMap[p] = errorMap[file] = [];
      return p;
    }),
    {
      ...compilerOptions,
      // @IMP: JSX
      jsx: 'react',
      // @IMP: export
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs
    }
  );
  const allDiagnostics = ts.getPreEmitDiagnostics(program);
  allDiagnostics.map(d => {
    if (d.file) {
      if (d.file.fileName in fileNameMap) {
        const errors = fileNameMap[d.file.fileName];
        const { relatedInformation, code, category, messageText } = d;
        errors.push({
          fileName: path.relative(__dirname, d.file.fileName),
          code,
          category,
          messageText: ts.flattenDiagnosticMessageText(messageText, '\n')
        });
        if (Array.isArray(relatedInformation)) {
          relatedInformation.forEach(d => {
            const { code, category, messageText, file } = d;
            // 方便测试
            console.log({
              fileName: path.relative(__dirname, (file && file.fileName) || ''),
              code,
              category,
              messageText: ts.flattenDiagnosticMessageText(messageText, '\n')
            });
          });
        }
      }
    }
  });
  return errorMap;
};
