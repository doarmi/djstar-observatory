import { Canvas, useFrame } from '@react-three/fiber'
import { AdditiveBlending, CanvasTexture, MathUtils, Points, SRGBColorSpace } from 'three'
import { useMemo, useRef } from 'react'

type Phase = 'idle' | 'focus' | 'warp' | 'map'

function makeLabelTexture(text: string, accent = '#dcecff') {
  const canvas = document.createElement('canvas'); canvas.width=512; canvas.height=128
  const ctx=canvas.getContext('2d')!
  ctx.clearRect(0,0,512,128)
  ctx.font='600 38px Arial, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'
  ctx.shadowColor=accent; ctx.shadowBlur=16; ctx.fillStyle='#f7fbff'; ctx.fillText(text,256,52)
  ctx.font='500 18px Arial, sans-serif'; ctx.shadowBlur=8; ctx.fillStyle=accent; ctx.fillText('CELESTIAL OBJECT',256,94)
  const tex=new CanvasTexture(canvas); tex.colorSpace=SRGBColorSpace; return tex
}

function Label({ text, position, color }: { text:string; position:[number,number,number]; color:string }) {
  const texture=useMemo(()=>makeLabelTexture(text,color),[text,color])
  return <sprite position={position} scale={[1.25,.31,1]}><spriteMaterial map={texture} transparent depthWrite={false} opacity={.92}/></sprite>
}

function Stars({ phase, color, count, size, opacity, spread }: { phase: Phase; color: string; count: number; size: number; opacity: number; spread: number }) {
  const ref=useRef<Points>(null)
  const positions=useMemo(()=>{const data=new Float32Array(count*3);for(let i=0;i<count;i++){data[i*3]=(Math.random()-.5)*spread;data[i*3+1]=(Math.random()-.5)*spread*.62;data[i*3+2]=-Math.random()*24+4}return data},[count,spread])
  useFrame((state,delta)=>{if(!ref.current)return;const speed=phase==='warp'?5.8:phase==='focus'?.35:.025;ref.current.position.z+=delta*speed;if(ref.current.position.z>11)ref.current.position.z=0;ref.current.rotation.x=MathUtils.lerp(ref.current.rotation.x,state.pointer.y*.018,.025);ref.current.rotation.y=MathUtils.lerp(ref.current.rotation.y,state.pointer.x*.024,.025)})
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial color={color} size={phase==='warp'?size*1.55:size} transparent opacity={opacity} sizeAttenuation depthWrite={false}/></points>
}

function Orbit({radius,tilt=0,color,opacity}:{radius:number;tilt?:number;color:string;opacity:number}){return <mesh rotation={[Math.PI/2+tilt,0,0]}><ringGeometry args={[radius-.009,radius+.009,160]}/><meshBasicMaterial color={color} transparent opacity={opacity} side={2} blending={AdditiveBlending} depthWrite={false}/></mesh>}

function SpaceMap({active}:{active:boolean}){
  const group=useRef<any>(null)
  useFrame((_,delta)=>{if(!group.current)return;group.current.rotation.y+=delta*.026;const target=active?1:.001;group.current.scale.x=MathUtils.lerp(group.current.scale.x,target,.055);group.current.scale.y=MathUtils.lerp(group.current.scale.y,target,.055);group.current.scale.z=MathUtils.lerp(group.current.scale.z,target,.055)})
  return <group ref={group} scale={.001} rotation={[.18,-.3,0]}>
    <Orbit radius={1.25} tilt={.06} color="#35c7ff" opacity={.9}/><Orbit radius={2} tilt={-.12} color="#6578ff" opacity={.72}/><Orbit radius={2.75} tilt={.18} color="#bf55ff" opacity={.52}/>
    <mesh scale={2.3}><sphereGeometry args={[.16,40,40]}/><meshBasicMaterial color="#398cff" transparent opacity={.13} blending={AdditiveBlending} depthWrite={false}/></mesh>
    <mesh><sphereGeometry args={[.16,64,64]}/><meshStandardMaterial color="#f7fbff" emissive="#4a92ff" emissiveIntensity={2.8} roughness={.2}/></mesh><pointLight intensity={5.5} distance={8} color="#539cff"/>

    <group position={[1.15,.18,.15]}><mesh><sphereGeometry args={[.09,40,40]}/><meshStandardMaterial color="#45c5ff" emissive="#0876a9" emissiveIntensity={.45} roughness={.45}/></mesh><Label text="VEGA" position={[0,.3,0]} color="#65d9ff"/></group>
    <group position={[-1.65,-.22,.45]}><mesh><sphereGeometry args={[.13,40,40]}/><meshStandardMaterial color="#ff7a32" emissive="#8a2200" emissiveIntensity={.28} roughness={.5}/></mesh><Label text="JUPITER" position={[0,.34,0]} color="#ffad75"/></group>
    <group position={[2.25,.34,-.3]} rotation={[.4,.2,.3]}><mesh><sphereGeometry args={[.15,48,48]}/><meshStandardMaterial color="#e7bd68" emissive="#6d4014" emissiveIntensity={.25} roughness={.58}/></mesh><mesh rotation={[1.2,.1,.25]}><ringGeometry args={[.21,.34,128]}/><meshStandardMaterial color="#dec089" transparent opacity={.92} side={2}/></mesh><Label text="SATURN" position={[0,.42,0]} color="#ffd894"/></group>
    <group position={[-2.15,.62,-.35]}><mesh><sphereGeometry args={[.082,32,32]}/><meshBasicMaterial color="#dc79ff"/></mesh><Label text="MOON" position={[0,.28,0]} color="#e2b2ff"/></group>
    <mesh position={[.38,-1.48,.3]}><sphereGeometry args={[.06,28,28]}/><meshBasicMaterial color="#65f0ff"/></mesh>
    {[[.55,.75,.2],[-.8,.9,-.3],[1.8,-.65,.2],[-2.2,.55,-.2],[.3,-1.5,.4]].map((p,i)=><mesh position={p as [number,number,number]} key={i}><sphereGeometry args={[.026,12,12]}/><meshBasicMaterial color={i%2?'#ffd49c':'#ffffff'}/></mesh>)}
  </group>
}

export default function IntroStarfield({phase='idle'}:{phase?:Phase}){return <div className={`intro-three phase-${phase}`} aria-hidden="true"><Canvas camera={{position:[0,0,4.2],fov:55}} dpr={[1.5,2.5]} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}}><color attach="background" args={["#01040d"]}/><ambientLight intensity={.78}/><directionalLight position={[3,4,5]} intensity={2.3} color="#fff0d8"/><pointLight position={[-3,-1,2]} intensity={1.25} color="#4c86ff"/><Stars phase={phase} color="#dce8ff" count={1250} size={.029} opacity={.86} spread={20}/><Stars phase={phase} color="#ffd596" count={220} size={.022} opacity={.7} spread={18}/><Stars phase={phase} color="#b777ff" count={160} size={.019} opacity={.6} spread={16}/><SpaceMap active={phase==='map'}/></Canvas></div>}
