import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x10151e, .035);
const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
camera.position.set(0, 7.2, 11.6);
const world = new THREE.Group(); scene.add(world);
const clock = new THREE.Clock();
const clamp = THREE.MathUtils.clamp;
const mat = (color, roughness=.8, metalness=0, emissive=0x000000, intensity=0) => new THREE.MeshStandardMaterial({color, roughness, metalness, emissive, emissiveIntensity:intensity});
const stone = mat(0x353c42, .94), darkStone = mat(0x1d242b, .92), gold = mat(0x9b7950, .45, .68), playerMat = mat(0x536e69,.63,.24), cloth = mat(0x283b3c,.95), bone = mat(0x77766f,.8,.15), glow = mat(0xff8557,.3,.2,0xff3d1c,3.8), cyan = mat(0x91cebd,.35,.15,0x52d3b1,1.3);
const floorMat = new THREE.MeshStandardMaterial({color:0x30363a,roughness:.96, metalness:.1});
scene.add(new THREE.HemisphereLight(0xb7c7d7,0x19151a,1.35));
const keyLight = new THREE.DirectionalLight(0xffd5a0,3.1); keyLight.position.set(-4,9,5); keyLight.castShadow=true; keyLight.shadow.mapSize.set(1024,1024); scene.add(keyLight);
const rimLight = new THREE.PointLight(0x597c9b,34,16,2); rimLight.position.set(4,4,-4); scene.add(rimLight);
const emberLight = new THREE.PointLight(0xd05e38,14,9,2); emberLight.position.set(-3,2,-2); scene.add(emberLight);

function mesh(geometry, material, parent, x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function sphere(parent,material,x,y,z,sx,sy=sx,sz=sx){const m=mesh(new THREE.SphereGeometry(1,20,16),material,parent,x,y,z);m.scale.set(sx,sy,sz);return m;}
function cylinder(parent,material,x,y,z,rt,rb,h,segments=12){const m=mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material,parent,x,y,z);return m;}

// Ancient circular arena
const floor=mesh(new THREE.CircleGeometry(7.5,72),floorMat,world,0,-.12,0); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true;
const platform=mesh(new THREE.CylinderGeometry(7.5,7.8,.26,72),mat(0x252a30,.91,.2),world,0,-.28,0);
const ring=mesh(new THREE.TorusGeometry(5.8,.035,8,90),gold,world,0,.015,0); ring.rotation.x=Math.PI/2;
const ring2=mesh(new THREE.TorusGeometry(6.7,.022,6,90),mat(0x71624a,.65,.45),world,0,.018,0);ring2.rotation.x=Math.PI/2;
for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const rune=mesh(new THREE.BoxGeometry(.06,.018,.58),i%3===0?gold:darkStone,world,Math.cos(a)*5.8,.025,Math.sin(a)*5.8);rune.rotation.y=-a;}
for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const x=Math.cos(a)*8.8,z=Math.sin(a)*8.8;const base=cylinder(world,darkStone,x,.1,z,.46,.62,1.05,8);base.rotation.y=a;const cap=cylinder(world,stone,x,.75,z,.34,.46,.28,8);cap.rotation.y=a;const flame=sphere(world,glow,x,.98,z,.11,.14,.11);flame.userData.phase=i;}
// Floating ash motes
const moteMat=new THREE.MeshBasicMaterial({color:0xd9a66c,transparent:true,opacity:.65});const motes=[];
for(let i=0;i<55;i++){const m=mesh(new THREE.SphereGeometry(.018+Math.random()*.025,6,6),moteMat,world,(Math.random()-.5)*13,.15+Math.random()*5,(Math.random()-.5)*12);m.userData={phase:Math.random()*7,baseY:m.position.y};motes.push(m);}

