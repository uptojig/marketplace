import { Star } from 'lucide-react';

interface Props {
  storeSlug: string;
}

const REVIEWS = [
  {
    name: 'พลอย',
    rating: 5,
    text: 'เคสสวยมาก สีตรงปก ส่งไว แพ็คดีไม่บุบเลย จะกลับมาซื้ออีกแน่นอนค่ะ',
  },
  {
    name: 'มิ้นท์',
    rating: 5,
    text: 'ใส่แล้วน่ารักมาก กันกระแทกได้จริง ปุ่มกดยังลื่นปกติ ตอบแชทไวด้วยค่ะ',
  },
  {
    name: 'จูน',
    rating: 5,
    text: 'สีจริงสวยกว่ารูปอีก งานเนี้ยบมาก เพื่อนถามว่าซื้อที่ไหน ราคาดีงาม',
  },
];

export function CaseStudioCustomPromo({ storeSlug }: Props) {
  return (
    <section className="px-4 sm:px-6 py-20" style={{ background: '#FFFFFF' }}>
      <div className="mx-auto" style={{ maxWidth: '1280px' }}>
        <div
          className="relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, #0A0A0F 0%, #1F2937 100%)',
            borderRadius: '20px',
            padding: 'clamp(40px, 6vw, 60px) clamp(28px, 5vw, 56px)',
            color: '#FFFFFF',
          }}
        >
          {/* Coral radial bleed (bottom-right) */}
          <span
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              right: -100,
              bottom: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255,51,102,0.3) 0%, transparent 60%)',
            }}
          />

          <div className="relative">
            <div className="text-center mb-12">
              <p
                className="font-bold uppercase mb-4"
                style={{
                  fontSize: '11px',
                  letterSpacing: '2.5px',
                  color: '#FF3366',
                }}
              >
                Customer Reviews
              </p>
              <h2
                style={{
                  fontSize: 'clamp(32px, 5vw, 44px)',
                  fontWeight: 900,
                  letterSpacing: '-1.5px',
                  lineHeight: 1.1,
                }}
              >
                ลูกค้าพูดถึงเรา
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {REVIEWS.map((r, i) => (
                <div
                  key={i}
                  className="relative p-6 sm:p-8 flex flex-col"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div className="flex gap-1 mb-4" style={{ color: '#FF3366' }}>
                    {Array.from({ length: r.rating }).map((_, k) => (
                      <Star key={k} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p
                    className="mb-6 flex-1"
                    style={{
                      fontSize: '15px',
                      opacity: 0.9,
                      lineHeight: 1.6,
                    }}
                  >
                    "{r.text}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div
                      className="flex items-center justify-center font-bold text-lg"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#FF3366',
                        color: '#FFFFFF',
                      }}
                    >
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>คุณ {r.name}</div>
                      <div style={{ fontSize: '12px', opacity: 0.6 }}>Verified Buyer</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
