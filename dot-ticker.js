(()=>{
const glyphs={
'А':['01110','10001','10001','11111','10001','10001','10001'],
'Б':['11111','10000','10000','11110','10001','10001','11110'],
'В':['11110','10001','10001','11110','10001','10001','11110'],
'Г':['11111','10000','10000','10000','10000','10000','10000'],
'Д':['00110','01010','01010','01010','10010','11111','10001'],
'Е':['11111','10000','10000','11110','10000','10000','11111'],
'Ё':['01010','00000','11111','10000','11110','10000','11111'],
'Ж':['10101','10101','01110','00100','01110','10101','10101'],
'З':['11110','00001','00001','01110','00001','00001','11110'],
'И':['10001','10001','10011','10101','11001','10001','10001'],
'Й':['01010','00100','10001','10011','10101','11001','10001'],
'К':['10001','10010','10100','11000','10100','10010','10001'],
'Л':['00111','01001','01001','01001','01001','10001','10001'],
'М':['10001','11011','10101','10101','10001','10001','10001'],
'Н':['10001','10001','10001','11111','10001','10001','10001'],
'О':['01110','10001','10001','10001','10001','10001','01110'],
'П':['11111','10001','10001','10001','10001','10001','10001'],
'Р':['11110','10001','10001','11110','10000','10000','10000'],
'С':['01111','10000','10000','10000','10000','10000','01111'],
'Т':['11111','00100','00100','00100','00100','00100','00100'],
'У':['10001','10001','10001','01111','00001','00001','11110'],
'Ф':['00100','01110','10101','10101','10101','01110','00100'],
'Х':['10001','10001','01010','00100','01010','10001','10001'],
'Ц':['10010','10010','10010','10010','10010','11111','00001'],
'Ч':['10001','10001','10001','01111','00001','00001','00001'],
'Ш':['10101','10101','10101','10101','10101','10101','11111'],
'Щ':['10101','10101','10101','10101','10101','11111','00001'],
'Ъ':['11000','01000','01000','01110','01001','01001','01110'],
'Ы':['10001','10001','10001','11101','10101','10101','11101'],
'Ь':['10000','10000','10000','11110','10001','10001','11110'],
'Э':['11110','00001','00001','01111','00001','00001','11110'],
'Ю':['10010','10101','10101','11101','10101','10101','10010'],
'Я':['01111','10001','10001','01111','00101','01001','10001'],
'•':['000','000','010','111','010','000','000'],
' ':['000','000','000','000','000','000','000']};
Object.assign(glyphs,{
'0':['01110','10001','10011','10101','11001','10001','01110'],
'1':['00100','01100','00100','00100','00100','00100','01110'],
'2':['01110','10001','00001','00010','00100','01000','11111'],
'3':['11110','00001','00001','01110','00001','00001','11110'],
'4':['00010','00110','01010','10010','11111','00010','00010'],
'5':['11111','10000','10000','11110','00001','00001','11110'],
'6':['01110','10000','10000','11110','10001','10001','01110'],
'7':['11111','00001','00010','00100','01000','01000','01000'],
'8':['01110','10001','10001','01110','10001','10001','01110'],
'9':['01110','10001','10001','01111','00001','00001','01110'],
':':['0','1','1','0','1','1','0'],
'/':['0001','0001','0010','0010','0100','1000','1000']});

Object.assign(glyphs,{"D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"], "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"], "G": ["01111", "10000", "10000", "10111", "10001", "10001", "01110"], "I": ["01110", "00100", "00100", "00100", "00100", "00100", "01110"], "J": ["00111", "00010", "00010", "00010", "10010", "10010", "01100"], "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"], "N": ["10001", "11001", "11001", "10101", "10011", "10011", "10001"], "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"], "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"], "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"], "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"], "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"], "W": ["10001", "10001", "10001", "10101", "10101", "10101", "01010"], "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"], "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"], "-": ["000", "000", "000", "111", "000", "000", "000"], ".": ["0", "0", "0", "0", "0", "1", "1"], ",": ["00", "00", "00", "00", "01", "01", "10"], "!": ["1", "1", "1", "1", "1", "0", "1"], "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"], "|": ["1", "1", "1", "1", "1", "1", "1"], "(": ["001", "010", "100", "100", "100", "010", "001"], ")": ["100", "010", "001", "001", "001", "010", "100"]});
glyphs['A']=glyphs['А'];
glyphs['B']=glyphs['В'];
glyphs['C']=glyphs['С'];
glyphs['E']=glyphs['Е'];
glyphs['H']=glyphs['Н'];
glyphs['K']=glyphs['К'];
glyphs['M']=glyphs['М'];
glyphs['O']=glyphs['О'];
glyphs['P']=glyphs['Р'];
glyphs['T']=glyphs['Т'];
glyphs['X']=glyphs['Х'];