// Procedural wanderer model
const player=new THREE.Group();world.add(player);player.position.set(0,0,2.1);player.rotation.y=Math.PI;
const pVisual=new THREE.Group();player.add(pVisual);
cylinder(pVisual,playerMat,0,.82,0,.25,.3,.6,10);
sphere(pVisual,playerMat,0,1.38,0,.22,.25,.22);
const hood=sphere(pVisual,cloth,0,1.46,-.055,.245,.28,.24); hood.scale.z=.98;
sphere(pVisual,cyan,0,1.43,.17,.035,.025,.025);
const cape=mesh(new THREE.ConeGeometry(.34,.75,6),cloth,pVisual,0,.72,-.25);cape.rotation.x=-.19;
const armL=cylinder(pVisual,playerMat,-.34,.9,0,.085,.11,.44,8);armL.rotation.z=-.28;
const armR=cylinder(pVisual,playerMat,.34,.9,0,.085,.11,.44,8);armR.rotation.z=.28;
const legL=cylinder(pVisual,darkStone,-.14,.28,0,.11,.13,.5,8);legL.rotation.z=-.08;
const legR=cylinder(pVisual,darkStone,.14,.28,0,.11,.13,.5,8);legR.rotation.z=.08;
// sword held in right hand
const sword=new THREE.Group();pVisual.add(sword);sword.position.set(.49,1.02,.08);sword.rotation.z=-.35;
const blade=mesh(new THREE.BoxGeometry(.075,.68,.045),mat(0xc8d4cd,.24,.8),sword,0,.4,0);blade.castShadow=true;
const tip=mesh(new THREE.ConeGeometry(.054,.17,4),mat(0xb6c8c0,.23,.8),sword,0,.81,0);tip.rotation.z=Math.PI;
const guard=mesh(new THREE.BoxGeometry(.3,.06,.085),gold,sword,0,.08,0);
cylinder(sword,cloth,0,-.12,0,.055,.05,.22,8);
const playerAura=mesh(new THREE.TorusGeometry(.38,.022,8,32),cyan,world,0,.04,2.1);playerAura.rotation.x=Math.PI/2;

// The abyss guardian
const boss=new THREE.Group();world.add(boss);boss.position.set(0,0,-2.05);
const bVisual=new THREE.Group();boss.add(bVisual);
// broad armored torso and plated shoulders
sphere(bVisual,darkStone,0,1.75,0,.67,.87,.47);
sphere(bVisual,stone,0,1.94,.035,.56,.67,.46);
const belly=sphere(bVisual,mat(0x41494b,.83,.25),0,1.56,.34,.38,.53,.2);
for(let i=0;i<3;i++){const plate=mesh(new THREE.BoxGeometry(.62,.11,.11),gold,bVisual,0,1.78+i*.23,.49);plate.rotation.z=.08;}
sphere(bVisual,darkStone,0,2.72,-.02,.42,.46,.4);
// horn crown
for(const side of [-1,1]){const horn=mesh(new THREE.ConeGeometry(.14,.66,7),bone,bVisual,side*.33,3.08,-.03);horn.rotation.z=side*-.38;horn.rotation.x=-.08;}
const eyeL=sphere(bVisual,glow,-.17,2.79,.335,.075,.052,.04), eyeR=sphere(bVisual,glow,.17,2.79,.335,.075,.052,.04);
// arms, fists, spikes
const armParts=[];
for(const side of [-1,1]){const shoulder=sphere(bVisual,stone,side*.68,2.23,0,.34,.35,.34);const arm=cylinder(bVisual,darkStone,side*.83,1.82,.03,.22,.28,.7,9);arm.rotation.z=side*-.2;const fist=sphere(bVisual,stone,side*.92,1.4,.11,.3,.27,.3);const spike=mesh(new THREE.ConeGeometry(.12,.48,6),bone,bVisual,side*1.03,1.28,.2);spike.rotation.x=Math.PI/2;armParts.push({arm,fist,shoulder});}
// back spines
for(let i=0;i<5;i++){const sp=mesh(new THREE.ConeGeometry(.13,.5,6),bone,bVisual,(i-2)*.22,2.5-(Math.abs(i-2)*.09),-.35);sp.rotation.x=-.3;sp.rotation.z=(i-2)*.15;}
// foot plates
for(const side of [-1,1]){const foot=sphere(bVisual,stone,side*.38,.3,.1,.34,.23,.42);foot.rotation.y=side*.16;}
const bossAura=mesh(new THREE.TorusGeometry(1.05,.035,8,48),glow,world,0,.05,-2.05);bossAura.rotation.x=Math.PI/2;
const groundGlow=mesh(new THREE.CircleGeometry(1.2,32),new THREE.MeshBasicMaterial({color:0x5d291f,transparent:true,opacity:.24}),world,0,.01,-2.05);groundGlow.rotation.x=-Math.PI/2;

