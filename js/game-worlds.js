/* Original Canvas 2D artwork. Depth comes from perspective, bevels and shadows;
 * game rules and collision coordinates stay in each game's existing engine. */
(function () {
  'use strict';
  const scriptURL = document.currentScript.src;
  let garden, hero, armorHero;
  function heroArt(armor) {
    if(armor) {if(!armorHero){armorHero=new Image();armorHero.src=new URL('../assets/robot-armor-v2.png',scriptURL).href;}if(armorHero.complete&&armorHero.naturalWidth)return armorHero;}
    if(!hero) { hero=new Image(); hero.src=new URL('../assets/robot-explorer-v2.png',scriptURL).href; }
    return hero;
  }
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function art() {
    if (!garden) { garden = new Image(); garden.src = new URL('../assets/workshop/game-garden-v1.webp', scriptURL).href; }
    return garden;
  }
  const palettes = [
    { sky:'#ddf3fa', grass:'#bcdfca', edge:'#75a996', light:'#f5f7ed', accent:'#497eaa' },
    { sky:'#efe9fc', grass:'#d0d9ed', edge:'#8a9fc5', light:'#fff6ea', accent:'#7960a6' },
    { sky:'#fff0e1', grass:'#e6d9c6', edge:'#b6a58d', light:'#fffbef', accent:'#a26444' },
    { sky:'#e4f4f4', grass:'#b8dcd8', edge:'#6daba7', light:'#f3fbf6', accent:'#287c7b' }
  ];
  const palette = i => palettes[Math.abs(i || 0) % palettes.length];
  function round(ctx,x,y,w,h,r,color) {
    ctx.fillStyle=color; ctx.beginPath(); ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2)); ctx.fill();
  }
  function oval(ctx,x,y,rx,ry,color) {
    ctx.fillStyle=color; ctx.beginPath(); ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); ctx.fill();
  }
  function slab(ctx,x,y,w,h,color,edge,depth) {
    depth=depth === undefined ? 5 : depth;
    round(ctx,x+2,y+depth+3,w,h,Math.min(10,h/3),'rgba(32,64,76,.13)');
    round(ctx,x,y+depth,w,h,Math.min(10,h/3),edge);
    round(ctx,x,y,w,h,Math.min(10,h/3),color);
    round(ctx,x+3,y+2,w-6,Math.max(2,h*.12),2,'rgba(255,255,255,.65)');
  }
  function robot(ctx,x,y,size,options) {
    const o=options||{}, s=size/48;
    ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
    if(!o.airborne)oval(ctx,1,20,20,5,'rgba(38,65,78,.19)');
    if(o.shielded) { ctx.strokeStyle='#246cab'; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(0,-3,28,34,0,0,Math.PI*2); ctx.stroke(); }
    const sprite=heroArt(o.shielded);
    if(sprite.complete && sprite.naturalWidth) {
      const bob=motion.matches?0:Math.sin((o.now||0)*.012)*1.2;
      // The sprite's boots meet the same foot baseline as the fallback robot.
      if(o.jumpBoost) {oval(ctx,-13,24,9,4,'#f7be37');oval(ctx,13,24,9,4,'#f7be37');round(ctx,-18,19,36,5,2,'#ef922f');}
      if(o.magnet) {ctx.strokeStyle='#a45bc1';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-10,35,34,0,0,Math.PI*2);ctx.stroke();}
      ctx.save();
      // Keep the existing green/gold robot choices useful with the new art.
      if(o.color==='#34d399')ctx.filter='hue-rotate(-35deg)';
      else if(o.color==='#fbbf24')ctx.filter='hue-rotate(-130deg)';
      ctx.drawImage(sprite,-34,-46+bob,68,68);ctx.restore();
      if(o.shielded && sprite!==armorHero) {slab(ctx,-14,-9,28,20,'#4ba5be','#24617e',2);token(ctx,0,0,'◇','shield',8,18);}
      if(o.hurt) {ctx.strokeStyle='#cd6c46';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-10,28,32,0,0,Math.PI*2);ctx.stroke();}
      for(let i=0;i<4;i++) oval(ctx,-9+i*6,24,2,2,i<(o.parts||0)?'#27876a':'#f8f7e9');
      ctx.restore();return;
    }

    const color=o.hurt ? '#edb39e' : (o.color||'#9cc6d5');
    const shell=ctx.createLinearGradient(-22,-32,22,12);shell.addColorStop(0,'#ffffff');shell.addColorStop(.5,'#f4f5e9');shell.addColorStop(1,'#a1b6b9');
    const coat=ctx.createLinearGradient(-16,-8,16,20);coat.addColorStop(0,'#e3f4f5');coat.addColorStop(.35,color);coat.addColorStop(1,'#517b8c');
    const glass=ctx.createLinearGradient(-16,-25,18,-7);glass.addColorStop(0,'#365d70');glass.addColorStop(.55,'#193345');glass.addColorStop(1,'#0d2537');
    const gait=motion.matches ? 0 : Math.sin((o.now||0)*.012)*2;
    slab(ctx,-15,9+gait,12,9,'#455d75','#2d4059',3);
    slab(ctx,3,9-gait,12,9,'#455d75','#2d4059',3);
    slab(ctx,-16,-9,32,24,coat,'#506e81',4);
    slab(ctx,-23,-7,8,18,'#e9f2ed','#93b1b6',3);
    slab(ctx,15,-7,8,18,'#e9f2ed','#93b1b6',3);
    oval(ctx,0,-13,23,21,'#718f9c');
    round(ctx,-22,-32,44,33,13,shell);
    round(ctx,-17,-25,34,19,8,glass);
    round(ctx,-12,-23,21,3,2,'#ffffff26');
    oval(ctx,-7,-16,3,4,'#b4f2e5'); oval(ctx,7,-16,3,4,'#b4f2e5');
    oval(ctx,-8,-17,1,1,'#ffffff');oval(ctx,6,-17,1,1,'#ffffff');
    round(ctx,-2,-38,4,9,2,'#56798c'); oval(ctx,0,-39,4,4,'#e3b25c');
    for(let i=0;i<4;i++) oval(ctx,-9+i*6,3,2,2,i<(o.parts||0)?'#287361':'#f4f7f1');
    ctx.restore();
  }
  function token(ctx,x,y,text,kind,size,maxWidth) {
    ctx.save(); ctx.translate(x,y);
    const r=size||18, hazard=['hazard','fake','obstacle','overhead'].includes(kind);
    let fs=Math.round(r*1.05), limit=maxWidth||r*4;
    ctx.font='800 '+fs+'px system-ui, sans-serif';
    while(ctx.measureText(String(text)).width>limit-10 && fs>9) { fs--; ctx.font='800 '+fs+'px system-ui, sans-serif'; }
    const w=Math.max(r*1.7,Math.min(limit,ctx.measureText(String(text)).width+14));
    slab(ctx,-w/2,-r,w,r*1.8,hazard?'#ffe0b2':'#fff7c9',hazard?'#cc8253':'#cea750',Math.max(3,r*.18));
    ctx.fillStyle=hazard?'#713b20':'#214b45'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(String(text),0,-r*.05);
    if(hazard) { ctx.fillStyle='#713b20'; ctx.beginPath(); ctx.moveTo(w/2-10,-r); ctx.lineTo(w/2,-r); ctx.lineTo(w/2,-r+10); ctx.fill(); }
    ctx.restore();
  }
  function pickup(ctx,s,size) {
    if(s.kind==='shield') {
      const g=ctx.createLinearGradient(-size,-size,size,size);g.addColorStop(0,'#99efff');g.addColorStop(.45,'#2da6d1');g.addColorStop(1,'#245c91');
      oval(ctx,1,size*.9,size*.8,size*.25,'#204e7526');
      ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.85,-size*.65);ctx.lineTo(size*.7,size*.35);ctx.quadraticCurveTo(size*.4,size*.8,0,size);ctx.quadraticCurveTo(-size*.4,size*.8,-size*.7,size*.35);ctx.lineTo(-size*.85,-size*.65);ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#e2faff';ctx.lineWidth=2;ctx.stroke();
      ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-size*.35,0);ctx.lineTo(-size*.08,size*.25);ctx.lineTo(size*.4,-size*.25);ctx.stroke();return;
    }
    if(s.kind==='magnet') {
      token(ctx,0,0,'','letter',size,size*2.2);
      ctx.strokeStyle='#9352ba';ctx.lineWidth=size*.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-size*.45,-size*.4);ctx.lineTo(-size*.45,size*.1);ctx.quadraticCurveTo(0,size, size*.45,size*.1);ctx.lineTo(size*.45,-size*.4);ctx.stroke();
      round(ctx,-size*.65,-size*.6,size*.4,size*.25,2,'#e6ecfa');round(ctx,size*.25,-size*.6,size*.4,size*.25,2,'#e6ecfa');return;
    }
    if(s.kind==='spring') {
      token(ctx,0,0,'⇧','letter',size,size*2.2);
      ctx.strokeStyle='#c67d24';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-size*.6,size);ctx.lineTo(size*.6,size*.8);ctx.lineTo(-size*.6,size*.6);ctx.stroke();return;
    }
    const text = s.kind==='coin'?'★':s.kind==='shield'?'◇':s.kind==='magnet'?'∩':s.kind==='spring'?'↑':s.text||s.glyph||'!';
    if(s.kind==='oil') { oval(ctx,0,2,size,size*.4,'#567b8a'); return; }
    token(ctx,0,0,text,s.kind,size,Math.max(size*2,size*4.4));
  }
  function background(ctx,W,H,index) {
    const p=palette(index), img=art();
    const gradient=ctx.createLinearGradient(0,0,0,H); gradient.addColorStop(0,p.sky); gradient.addColorStop(1,p.light);
    ctx.fillStyle=gradient; ctx.fillRect(0,0,W,H);
    if(img.complete && img.naturalWidth) {
      const scale=Math.max(W/img.naturalWidth,H/img.naturalHeight);
      ctx.drawImage(img,(W-img.naturalWidth*scale)/2,(H-img.naturalHeight*scale)/2,img.naturalWidth*scale,img.naturalHeight*scale);
      ctx.fillStyle=p.sky+'33'; ctx.fillRect(0,0,W,H);
    } else {
      oval(ctx,W*.2,H*.65,W*.5,H*.25,p.grass); oval(ctx,W*.85,H*.7,W*.6,H*.3,p.grass);
    }
  }
  function ground(ctx,W,H,y,offset,index) {
    const p=palette(index), soil=ctx.createLinearGradient(0,y,0,H);
    soil.addColorStop(0,'#e6dbc6');soil.addColorStop(.2,'#c9bd9f');soil.addColorStop(1,'#8b9e80');
    ctx.fillStyle=soil;ctx.fillRect(-20,y,W+40,H-y+20);
    slab(ctx,-20,y,W+40,14,p.grass,p.edge,5);
    const shift=offset%96;
    for(let row=0;row<4;row++) for(let x=-110-shift+(row%2)*48;x<W+100;x+=96) {
      const yy=y+30+row*38;
      round(ctx,x,yy,88,30,6,row%2?'#d0c5ac':'#dbd1bb');
      ctx.fillStyle='#fff8e630';ctx.fillRect(x+6,yy+3,72,2);
    }
    for(let x=-shift;x<W+80;x+=96) {
      oval(ctx,x,y+8,20,4,p.edge);oval(ctx,x-4,y+5,18,3,p.grass);
      ctx.strokeStyle='#6b9777';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y+4);ctx.lineTo(x-4,y-3);ctx.moveTo(x+2,y+4);ctx.lineTo(x+5,y-4);ctx.stroke();
    }
  }
  const expeditionLabels = {
    en:['Forest laboratory','Coral bay','Sun canyon','Orbital station','Level','Choose a level','Garage','Kart','Buggy','Capsule','Different looks, same handling.','Complete the previous level','Levels','Next location'],
    ru:['Лесная лаборатория','Коралловая бухта','Солнечный каньон','Орбитальная станция','Уровень','Выбери уровень','Гараж','Карт','Багги','Капсула','Разный вид, одинаковое управление.','Пройди предыдущий уровень','Уровни','Следующая локация'],
    de:['Waldlabor','Korallenbucht','Sonnenschlucht','Orbitalstation','Level','Wähle ein Level','Garage','Kart','Buggy','Kapsel','Anderes Aussehen, gleiche Steuerung.','Schließe das vorherige Level ab','Level','Nächster Ort'],
    es:['Laboratorio del bosque','Bahía de coral','Cañón del sol','Estación orbital','Nivel','Elige un nivel','Garaje','Kart','Buggy','Cápsula','Distinto aspecto, mismo manejo.','Completa el nivel anterior','Niveles','Siguiente lugar'],
    fr:['Laboratoire de la forêt','Baie de corail','Canyon du soleil','Station orbitale','Niveau','Choisis un niveau','Garage','Kart','Buggy','Capsule','Apparence différente, même conduite.','Termine le niveau précédent','Niveaux','Prochaine destination'],
    hi:['जंगल की प्रयोगशाला','मूंगे की खाड़ी','सूरज की घाटी','अंतरिक्ष स्टेशन','स्तर','स्तर चुनो','गैराज','कार्ट','बग्गी','कैप्सूल','रूप अलग, नियंत्रण एक जैसा।','पिछला स्तर पूरा करो','स्तर','अगली जगह'],
    id:['Laboratorium hutan','Teluk karang','Ngarai matahari','Stasiun orbit','Level','Pilih level','Garasi','Kart','Buggy','Kapsul','Tampilan berbeda, kendali sama.','Selesaikan level sebelumnya','Level','Lokasi berikutnya'],
    pt:['Laboratório da floresta','Baía de coral','Cânion do sol','Estação orbital','Nível','Escolha um nível','Garagem','Kart','Buggy','Cápsula','Visual diferente, mesma condução.','Complete o nível anterior','Níveis','Próximo local'],
    tr:['Orman laboratuvarı','Mercan koyu','Güneş kanyonu','Yörünge istasyonu','Seviye','Seviye seç','Garaj','Kart','Buggy','Kapsül','Farklı görünüm, aynı kontrol.','Önceki seviyeyi tamamla','Seviyeler','Sonraki konum'],
    vi:['Phòng thí nghiệm rừng','Vịnh san hô','Hẻm núi mặt trời','Trạm quỹ đạo','Màn','Chọn màn chơi','Gara','Xe kart','Xe buggy','Phi thuyền','Kiểu dáng khác nhau, điều khiển như nhau.','Hoàn thành màn trước','Các màn','Địa điểm tiếp theo'],
    it:['Laboratorio nel bosco','Baia dei coralli','Canyon del sole','Stazione orbitale','Livello','Scegli un livello','Garage','Kart','Buggy','Capsula','Aspetto diverso, stessa guida.','Completa il livello precedente','Livelli','Prossima destinazione'],
  };
  const biomes = [
    {id:'forest',icon:'🌿',sky:'#b4decd',floor:'#9fb98d',shade:'#325c53',road:'#32575e',edge:'#b5d397',accent:'#25b5a7'},
    {id:'coast',icon:'🐚',sky:'#b9e9ee',floor:'#66c5c4',shade:'#276e86',road:'#d0b98e',edge:'#ffecbd',accent:'#289eb7'},
    {id:'canyon',icon:'☀️',sky:'#f4c5a2',floor:'#db9871',shade:'#995958',road:'#a9684e',edge:'#ffd49a',accent:'#ca713d'},
    {id:'orbit',icon:'🪐',sky:'#35315e',floor:'#656288',shade:'#26284d',road:'#39385e',edge:'#aeb4ef',accent:'#9994ef'},
  ];
  const expeditionText=(lang,key)=>(expeditionLabels[lang]||expeditionLabels.en)[key];
  function location(index,lang='en') {
    const value=Number(index);const i=((Number.isFinite(value)?Math.trunc(value):0)%4+4)%4;
    return {...biomes[i],index:i,name:expeditionText(lang,i)};
  }
  let locationAtlas;
  function atlasArt(){if(!locationAtlas){locationAtlas=new Image();locationAtlas.src=new URL('../assets/workshop/game-locations-v1.webp',scriptURL).href;}return locationAtlas;}
  function locationBackdrop(ctx,W,H,index){
    const b=location(index),img=atlasArt();
    const base=ctx.createLinearGradient(0,0,0,H);base.addColorStop(0,b.sky);base.addColorStop(1,b.floor);ctx.fillStyle=base;ctx.fillRect(0,0,W,H);
    if(img.complete&&img.naturalWidth&&img.naturalHeight){
      const sw=img.naturalWidth/2,sh=img.naturalHeight/2,k=Math.max(W/sw,H/sh);
      const cw=W/k,ch=H/k,sx=(b.index%2)*sw+(sw-cw)/2,sy=Math.floor(b.index/2)*sh+(sh-ch)/2;
      ctx.drawImage(img,sx,sy,cw,ch,0,0,W,H);
    }
  }
  function locationPreview(canvas,index){
    canvas.width=480;canvas.height=240;const paint=()=>locationBackdrop(canvas.getContext('2d'),480,240,index);paint();
    const img=atlasArt();if(!img.complete)img.addEventListener('load',paint,{once:true});
  }
  function board(W,H,cell,cols,rows,index) {
    const canvas=document.createElement('canvas'),dpr=Math.min(2,window.devicePixelRatio||1);
    canvas.width=W*dpr;canvas.height=H*dpr;
    const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
    function paint(){
      const b=location(index);locationBackdrop(ctx,W,H,index);
      // A translucent navigation deck keeps letters legible over the diorama.
      round(ctx,3,3,W-6,H-6,18,b.index===3?'#17264282':'#f4fff34d');
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
        const px=x*cell,py=y*cell;
        round(ctx,px+1,py+1,cell-2,cell-2,cell*.12,(x+y)%2?'#f7ffef0c':'#ffffff26');
        ctx.strokeStyle=b.index===3?'#c9edff24':'#214c4224';ctx.lineWidth=.7;ctx.strokeRect(px+.5,py+.5,cell,cell);
      }
      ctx.strokeStyle='#efffffbb';ctx.lineWidth=3;ctx.strokeRect(2,2,W-4,H-4);
    }
    paint();const img=atlasArt();if(!img.complete)img.addEventListener('load',paint,{once:true});
    return canvas;
  }
  function snakeLinks(points,cell) {
    // Wrapped neighbors belong on opposite edges, never across the whole arena.
    return points.slice(1).map((b,i)=>({a:points[i],b})).filter(({a,b})=>Math.hypot(a.cx-b.cx,a.cy-b.cy)<cell*1.6);
  }
  function serpent(ctx,points,cell,direction,options) {
    if(!points.length)return;
    const o=options||{},r=cell*.32,links=snakeLinks(points,cell);
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    for(const {a,b} of links){ctx.strokeStyle='#061e3140';ctx.lineWidth=r*1.95;ctx.beginPath();ctx.moveTo(a.cx+2,a.cy+4);ctx.lineTo(b.cx+2,b.cy+4);ctx.stroke();}
    for(const {a,b} of links){
      // Shade across each joint, not along it: the connecting tube stays round
      // on vertical and horizontal sections without changing the collision grid.
      const dx=b.cx-a.cx,dy=b.cy-a.cy,length=Math.hypot(dx,dy)||1;
      let nx=-dy/length,ny=dx/length;
      if(nx+ny<0){nx=-nx;ny=-ny;}
      const mx=(a.cx+b.cx)/2,my=(a.cy+b.cy)/2;
      const tube=ctx.createLinearGradient(mx-nx*r,my-ny*r,mx+nx*r,my+ny*r);
      tube.addColorStop(0,'#97f4d5');tube.addColorStop(.28,'#49d4b1');tube.addColorStop(.65,'#20aaa0');tube.addColorStop(1,'#126174');
      ctx.strokeStyle=tube;ctx.lineWidth=r*1.75;ctx.beginPath();ctx.moveTo(a.cx,a.cy);ctx.lineTo(b.cx,b.cy);ctx.stroke();
    }
    for(let i=points.length-1;i>0;i--){
      const c=points[i],ahead=points[i-1],dx=ahead.cx-c.cx,dy=ahead.cy-c.cy;
      const angle=Math.abs(dx)>cell*1.6||Math.abs(dy)>cell*1.6?0:Math.atan2(dy,dx);
      ctx.save();ctx.translate(c.cx,c.cy);ctx.rotate(angle);
      const size=cell*(i===points.length-1?.31:.36);
      const plate=ctx.createLinearGradient(-size,-size,size,size);plate.addColorStop(0,'#ffffff');plate.addColorStop(.5,'#e1f4e9');plate.addColorStop(1,'#75a7ae');
      round(ctx,-size,-size,size*2,size*2,size*.48,'#234a5d');
      round(ctx,-size,-size-2,size*2,size*1.7,size*.42,plate);
      round(ctx,-size*.55,-size*.75,size*1.1,size*1.2,size*.32,'#168f9b');
      oval(ctx,-size*.12,-size*.2,size*.27,size*.27,'#b9fff0');
      for(const side of [-1,1])round(ctx,-size*.65,side*size*.65-1,size*1.3,3,1,'#f4b13b');
      ctx.restore();
    }
    const head=points[0],angle=Math.atan2(direction.y,direction.x);
    ctx.translate(head.cx,head.cy);ctx.rotate(angle);
    const pulse=o.eating&&!motion.matches?1.06:1;ctx.scale(pulse,pulse);
    oval(ctx,2,5,cell*.47,cell*.43,'#061c3655');
    const shell=ctx.createLinearGradient(-r,-r,r,r);shell.addColorStop(0,'#ffffff');shell.addColorStop(.5,o.hurt?'#ffc294':'#fff8e6');shell.addColorStop(1,'#87b6be');
    round(ctx,-cell*.44,-cell*.42,cell*.9,cell*.84,cell*.29,shell);
    round(ctx,-cell*.18,-cell*.32,cell*.59,cell*.64,cell*.2,'#112e47');
    round(ctx,-cell*.13,-cell*.28,cell*.4,cell*.05,cell*.02,'#8be6ed55');
    for(const side of [-1,1]){
      oval(ctx,cell*.12,side*cell*.17,cell*.075,cell*.105,'#55f5ef');
      oval(ctx,cell*.13,side*cell*.17-cell*.035,cell*.025,cell*.035,'#ffffff');
      oval(ctx,-cell*.31,side*cell*.31,cell*.1,cell*.1,'#d78932');
      oval(ctx,-cell*.31,side*cell*.31,cell*.065,cell*.065,'#25b2be');
    }
    ctx.strokeStyle='#87ffdf';ctx.lineWidth=cell*.035;ctx.beginPath();ctx.arc(cell*.22,0,cell*.065,-.9,.9);ctx.stroke();
    round(ctx,-cell*.4,-cell*.12,cell*.14,cell*.24,cell*.05,'#169da7');
    oval(ctx,-cell*.41,0,cell*.04,cell*.055,'#e4fff8');
    ctx.restore();
  }
  function project(W,H,lanes,lane,y,bend=0) {
    const z=y/H,depth=Math.max(0,z),scale=.18+.82*Math.pow(depth,1.25);
    return {x:W/2+((lane+.5)/lanes-.5)*W*.84*scale+bend*((1-z)*(1-z)-.0484),y:H*.24+H*.76*(z<0?z:Math.pow(depth,1.5)),scale};
  }
  function vehicleId(value){return ['cyan','red','gold'].includes(value)?value:'cyan';}
  function vehiclePreview(canvas,id){
    canvas.width=300;canvas.height=160;const ctx=canvas.getContext('2d');
    const paint=()=>{ctx.clearRect(0,0,300,160);ctx.save();ctx.translate(150,106);ctx.scale(1.8,1.8);kart(ctx,{vehicle:id,lane:1,laneVisual:1,parts:4},0,{cyan:'#22c4c9',red:'#ed7b59',gold:'#ebc45c'}[vehicleId(id)]);ctx.restore();};
    paint();const img=heroArt(false);if(!img.complete)img.addEventListener('load',paint,{once:true});
  }
  function kart(ctx,state,now,color) {
    const steering=motion.matches?0:Math.max(-1,Math.min(1,(state.lane??state.laneVisual)-state.laneVisual));
    const bounce=motion.matches?0:Math.sin(now*.018)*.7;
    const model=vehicleId(state.vehicle);const buggy=model==='red',pod=model==='gold';
    oval(ctx,0,16,35,10,'#0a283b55');
    ctx.save();ctx.translate(0,bounce);ctx.rotate(steering*.15);
    // Four rubber tires, hubs and suspension give steering a visible physical response.
    if(!pod)for(const y of [-19,8])for(const x of [-26,26]){
      ctx.save();ctx.translate(x,y);ctx.rotate(y<0?steering*.3:0);if(buggy)ctx.scale(1.2,1.16);
      round(ctx,-6,-11,12,22,5,'#15303c');round(ctx,-5,-9,3,17,2,'#536f7b');
      oval(ctx,0,0,3,6,'#9cbac6');ctx.restore();
    }
    if(pod){for(const x of [-25,25]){oval(ctx,x,9,9,19,'#e8faff');oval(ctx,x,12,6,17,'#59dfe9');}oval(ctx,0,0,29,30,'#f5d178');}
    if(buggy){round(ctx,-31,-32,62,6,2,'#faad68');round(ctx,-23,-34,5,44,2,'#27485a');round(ctx,18,-34,5,44,2,'#27485a');}
    round(ctx,-21,-24,42,38,12,'#184e63');round(ctx,-16,-27,32,30,9,'#102e43');
    // The rider's lower body sits inside the cockpit, preserving the original hero.
    ctx.save();ctx.beginPath();ctx.rect(-35,-75,70,73);ctx.clip();
    robot(ctx,0,-15,42,{now,parts:state.parts,color,shielded:state.shield,airborne:true,hurt:now<state.hurtUntil});ctx.restore();
    const body=ctx.createLinearGradient(-26,-8,26,20);body.addColorStop(0,'#baf8e5');body.addColorStop(.4,color||'#27bbc2');body.addColorStop(1,'#147085');
    ctx.beginPath();ctx.moveTo(-25,-7);ctx.quadraticCurveTo(-31,9,-21,20);ctx.quadraticCurveTo(0,31,21,20);ctx.quadraticCurveTo(31,9,25,-7);ctx.lineTo(15,-2);ctx.quadraticCurveTo(0,4,-15,-2);ctx.closePath();ctx.fillStyle=body;ctx.fill();
    ctx.strokeStyle='#cffff4';ctx.lineWidth=1.5;ctx.stroke();
    round(ctx,-19,14,38,7,3,'#eaf9ec');round(ctx,-8,16,16,4,2,'#f3b744');
    for(const x of [-18,18]){oval(ctx,x,8,5,3,'#ffed9e');oval(ctx,x-1,7,2,1,'#ffffff');}
    if(pod){ctx.strokeStyle='#a4edff99';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-24,23,29,0,Math.PI,Math.PI*2);ctx.stroke();}
    if(buggy){round(ctx,-23,17,46,6,2,'#3a4d5a');for(const x of [-16,16])oval(ctx,x,0,5,4,'#ffe7a0');}
    if(state.shield){ctx.strokeStyle='#8ce6ff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-13,38,51,0,0,Math.PI*2);ctx.stroke();}
    if(now<(state.boostUntil||0)){for(const x of [-16,16]){const flame=ctx.createLinearGradient(0,18,0,44);flame.addColorStop(0,'#fff5ad');flame.addColorStop(.4,'#49e7e5');flame.addColorStop(1,'#49e7e500');oval(ctx,x,29,5,16,flame);}}
    ctx.restore();
  }
  function race(ctx,W,H,state,cfg,index,now,color) {
    locationBackdrop(ctx,W,H,index);
    const biome=location(index);
    const bend=motion.matches?0:Math.sin((state.roadY||0)/1900)*W*.085;
    const point=(lane,y,lanes=cfg.lanes)=>project(W,H,lanes,lane,y,bend);
    const horizon=H*.24;
    const grass=ctx.createLinearGradient(0,horizon,0,H);grass.addColorStop(0,biome.floor+'00');grass.addColorStop(.4,biome.floor+'99');grass.addColorStop(1,biome.shade);ctx.fillStyle=grass;ctx.fillRect(0,horizon,W,H);
    function strip(y1,y2,left,right,fill){
      const a=point(left,y1,1),b=point(right,y1,1),c=point(right,y2,1),d=point(left,y2,1);
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
    }
    // Fill continuous ribbons; separate adjacent quads leave antialiasing seams.
    function ribbon(left,right,fill){
      ctx.beginPath();
      for(let i=0;i<=28;i++){const q=point(left,H*i/28,1);if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);}
      for(let i=28;i>=0;i--){const q=point(right,H*i/28,1);ctx.lineTo(q.x,q.y);}
      ctx.closePath();ctx.fillStyle=fill;ctx.fill();
    }
    ribbon(-.58,.58,'#234c4955');ribbon(-.55,.55,biome.edge);
    const asphalt=ctx.createLinearGradient(0,horizon,0,H);asphalt.addColorStop(0,biome.floor);asphalt.addColorStop(.3,biome.road);asphalt.addColorStop(1,biome.shade);
    ribbon(-.5,.5,asphalt);
    ribbon(-.46,-.452,'#b3ebea90');ribbon(.452,.46,'#b3ebea90');
    for(let y=-64+(state.roadY%64);y<H;y+=64){
      const y1=Math.max(0,y),y2=Math.min(H,y+30);if(y2<=y1)continue;
      strip(y1,y2,-.55,-.5,'#e18b53');strip(y1,y2,.5,.55,'#e18b53');
      for(let lane=1;lane<cfg.lanes;lane++){
        const a=point(lane-.5,y1),b=point(lane-.5,y2);ctx.strokeStyle='#edfaf2';ctx.lineWidth=Math.max(.6,a.scale*2.5);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
    }
    // Distant haze merges the road into the illustrated world without hiding targets.
    const haze=ctx.createLinearGradient(0,horizon,0,horizon+H*.16);haze.addColorStop(0,biome.sky+'88');haze.addColorStop(1,biome.sky+'00');ctx.fillStyle=haze;ctx.fillRect(0,horizon,W,H*.16);
    for(let y=-125+(state.roadY%125);y<H+80;y+=125)for(const side of [-1,1]){
      if(y<0)continue;const q=point(side*.72,y,1);ctx.save();ctx.translate(q.x,q.y);ctx.scale(q.scale,q.scale);
      oval(ctx,0,5,25,8,'#1f514b44');
      if(biome.index===0){
        round(ctx,-4,-34,8,37,3,'#9b7856');
        const leaf=ctx.createRadialGradient(-10,-56,2,0,-42,37);leaf.addColorStop(0,'#d9ef97');leaf.addColorStop(.3,'#73bd83');leaf.addColorStop(1,'#26766c');
        oval(ctx,-12,-42,19,23,leaf);oval(ctx,13,-42,19,23,leaf);oval(ctx,0,-59,23,25,leaf);
      } else if(biome.index===1){
        ctx.strokeStyle='#f4b9a7';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-42);ctx.moveTo(0,-16);ctx.lineTo(-18,-29);ctx.lineTo(-18,-44);ctx.moveTo(0,-25);ctx.lineTo(17,-36);ctx.lineTo(17,-52);ctx.stroke();
        for(const [x,y] of [[0,-42],[-18,-44],[17,-52]])oval(ctx,x,y,7,8,'#ffe7be');
        oval(ctx,9,0,17,7,'#f7dbb4');
      } else if(biome.index===2){
        const stone=ctx.createLinearGradient(-25,0,25,0);stone.addColorStop(0,'#f9bc83');stone.addColorStop(.5,'#d88758');stone.addColorStop(1,'#9e5552');
        round(ctx,-24,-45,46,49,8,stone);round(ctx,-17,-67,32,29,6,stone);
        for(const y of [-42,-26,-12]){ctx.fillStyle='#ffc99577';ctx.fillRect(-23,y,44,3);}
      } else {
        for(const [x,h] of [[-17,36],[0,64],[17,44]]){
          const crystal=ctx.createLinearGradient(x-9,-h,x+9,0);crystal.addColorStop(0,'#c6faff');crystal.addColorStop(.4,'#62b7f0');crystal.addColorStop(1,'#7059bc');
          ctx.fillStyle=crystal;ctx.beginPath();ctx.moveTo(x,-h);ctx.lineTo(x+10,-h+14);ctx.lineTo(x+8,0);ctx.lineTo(x-9,0);ctx.lineTo(x-10,-h+14);ctx.closePath();ctx.fill();
        }
      }
      // Small reflective track lamps are distinct from collectible shields.
      const lx=-side*29;round(ctx,lx-2,-18,4,21,2,'#edf3d8');oval(ctx,lx,-19,5,7,'#ffe599');ctx.restore();
    }
    const objects=state.spawned.map(item=>({y:item.y,item}));objects.push({y:state.carY,player:true});objects.sort((a,b)=>a.y-b.y);
    for(const o of objects){
      const q=point(o.player?state.laneVisual:o.item.lane,o.y);if(q.scale<=0||q.y<0||q.y>H+80)continue;
      ctx.save();ctx.translate(q.x,q.y);ctx.scale(q.scale,q.scale);
      if(o.player)kart(ctx,state,now,color);
      else {
        oval(ctx,0,11,16,5,'#0b35414d');
        const floating=!motion.matches&&o.item.kind==='letter'?Math.sin(now*.003+o.y*.01)*1.5:0;
        ctx.translate(0,floating-4);pickup(ctx,o.item,o.item.kind==='letter'?21:19);
      }
      ctx.restore();
    }
  }
  function sceneSize(W,H,age) {
    const preferred={tiny:2.15,child:1.9,teen:1.65,adult:1.5}[age]||1.9;
    // Preserve enough world-space height for the existing jump trajectory.
    const scale=Math.min(preferred,Math.max(1,W)/240,Math.max(1,H)/300);
    return {width:W/scale,height:H/scale,scale};
  }
  function watchSize(element,resize) {
    let frame=0;
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;resize();});};
    const observer=window.ResizeObserver?new ResizeObserver(schedule):null;
    observer?.observe(element);window.addEventListener('resize',schedule);
    return ()=>{observer?.disconnect();window.removeEventListener('resize',schedule);if(frame)cancelAnimationFrame(frame);};
  }
  function availableHeight(container,wrap,cap) {
    let rest=28, next=wrap.nextElementSibling;
    while(next) {const style=getComputedStyle(next); rest+=next.getBoundingClientRect().height+parseFloat(style.marginTop||0)+parseFloat(style.marginBottom||0);next=next.nextElementSibling;}
    return Math.max(180,Math.min(cap,window.innerHeight-wrap.getBoundingClientRect().top-rest));
  }
  function cover(canvas,kind) {
    canvas.width=450;canvas.height=210;const ctx=canvas.getContext('2d');
    function paint() {
      if(kind==='snake') {
        ctx.drawImage(board(450,210,35,13,6,1),0,0,450,210);
        serpent(ctx,[{cx:225,cy:110},{cx:183,cy:110},{cx:141,cy:110},{cx:99,cy:110}],48,{x:1,y:0},{});token(ctx,320,110,'A','letter',24,60);
      } else if(kind==='race') {
        race(ctx,450,210,{roadY:30,spawned:[{kind:'letter',text:'A',lane:0,y:80},{kind:'coin',lane:2,y:135}],carY:160,laneVisual:1,parts:2}, {lanes:3},1,0,'#b5a3d0');
      } else {
        background(ctx,450,210,0);slab(ctx,-10,169,470,45,'#d1e6d5','#7fae98',8);robot(ctx,125,150,66,{parts:2});token(ctx,275,140,'A','letter',22,65);
      }
    }
    paint(); const img=art(); if(!img.complete) img.addEventListener('load',paint,{once:true});
    const robotImage=heroArt();if(!robotImage.complete)robotImage.addEventListener('load',paint,{once:true});
  }
  const pauseLabels={en:['Pause','Continue'],ru:['Пауза','Продолжить'],de:['Pause','Weiter'],es:['Pausa','Continuar'],fr:['Pause','Continuer'],hi:['रोकें','जारी रखें'],id:['Jeda','Lanjutkan'],pt:['Pausar','Continuar'],tr:['Duraklat','Devam et'],vi:['Tạm dừng','Tiếp tục']};
  function pauseControl(container,lang,change) {
    const labels=pauseLabels[lang]||pauseLabels.en, button=document.createElement('button');
    button.type='button'; button.className='pf-icon-btn gw-pause'; button.textContent='Ⅱ '+labels[0]; button.setAttribute('aria-pressed','false');
    let paused=false;
    const toggle=()=>{ paused=!paused; button.setAttribute('aria-pressed',String(paused)); button.textContent=(paused?'▶ ':'Ⅱ ')+labels[paused?1:0]; change(paused); };
    button.addEventListener('click',toggle); container.querySelector('.pf-subhud').append(button);
    return ()=>{button.removeEventListener('click',toggle);button.remove();};
  }
  const gameTips = {
    en:['Collect the target shown above the field. Change direction with the arrows or swipe.', 'Collect the target shown above the road. Change lanes to avoid obstacles.', 'Collect the target shown above the field. Jump over obstacles; tap twice for a double jump.'],
    ru:['Собирай цель, показанную над полем. Поворачивай стрелками или свайпом.', 'Собирай цель, показанную над дорогой. Меняй полосы, чтобы обходить помехи.', 'Собирай цель, показанную над полем. Перепрыгивай помехи. Два нажатия — двойной прыжок.'],
    de:['Sammle das Ziel über dem Spielfeld. Steuere mit Pfeilen oder Wischen.', 'Sammle das Ziel über der Straße. Wechsle die Spur, um Hindernissen auszuweichen.', 'Sammle das Ziel über dem Spielfeld. Springe über Hindernisse; zweimal tippen ergibt einen Doppelsprung.'],
    es:['Recoge el objetivo que aparece sobre el tablero. Gira con las flechas o desliza.', 'Recoge el objetivo que aparece sobre la pista. Cambia de carril para evitar obstáculos.', 'Recoge el objetivo que aparece sobre el campo. Salta los obstáculos; toca dos veces para un salto doble.'],
    fr:['Attrape la cible indiquée au-dessus du plateau. Tourne avec les flèches ou en glissant.', 'Attrape la cible indiquée au-dessus de la route. Change de voie pour éviter les obstacles.', 'Attrape la cible indiquée au-dessus du terrain. Saute par-dessus les obstacles ; touche deux fois pour un double saut.'],
    hi:['मैदान के ऊपर दिखाया गया लक्ष्य चुनो। तीर या स्वाइप से दिशा बदलो।', 'सड़क के ऊपर दिखाया गया लक्ष्य चुनो। बाधाओं से बचने के लिए लेन बदलो।', 'मैदान के ऊपर दिखाया गया लक्ष्य चुनो। बाधाओं के ऊपर कूदो। दो बार टैप करने से दोहरी छलाँग लगती है।'],
    id:['Ambil target yang ditampilkan di atas papan. Belok dengan panah atau geser.', 'Ambil target yang ditampilkan di atas jalan. Pindah jalur untuk menghindari rintangan.', 'Ambil target yang ditampilkan di atas arena. Lompati rintangan; ketuk dua kali untuk melompat dua kali.'],
    pt:['Pegue o alvo mostrado acima do tabuleiro. Vire com as setas ou deslize.', 'Pegue o alvo mostrado acima da pista. Mude de faixa para evitar obstáculos.', 'Pegue o alvo mostrado acima do campo. Pule os obstáculos; toque duas vezes para um salto duplo.'],
    tr:['Alanın üstünde gösterilen hedefi topla. Oklarla veya kaydırarak yön değiştir.', 'Yolun üstünde gösterilen hedefi topla. Engellerden kaçmak için şerit değiştir.', 'Alanın üstünde gösterilen hedefi topla. Engellerin üzerinden atla; çift zıplamak için iki kez dokun.'],
    vi:['Thu thập mục tiêu phía trên bàn chơi. Đổi hướng bằng mũi tên hoặc vuốt.', 'Thu thập mục tiêu phía trên đường. Đổi làn để tránh chướng ngại vật.', 'Thu thập mục tiêu phía trên sân chơi. Nhảy qua chướng ngại vật; chạm hai lần để nhảy kép.'],
  };
  const tip = (lang,kind) => (gameTips[lang]||gameTips.en)[['snake','race','runner'].indexOf(kind)]||'';
  const bonusWords={
    en:['Armor','High jump','Magnet','Active bonuses','s','Armor blocks one hit or lasts 12 seconds. High jump lasts 10 seconds. The magnet pulls nearby targets for 8 seconds.'],
    ru:['Броня','Высокий прыжок','Магнит','Активные бонусы','с','Броня защищает от одного удара или действует 12 секунд. Высокий прыжок — 10 секунд. Магнит притягивает близкие цели 8 секунд.'],
    de:['Rüstung','Hochsprung','Magnet','Aktive Boni','s','Die Rüstung hält einen Treffer oder 12 Sekunden. Hochsprung hält 10 Sekunden. Der Magnet zieht 8 Sekunden lang nahe Ziele an.'],
    es:['Armadura','Salto alto','Imán','Bonos activos','s','La armadura protege de un golpe o dura 12 segundos. El salto alto dura 10 segundos. El imán atrae objetivos cercanos durante 8 segundos.'],
    fr:['Armure','Saut haut','Aimant','Bonus actifs','s','L’armure protège d’un choc ou dure 12 secondes. Le saut haut dure 10 secondes. L’aimant attire les cibles proches pendant 8 secondes.'],
    hi:['कवच','ऊँची छलाँग','चुंबक','सक्रिय बोनस','से','कवच एक टक्कर से बचाता है या 12 सेकंड रहता है। ऊँची छलाँग 10 सेकंड रहती है। चुंबक 8 सेकंड तक पास के लक्ष्य खींचता है।'],
    id:['Pelindung','Lompatan tinggi','Magnet','Bonus aktif','d','Pelindung menahan satu benturan atau bertahan 12 detik. Lompatan tinggi bertahan 10 detik. Magnet menarik target dekat selama 8 detik.'],
    pt:['Armadura','Salto alto','Ímã','Bônus ativos','s','A armadura protege de um impacto ou dura 12 segundos. O salto alto dura 10 segundos. O ímã atrai alvos próximos por 8 segundos.'],
    tr:['Zırh','Yüksek zıplama','Mıknatıs','Etkin bonuslar','sn','Zırh bir darbeyi engeller veya 12 saniye sürer. Yüksek zıplama 10 saniye sürer. Mıknatıs 8 saniye yakındaki hedefleri çeker.'],
    vi:['Giáp','Nhảy cao','Nam châm','Phần thưởng đang dùng','giây','Giáp đỡ một va chạm hoặc tồn tại 12 giây. Nhảy cao kéo dài 10 giây. Nam châm hút mục tiêu ở gần trong 8 giây.'],
  };
  function effectStatus(container,lang,effects) {
    const words=bonusWords[lang]||bonusWords.en,bar=document.createElement('div');
    bar.className='gw-effects';bar.setAttribute('aria-label',words[3]);
    const badges=['shield','jump','magnet'].map((kind,i)=>{const el=document.createElement('span');el.hidden=true;bar.append(el);return {kind,i,el};});
    container.querySelector('.snake-canvas-wrap').append(bar);
    return {update(){for(const {kind,i,el} of badges){const seconds=effects.remaining(kind);el.hidden=!seconds;const text=['🛡','⇧','🧲'][i]+' '+words[i]+' '+seconds+' '+words[4];if(el.textContent!==text)el.textContent=text;}},dispose(){bar.remove();}};
  }
  const paceLabels={en:'Gentle pace',ru:'Спокойный темп',de:'Ruhiges Tempo',es:'Ritmo tranquilo',fr:'Rythme tranquille',hi:'धीमी गति',id:'Tempo santai',pt:'Ritmo tranquilo',tr:'Sakin tempo',vi:'Nhịp độ chậm'};
  const sessionLabels = {
    en:['Help','Full screen','Exit full screen','How to play','Back to game','The game is paused. Take your time.','Full screen is unavailable here. You can keep playing in this window.','Next','Up','Down','Left','Right'],
    ru:['Подсказки','На весь экран','Свернуть экран','Как играть','Вернуться к игре','Игра на паузе. Можно не торопиться.','Полный экран здесь недоступен. Можно продолжить играть в этом окне.','Собери','Вверх','Вниз','Влево','Вправо'],
    de:['Hilfe','Vollbild','Vollbild verlassen','So spielst du','Zurück zum Spiel','Das Spiel pausiert. Lass dir Zeit.','Vollbild ist hier nicht verfügbar. Du kannst im Fenster weiterspielen.','Sammle','Oben','Unten','Links','Rechts'],
    es:['Ayuda','Pantalla completa','Salir de pantalla completa','Cómo jugar','Volver al juego','El juego está en pausa. Tómate tu tiempo.','La pantalla completa no está disponible. Puedes seguir jugando en esta ventana.','Recoge','Arriba','Abajo','Izquierda','Derecha'],
    fr:['Aide','Plein écran','Quitter le plein écran','Comment jouer','Retour au jeu','Le jeu est en pause. Prends ton temps.','Le plein écran est indisponible. Tu peux continuer dans cette fenêtre.','À attraper','Haut','Bas','Gauche','Droite'],
    hi:['मदद','पूरी स्क्रीन','पूरी स्क्रीन से बाहर','कैसे खेलें','खेल में लौटें','खेल रुका है। आराम से पढ़ें।','यहाँ पूरी स्क्रीन उपलब्ध नहीं है। इसी विंडो में खेल सकते हैं।','इसे चुनें','ऊपर','नीचे','बाएँ','दाएँ'],
    id:['Petunjuk','Layar penuh','Keluar layar penuh','Cara bermain','Kembali ke permainan','Permainan dijeda. Tidak perlu terburu-buru.','Layar penuh tidak tersedia. Kamu bisa bermain di jendela ini.','Ambil','Atas','Bawah','Kiri','Kanan'],
    pt:['Ajuda','Tela cheia','Sair da tela cheia','Como jogar','Voltar ao jogo','O jogo está pausado. Leia com calma.','Tela cheia indisponível. Você pode continuar nesta janela.','Pegue','Cima','Baixo','Esquerda','Direita'],
    tr:['Yardım','Tam ekran','Tam ekrandan çık','Nasıl oynanır','Oyuna dön','Oyun duraklatıldı. Acele etmene gerek yok.','Tam ekran kullanılamıyor. Bu pencerede oynamaya devam edebilirsin.','Topla','Yukarı','Aşağı','Sol','Sağ'],
    vi:['Hướng dẫn','Toàn màn hình','Thoát toàn màn hình','Cách chơi','Trở lại trò chơi','Trò chơi đã tạm dừng. Em cứ đọc thong thả nhé.','Không thể mở toàn màn hình. Em vẫn có thể chơi trong cửa sổ này.','Thu thập','Lên','Xuống','Trái','Phải'],
  };
  function sessionControls(container, lang, options) {
    const words=sessionLabels[lang]||sessionLabels.en, pauses=pauseLabels[lang]||pauseLabels.en;
    const toolbar=container.querySelector('.pf-subhud'), canvas=container.querySelector('canvas');
    const area=container.closest('#game')||container;
    container.classList.add('gw-session'); area.scrollTop=0;
    // Keep keyboard and screen-reader navigation inside the active game.
    const inertSiblings=[];
    for(let branch=area;branch && branch.parentElement && branch!==document.body;branch=branch.parentElement) {
      for(const sibling of branch.parentElement.children) if(sibling!==branch) {
        inertSiblings.push([sibling,sibling.inert]);sibling.inert=true;
      }
    }
    canvas.tabIndex=0; canvas.setAttribute('aria-label',options.hint);
    const handlers=[];
    function on(el,event,fn) {el.addEventListener(event,fn);handlers.push(()=>el.removeEventListener(event,fn));}
    function button(text,cls) {const b=document.createElement('button');b.type='button';b.className='pf-icon-btn '+cls;b.textContent=text;return b;}
    const pause=button('Ⅱ '+pauses[0],'gw-pause');pause.setAttribute('aria-pressed','false');pause.setAttribute('aria-label',pause.textContent);
    const help=button('? '+words[0],'gw-help');help.setAttribute('aria-label',words[0]);
    const full=button('⛶ '+words[1],'gw-fullscreen');full.setAttribute('aria-label',words[1]);
    toolbar.append(pause,help);
    if(area.requestFullscreen && document.fullscreenEnabled) toolbar.append(full);
    const left=container.querySelector('#rc-left'), right=container.querySelector('#rc-right');
    if(left)left.setAttribute('aria-label',words[10]);if(right)right.setAttribute('aria-label',words[11]);
    toolbar.querySelectorAll('button[title]').forEach(b=>b.setAttribute('aria-label',b.title));
    container.querySelectorAll('[data-dir]').forEach(b=>{const i=['up','down','left','right'].indexOf(b.dataset.dir);if(i>=0)b.setAttribute('aria-label',words[8+i]);});
    // A compact, always-available hint is useful even after the first visit.
    let hint=container.querySelector('.snake-hint');
    if(!hint) {hint=document.createElement('p');hint.className='snake-hint';hint.textContent=options.hint;container.append(hint);}
    const notice=document.createElement('span');notice.className='gw-status';notice.setAttribute('role','status');(container.querySelector('.snake-canvas-wrap')||toolbar).append(notice);
    const dialog=document.createElement('dialog');dialog.className='gw-help-dialog';
    const title=document.createElement('h2');title.textContent=words[3];title.id='gw-help-title';
    dialog.setAttribute('aria-labelledby',title.id);
    const instruction=document.createElement('p');instruction.textContent=tip(lang,options.kind)+' '+options.hint;
    const reassurance=document.createElement('p');reassurance.className='gw-reassurance';reassurance.textContent=words[5];
    const close=button(words[4]+' →','gw-return');
    dialog.append(title,instruction,reassurance,close);container.append(dialog);
    if(options.kind==='runner'||options.kind==='race') {
      const bonusHelp=document.createElement('p');bonusHelp.className='gw-bonus-guide';
      const wordsBonus=bonusWords[lang]||bonusWords.en;
      bonusHelp.textContent=options.kind==='runner'?wordsBonus[5]:wordsBonus[5].split(/[.!।]/)[0]+'.';
      dialog.insertBefore(bonusHelp,reassurance);
    }
    let manual=false, disposed=false;
    function sync() {
      const stopped=manual||dialog.open;
      pause.setAttribute('aria-pressed',String(manual));pause.textContent=(manual?'▶ ':'Ⅱ ')+pauses[manual?1:0];
      pause.setAttribute('aria-label',pause.textContent);
      container.classList.toggle('gw-paused',stopped);options.pause(stopped);
      notice.textContent=manual?words[5]:'';
    }
    on(pause,'click',()=>{manual=!manual;sync();if(!manual)canvas.focus({preventScroll:true});});
    on(help,'click',()=>{dialog.showModal();sync();close.focus();});
    on(close,'click',()=>dialog.close());
    on(dialog,'close',()=>{if(disposed)return;window.stopSpeech?.();sync();help.focus({preventScroll:true});});
    if(window.speakText && window.speechSynthesis) {
      const read=button('🔊 '+(window.LANG_DATA?.ui?.ui_read_aloud||words[0]),'gw-read');
      dialog.insertBefore(read,close);on(read,'click',()=>window.speakText(instruction.textContent,read));
    }
    const paceBadge=document.createElement('span');paceBadge.className='gw-pace-state';toolbar.append(paceBadge);
    if(options.pace) {
      const label=paceLabels[lang]||paceLabels.en, slow=button(label,'gw-slow');
      slow.setAttribute('aria-pressed','false');dialog.insertBefore(slow,close);
      let gentle=false;
      on(slow,'click',()=>{gentle=!gentle;slow.setAttribute('aria-pressed',String(gentle));slow.textContent=(gentle?'✓ ':'')+label;paceBadge.textContent=gentle?'◷ '+label:'';options.pace(gentle?.65:1);});
    }
    on(full,'click',async()=>{
      try {if(document.fullscreenElement===area)await document.exitFullscreen();else await area.requestFullscreen();}
      catch (_) {if(!disposed)notice.textContent=words[6];}
    });
    on(document,'fullscreenchange',()=>{const label=words[document.fullscreenElement===area?2:1];full.textContent='⛶ '+label;full.setAttribute('aria-label',label);});
    on(document,'visibilitychange',()=>{if(document.hidden){manual=true;sync();}});
    on(window,'blur',()=>{manual=true;sync();});
    on(window,'resize',()=>{if(!container.querySelector('.snake-overlay:not(.hidden)')){manual=true;sync();}});
    // This runs synchronously from the child's game/level click. Unsupported
    // native fullscreen leaves the already-full-viewport game usable.
    if(area.requestFullscreen && document.fullscreenEnabled && !document.fullscreenElement && window.navigator?.userActivation?.isActive) {
      area.requestFullscreen().catch(()=>{});
    }
    // Escape outside a dialog pauses. Inside, the native dialog handles Escape.
    on(document,'keydown',e=>{if(e.key==='Escape'&&!dialog.open){manual=true;sync();}});
    let goalTimer;
    if(options.goal) {
      const goal=document.createElement('p');goal.className='gw-objective';
      const label=document.createElement('span');label.textContent=words[7]+'  ';
      const target=document.createElement('strong');goal.append(label,target);
      container.insertBefore(goal,container.querySelector('.snake-canvas-wrap'));
      const update=()=>{const value=options.goal()||'✓';if(target.textContent!==value)target.textContent=value;};
      update();goalTimer=setInterval(update,250);
    }
    return ()=>{
      disposed=true;clearInterval(goalTimer);handlers.forEach(off=>off());
      if(dialog.open)dialog.close();dialog.remove();pause.remove();help.remove();full.remove();notice.remove();paceBadge.remove();
      inertSiblings.forEach(([element,value])=>{element.inert=value;});
      window.stopSpeech?.();container.classList.remove('gw-session','gw-paused');
      if(document.fullscreenElement===area)document.exitFullscreen().catch(()=>{});
    };
  }
  window.KAT_Worlds=Object.freeze({location,locationPreview,locationBackdrop,expeditionText,vehicleId,vehiclePreview,sessionControls,effectStatus,sceneSize,watchSize,tip,ground,availableHeight,cover,pauseControl,palette,round,oval,slab,robot,token,pickup,background,board,serpent,snakeLinks,project,race,reducedMotion:()=>motion.matches});
})();