function columns(text){const result=[];for(const c of text.replace(/ё/gi,'е').toUpperCase()){const glyph=glyphs[c]||glyphs['?'];for(let x=0;x<glyph[0].length;x++)result.push(glyph.map(r=>r[x]==='1'));result.push(Array(7).fill(false));}return result;}
let strip=null,titleCanvas,timeCanvas,titleCols=[],timeCols=[],title='',time='',offset=0,lastStep=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const sprites=new WeakMap(),painted=new WeakMap();
function paint(canvas,cols,pitch,scroll,glow,right=false,repeat=false){
 const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;
 const dpr=Math.min(devicePixelRatio||1,2),w=Math.round(width*dpr),h=Math.round(height*dpr);
 let sprite=sprites.get(canvas);const key=[pitch,height,dpr].join(':');
 if(!sprite||sprite.cols!==cols||sprite.key!==key){
  const image=document.createElement('canvas'),period=(cols.length+18)*pitch;
  image.width=Math.ceil(period*dpr);image.height=h;
  const c=image.getContext('2d');c.scale(dpr,dpr);c.fillStyle='#cfe2d8';c.shadowColor='rgba(170,233,198,.45)';c.shadowBlur=3.2;
  c.beginPath();cols.forEach((col,x)=>col.forEach((on,y)=>{if(on){const cx=x*pitch+pitch/2,cy=height/2+(y-(col.length-1)/2)*pitch;c.moveTo(cx+pitch*.409,cy);c.arc(cx,cy,pitch*.409,0,Math.PI*2);}}));c.fill();
  sprite={image,period,cols,key};sprites.set(canvas,sprite);painted.delete(canvas);
 }
 // The timer and stationary text only redraw when their content or size changes.
 const signature=[w,h,scroll,right].join(':');if(painted.get(canvas)===signature)return;
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
 const origin=right?Math.max(0,width-cols.length*pitch):0;
 const overflowing=repeat&&cols.length*pitch>width;
 for(let x=origin-scroll*pitch;x<width;x+=sprite.period){ctx.drawImage(sprite.image,0,0,sprite.image.width,sprite.image.height,x,0,sprite.image.width/dpr,height);if(!overflowing)break;}
 painted.set(canvas,signature);
}
function frame(now){if(document.hidden)return;const next=document.querySelector('[data-current-ticker]');if(next!==strip){strip=next;title='';time='';if(strip){titleCanvas=document.createElement('canvas');titleCanvas.className='dot-title';titleCanvas.setAttribute('aria-hidden','true');strip.querySelector('.ticker-window').append(titleCanvas);timeCanvas=document.createElement('canvas');timeCanvas.className='dot-time';timeCanvas.setAttribute('aria-hidden','true');strip.append(timeCanvas);}}
if(strip&&!document.hidden){const titleEl=strip.querySelector('[data-ticker-title]'),timeEl=strip.querySelector('[data-ticker-time]');const mobile=innerWidth<=760;const displayTime=mobile?timeEl.textContent.replace(/(\d+:\d{2}):\d{2}/g,'$1'):timeEl.textContent;if(title!==titleEl.textContent){title=titleEl.textContent;titleCols=columns(title);offset=0;}if(time!==displayTime){time=displayTime;timeCols=[Array(11).fill(true),...Array.from({length:5},()=>Array(7).fill(false)),...columns(time.replace('|','/'))];timeCanvas.hidden=!time;strip.setAttribute('aria-label',title+(time?' · '+time:''));}const pitch=(mobile?2.5:3.3)*.7;const overflow=titleCols.length*pitch>titleCanvas.clientWidth;const timerWidth=Math.min(mobile?Math.ceil(timeCols.length*1.4+2):185,strip.clientWidth*.57);if(timeCanvas.style.width!==timerWidth+'px')timeCanvas.style.width=timerWidth+'px';if(!reduced.matches&&overflow&&now-lastStep>=85){offset=(offset+1)%(titleCols.length+18);lastStep=now;}const glow=reduced.matches?.9:.87+.045*Math.sin(now/640);paint(titleCanvas,titleCols,pitch,overflow&&!reduced.matches?offset:0,glow,false,true);if(time)paint(timeCanvas,timeCols,Math.min(1.4,(timeCanvas.clientWidth-1)/Math.max(1,timeCols.length)),0,glow,true);}
}
setInterval(()=>frame(performance.now()),85);
frame(performance.now());
})();
