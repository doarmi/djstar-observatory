type Props = {
  index:string
  title:string
  description:string
  hero?:boolean
}

export default function SectionPlaceholder({index,title,description,hero=false}:Props){
  return (
    <section id={index==='01' ? 'top' : undefined} className={`wire-section ${hero ? 'hero' : ''}`}>
      <div className="container">
        <span className="section-index">{index}</span>
        <div className="wire-box">
          <p className="eyebrow">{title}</p>
          <h2>{description}</h2>
          <p className="note">현재는 디자인보다 섹션 크기·간격·정보 우선순위를 확인하는 와이어프레임 단계입니다.</p>
        </div>
      </div>
    </section>
  )
}
