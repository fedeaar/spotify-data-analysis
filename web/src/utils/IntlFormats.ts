export const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
export const percentFormatter = new Intl.NumberFormat("en-US", { style: 'percent', maximumFractionDigits: 2 });

export function milisToTime (ms: number): string {

    const h = ms/(1000*60*60);
    const hf = Math.floor(h);
    const m = (h - hf)*60;
    const mf = Math.floor(m);
    const s = (m - mf)*60;
    const sf = Math.floor(s);
    const hstr = hf == 0 ? "" : (hf < 10 ? "0" + hf : hf) + ":";    
    const mstr = mf == 0 ? "" : (mf < 10 ? "0" + mf : mf) + ":";
    const sstr = sf < 10 ? "0" + sf : sf;
    const unit = hf !== 0 ? "h" : mf !== 0 ? "m" : "s";
    return `${hstr}${mstr}${sstr} ${unit}`
}
