const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
exports.componentRuntime=function(mocks={}) {
  const cache=new Map();
  function load(file) {
    file=path.resolve(root,file);
    if(file.endsWith('.css')||file.endsWith('.svg'))return {};
    if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
    if(cache.has(file))return cache.get(file).exports;
    const mod={exports:{}};cache.set(file,mod);
    const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{
      module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,
    }}).outputText;
    new Function('require','module','exports',source)(name=>{
      if(name in mocks)return mocks[name];
      if(name==='server-only')return {};
      if(name==='lucide-react')return load(require.resolve(name));
      if(!name.startsWith('@/')&&!name.startsWith('.'))return require(name);
      const base=name.startsWith('@/')?path.join(root,name.slice(2)):path.resolve(path.dirname(file),name);
      return load(['.tsx','.ts',''].map(ext=>base+ext).find(fs.existsSync));
    },mod,mod.exports);
    return mod.exports;
  }
  return load;
};