// Floating shards around boss
const shards=[];
for(let i=0;i<9;i++){const a=i/9*Math.PI*2;const shard=mesh(new THREE.OctahedronGeometry(.12+Math.random()*.1),mat(0x615e59,.45,.6,0x9a5030,.5),world,Math.cos(a)*1.5,1.2+Math.random()*1.8,-2.05+Math.sin(a)*1.5);shard.userData={a,r:1.35+Math.random()*.7,speed:.25+Math.random()*.3,phase:Math.random()*6};shards.push(shard);}

const state={active:false,ended:false,pHp:100,bHp:2400,focus:100,attackCd:0,dodgeCd:0,dodgeTime:0,invuln:0,attackAnim:0,impact:0,bossMode:'idle',bossTimer:1.6,bossAttack:0,elapsed:0,hitStop:0,shake:0,joyX:0,joyY:0,dodgeX:0,dodgeY:0};
const keys={};
const ui={pBar:document.querySelector('#player-health'),bBar:document.querySelector('#boss-health'),pText:document.querySelector('#player-hp-label'),bText:document.querySelector('#boss-hp-label'),focus:document.querySelector('#stamina'),focusLabel:document.querySelector('#stamina-label'),phase:document.querySelector('#phase-label'),status:document.querySelector('#status-text'),warning:document.querySelector('#warning'),warningText:document.querySelector('#warning-text'),flash:document.querySelector('#screen-flash'),message:document.querySelector('#center-message')};
let messageTimer=0;
function announce(text, duration=1){ui.message.textContent=text;ui.message.classList.add('show');messageTimer=duration;}
function updateHud(){ui.pBar.style.width=`${state.pHp}%`;ui.pText.textContent=`${Math.ceil(state.pHp)} / 100`;ui.focus.style.width=`${state.focus}%`;ui.focusLabel.textContent=Math.floor(state.focus);ui.bBar.style.width=`${state.bHp/24}%`;ui.bText.textContent=`${Math.ceil(state.bHp).toLocaleString('pt-BR')} / 2.400`;ui.phase.textContent=state.bHp<1200?'FASE II':'FASE I';ui.status.textContent=state.bossMode==='telegraph'?'O GUARDIÃO PREPARA O GOLPE':state.bossMode==='recover'?'ABERTURA — ATAQUE!':'A BATALHA COMEÇOU';}
function flash(kind='hit'){ui.flash.className=`screen-flash ${kind}`;setTimeout(()=>ui.flash.className='screen-flash',260);}
function damageBoss(amount){if(!state.active||state.ended)return;state.bHp=Math.max(0,state.bHp-amount);state.focus=clamp(state.focus+9,0,100);state.hitStop=.06;state.shake=.12;flash();if(state.bHp<=0)endGame(true);updateHud();}
function damagePlayer(amount){if(state.invuln>0||!state.active||state.ended)return;state.pHp=Math.max(0,state.pHp-amount);state.invuln=.8;state.shake=.27;flash('damage');updateHud();if(state.pHp<=0)endGame(false);}
function doAttack(special=false){if(!state.active||state.ended)return;if(special){if(state.focus<60){announce('FOCO INSUFICIENTE',.8);return;}state.focus-=60;state.attackCd=.8;state.attackAnim=.62;state.impact=.5;flash();announce('RUPTURA DO VÉU',.7);const dist=player.position.distanceTo(boss.position);if(dist<4.2)damageBoss(340);else announce('ALCANCE INSUFICIENTE',.8);updateHud();return;}if(state.attackCd>0)return;state.attackCd=.46;state.attackAnim=.42;state.impact=.18;const d=player.position.distanceTo(boss.position);if(d<2.8){const dmg=state.bossMode==='recover'?150:105;damageBoss(dmg);if(state.bHp>0&&state.bossMode==='recover'){state.bossTimer=Math.max(state.bossTimer,.55);}}else announce('APROXIME-SE DO GUARDIÃO',.65);}
function dodge(){if(!state.active||state.ended||state.dodgeCd>0||state.focus<18)return;state.focus-=18;state.dodgeCd=.75;state.dodgeTime=.32;state.invuln=.52;if(Math.abs(state.joyX)+Math.abs(state.joyY)<.1){const d=new THREE.Vector3(player.position.x-boss.position.x,0,player.position.z-boss.position.z).normalize();state.dodgeX=d.x;state.dodgeY=d.z;}else{const d=new THREE.Vector3(state.joyX,0,state.joyY).normalize();state.dodgeX=d.x;state.dodgeY=d.z;}updateHud();}
function endGame(win){state.ended=true;state.active=false;ui.warning.classList.remove('show');const overlay=document.querySelector('#end-overlay');overlay.classList.remove('hidden');document.querySelector('#end-kicker').textContent=win?'O VÉU CEDE':'A ESCURIDÃO VENCE';document.querySelector('#end-title').textContent=win?'Vitória':'Derrota';document.querySelector('#end-copy').textContent=win?'O guardião voltou ao silêncio. A passagem está livre.':'A arena silencia. Erga-se e tente novamente.';document.querySelector('#end-icon').textContent=win?'✦':'◈';}
function begin(){document.querySelector('#intro').classList.add('leaving');state.active=true;announce('ENFRENTE KHAR’ZUL',1.3);}
function reset(){state.pHp=100;state.bHp=2400;state.focus=100;state.active=true;state.ended=false;state.attackCd=0;state.dodgeCd=0;state.invuln=0;state.bossMode='idle';state.bossTimer=1.5;state.elapsed=0;player.position.set(0,0,2.1);player.rotation.y=Math.PI;boss.position.set(0,0,-2.05);bVisual.rotation.set(0,0,0);document.querySelector('#end-overlay').classList.add('hidden');updateHud();}

