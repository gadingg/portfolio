'use client';
import type { CSSProperties } from 'react';
import { Palette, RotateCcw, ArrowDown } from 'lucide-react';
import { defaultPalette, resolvePalette, paletteContrast, contrast, type PublicPalette } from '@/lib/public-palette';
import './palette-editor.css';
const colors=[['start','Gradient start'],['end','Gradient end'],['buttonText','Button text'],['canvas','Page background'],['surface','Card background'],['ink','Main text'],['secondary','Secondary text'],['line','Card border'],['controlLine','Control border']] as const;
export function PaletteEditor({value,onChange}:{value?:PublicPalette;onChange:(value:PublicPalette)=>void}){
 const p=resolvePalette(value),ratio=paletteContrast(p);
 const update=(key:keyof PublicPalette,value:string|number)=>onChange({...p,[key]:value});
 const preview={'--canvas':p.canvas,'--surface':p.surface,'--ink':p.ink,'--secondary':p.secondary,'--line':p.line,'--control-line':p.controlLine,'--accent':p.start,'--accent-end':p.end,'--accent-text':p.buttonText,'--accent-gradient':'linear-gradient('+p.angle+'deg,'+p.start+','+p.end+')'} as CSSProperties;
 return <div className="palette-editor">
   <div className="palette-heading"><Palette size={20} aria-hidden="true"/><h3>Public color palette</h3><button type="button" className="wm-button" onClick={()=>onChange({...defaultPalette})}><RotateCcw size={16} aria-hidden="true"/>Reset Arctic Sprint</button></div>
   <div className="palette-preview showcase" style={preview}><span className="palette-preview-title">I Think. I Create.<br/><span className="public-accent-text">I Solve.</span></span><p>Creative marketing & digital solutions.</p><span className="button button-primary">View portfolio <ArrowDown className="icon" aria-hidden="true"/></span><div className="palette-preview-card"><strong>Selected Works</strong><p>Ideas turned into useful tools.</p></div></div>
   <div className="palette-inputs">{colors.map(([key,label])=><label className="palette-field" key={key}><span>{label}</span><span className="palette-color-control"><input aria-label={label+' color'} type="color" value={p[key]} onChange={e=>update(key,e.target.value)}/><input aria-label={label+' HEX'} key={p[key]} defaultValue={p[key].toUpperCase()} maxLength={7} spellCheck={false} onBlur={e=>{if(/^#[0-9a-f]{6}$/i.test(e.target.value))update(key,e.target.value);else e.target.value=p[key].toUpperCase();}}/></span></label>)}</div>
   <label className="palette-angle">Gradient angle <input type="range" min="0" max="360" value={p.angle} onChange={e=>update('angle',Number(e.target.value))}/><output>{p.angle}°</output></label>
   <p className="palette-contrast" role="status">Button contrast <strong>{ratio.toFixed(2)}:1</strong> · {ratio>=4.5?'AA pass':'Increase text contrast'}{contrast(p.ink,p.canvas)<4.5||contrast(p.secondary,p.surface)<4.5?' · Check page and secondary text contrast':''}</p>
 </div>;
}