// Bind desktop and touch inputs
window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();if(e.repeat)return;if(e.key.toLowerCase()==='j')doAttack();if(e.key.toLowerCase()==='k')doAttack(true);if(e.key===' '||e.key.toLowerCase()==='shift')dodge();});
window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
document.querySelector('#begin-btn').addEventListener('click',begin);
document.querySelector('#restart-btn').addEventListener('click',reset);
document.querySelector('#attack-btn').addEventListener('pointerdown',e=>{e.preventDefault();doAttack();});
document.querySelector('#special-btn').addEventListener('pointerdown',e=>{e.preventDefault();doAttack(true);});
document.querySelector('#dodge-btn').addEventListener('pointerdown',e=>{e.preventDefault();dodge();});
const joy=document.querySelector('#joystick'),knob=document.querySelector('#joy-knob');let joyPointer=null;
joy.addEventListener('pointerdown',e=>{joyPointer=e.pointerId;joy.setPointerCapture(joyPointer);moveJoy(e);});
joy.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)moveJoy(e);});
function moveJoy(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,max=36,len=Math.hypot(dx,dy),scale=Math.min(1,max/(len||1));state.joyX=dx/(len||1)*scale;state.joyY=dy/(len||1)*scale;knob.style.transform=`translate(calc(-50% + ${state.joyX*max}px),calc(-50% + ${state.joyY*max}px))`;}
function releaseJoy(){joyPointer=null;state.joyX=state.joyY=0;knob.style.transform='translate(-50%,-50%)';}
joy.addEventListener('pointerup',releaseJoy);joy.addEventListener('pointercancel',releaseJoy);
let audioOn=false,audioCtx=null;
document.querySelector('#sound-btn').addEventListener('click',()=>{audioOn=!audioOn;document.querySelector('#sound-btn').style.color=audioOn?'#f0c982':'#cdbb95';if(audioOn&&!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();});

// Impact sparks and combat loop
const sparks=[];
function burstAt(x,z,color=0xffb875){for(let i=0;i<12;i++){const m=mesh(new THREE.SphereGeometry(.035,6,6),new THREE.MeshBasicMaterial({color,transparent:true}),world,x,.8+Math.random()*.9,z);const a=Math.random()*Math.PI*2,s=.8+Math.random()*1.8;m.userData={vx:Math.cos(a)*s,vy:Math.random()*2, vz:Math.sin(a)*s,life:.45+Math.random()*.35};sparks.push(m);}}
const warningRing=mesh(new THREE.TorusGeometry(1,.045,8,48),new THREE.MeshBasicMaterial({color:0xff6042,transparent:true,opacity:.75}),world,0,.04,-2.05);warningRing.rotation.x=Math.PI/2;warningRing.visible=false;
const warningFill=mesh(new THREE.CircleGeometry(1,32),new THREE.MeshBasicMaterial({color:0xb43929,transparent:true,opacity:.14,depthWrite:false}),world,0,.025,-2.05);warningFill.rotation.x=-Math.PI/2;warningFill.visible=false;
let camKick=0;
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;if(w/h<.8){camera.fov=49;camera.position.set(0,8.6,13.2);}else{camera.fov=42;camera.position.set(0,7.2,11.6);}camera.updateProjectionMatrix();camera.lookAt(0,1.05,-.3);}
window.addEventListener('resize',resize);resize();updateHud();
function tick(){requestAnimationFrame(tick);const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;state.elapsed+=dt;
  // atmospheric details
  for(const m of motes){m.position.y=m.userData.baseY+Math.sin(t*.7+m.userData.phase)*.24;m.position.x+=Math.sin(t*.2+m.userData.phase)*.0008;}
  for(const s of shards){s.userData.a+=dt*s.userData.speed;s.position.set(Math.cos(s.userData.a)*s.userData.r,1.6+Math.sin(t*.8+s.userData.phase)*.55,-2.05+Math.sin(s.userData.a)*s.userData.r);s.rotation.x+=dt*.7;s.rotation.y+=dt*.9;}
  for(const f of world.children){if(f.userData.phase!==undefined&&f.material===glow)f.scale.setScalar(.85+Math.sin(t*3+f.userData.phase)*.15);}
  if(state.active&&!state.ended){
    const ix=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+state.joyX;
    const iz=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+state.joyY;
    let vx=ix,vz=iz;const len=Math.hypot(vx,vz);if(len>1){vx/=len;vz/=len;}
    if(state.dodgeTime>0){state.dodgeTime-=dt;player.position.x+=vx*dt*9;player.position.z+=vz*dt*9;if(Math.hypot(vx,vz)<.1){vx=state.dodgeX;vz=state.dodgeY;player.position.x+=vx*dt*8;player.position.z+=vz*dt*8;}}
    else{player.position.x+=vx*dt*3.1;player.position.z+=vz*dt*3.1;}
    player.position.x=clamp(player.position.x,-5.7,5.7);player.position.z=clamp(player.position.z,-5.9,5.2);
    if(len>.08){const target=Math.atan2(vx,vz);player.rotation.y=THREE.MathUtils.damp(player.rotation.y,target,9,dt);pVisual.position.y=Math.sin(t*12)*.035;pVisual.rotation.z=THREE.MathUtils.damp(pVisual.rotation.z,clamp(-vx*.1,-.12,.12),8,dt);}else{pVisual.position.y=THREE.MathUtils.damp(pVisual.position.y,0,8,dt);pVisual.rotation.z=THREE.MathUtils.damp(pVisual.rotation.z,0,8,dt);}
    state.attackCd=Math.max(0,state.attackCd-dt);state.dodgeCd=Math.max(0,state.dodgeCd-dt);state.invuln=Math.max(0,state.invuln-dt);state.focus=clamp(state.focus+dt*4,0,100);state.attackAnim=Math.max(0,state.attackAnim-dt);state.impact=Math.max(0,state.impact-dt);
    const swing=state.attackAnim>0?Math.sin((state.attackAnim/(state.attackAnim>.5?.62:.42))*Math.PI)*1.5:0;sword.rotation.z=-.35-swing*.9;sword.rotation.x=swing*.8;pVisual.rotation.y=THREE.MathUtils.damp(pVisual.rotation.y,0,5,dt);
    player.visible=state.invuln<=0||Math.floor(t*17)%2===0;
    // Boss wind-up / strike / recovery rhythm
    const enraged=state.bHp<1200;state.bossTimer-=dt;
    if(state.bossMode==='idle'&&state.bossTimer<=0){state.bossMode='telegraph';state.bossTimer=enraged?.72:1.04;ui.warningText.textContent=enraged?'FÚRIA DO ABISMO':'IMPACTO IMINENTE';ui.warning.classList.add('show');warningRing.visible=true;warningFill.visible=true;}
    else if(state.bossMode==='telegraph'){bVisual.rotation.x=THREE.MathUtils.damp(bVisual.rotation.x,-.17,5,dt);warningRing.scale.setScalar(1+Math.sin(t*17)*.09);warningFill.scale.setScalar(1+Math.sin(t*17)*.06);if(state.bossTimer<=0){state.bossMode='attack';state.bossTimer=.38;ui.warning.classList.remove('show');warningRing.visible=false;warningFill.visible=false;bVisual.rotation.x=.34;state.shake=.16;}}
    else if(state.bossMode==='attack'&&state.bossTimer<=0){const d=player.position.distanceTo(boss.position);if(d<3.05)damagePlayer(enraged?27:21);state.bossMode='recover';state.bossTimer=enraged?.78:1.16;bVisual.rotation.x=-.1;}
    else if(state.bossMode==='recover'){bVisual.rotation.x=THREE.MathUtils.damp(bVisual.rotation.x,0,3,dt);if(state.bossTimer<=0){state.bossMode='idle';state.bossTimer=enraged?1.05:1.65;}}
    else{bVisual.rotation.x=THREE.MathUtils.damp(bVisual.rotation.x,Math.sin(t*1.6)*.025,3,dt);}
    armParts[0].arm.rotation.z=THREE.MathUtils.damp(armParts[0].arm.rotation.z,.2,4,dt);armParts[1].arm.rotation.z=THREE.MathUtils.damp(armParts[1].arm.rotation.z,state.bossMode==='attack'?-.9:0,7,dt);
    bossAura.material=glow;bossAura.scale.setScalar(1+Math.sin(t*2.7)*.035);bossAura.rotation.z+=dt*.16;groundGlow.material.opacity=.19+Math.sin(t*2)*.035;
    updateHud();
  }else{player.visible=true;}
  if(messageTimer>0){messageTimer-=dt;if(messageTimer<=0)ui.message.classList.remove('show');}
  for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.userData.life-=dt;s.position.x+=s.userData.vx*dt;s.position.y+=s.userData.vy*dt;s.position.z+=s.userData.vz*dt;s.userData.vy-=4*dt;s.material.opacity=Math.max(0,s.userData.life);if(s.userData.life<=0){world.remove(s);s.geometry.dispose();s.material.dispose();sparks.splice(i,1);}}
  const target=new THREE.Vector3(player.position.x*.13,1.03,-.35);camera.lookAt(target);if(state.shake>0){state.shake=Math.max(0,state.shake-dt);camKick=state.shake*2.5;camera.position.x=(Math.random()-.5)*camKick;camera.position.y=(innerWidth/innerHeight<.8?8.6:7.2)+(Math.random()-.5)*camKick;}
  renderer.render(scene,camera);
}
tick();
