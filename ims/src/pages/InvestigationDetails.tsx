import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { PatientInfo, uploadFile } from '../api/Patientinfo';

const SECTIONS = ['pre', 'mid', 'post', 'follow-up'] as const;
type Section = (typeof SECTIONS)[number];

const slugToKey = (slug: string) => {
  // map common slugs to base keys used in patient details
  const map: Record<string, string> = {
    'study-model': 'studyModel',
    photographs: 'photographs',
    opg: 'opg',
    'lateral-cephalogram': 'lateralCephalogram',
    'pa-cephalogram': 'paCephalogram',
    cbct: 'cbct',
    iopa: 'iopa',
    'other-records': 'anyOtherRecord',
  };
  return map[slug] ?? slug.replace(/-/g, '_');
};

export default function InvestigationDetails() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const q = new URLSearchParams(location.search);
  const patid = q.get('patid') || '';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [sectionImages, setSectionImages] = useState<Record<string, string[]>>({});
  const [preview, setPreview] = useState<{ url: string; open: boolean } | null>(null);

  const baseKey = slug ? slugToKey(slug) : '';

  useEffect(() => {
    if (!patid) {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const patient = await PatientInfo(patid);
        setData(patient?.details ?? null);

        // Attempt to load per-section arrays using naming convention: `${baseKey}_${section}Urls`
        const initial: Record<string, string[]> = {};
        for (const s of SECTIONS) {
          const prop = `${baseKey}${s === 'follow-up' ? 'FollowUp' : s.charAt(0).toUpperCase() + s.slice(1)}Urls`;
          // try camel or snake
          const v = (patient?.details as any)?.[prop] ?? (patient?.details as any)?.[`${baseKey}_${s}Urls`] ?? null;
          if (Array.isArray(v)) initial[s] = v.filter(Boolean);
          else initial[s] = [];
        }
        setSectionImages(initial);
      } catch (err) {
        console.error('failed load patient', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patid, baseKey]);

  const handleUpload = async (section: Section, files: FileList | null) => {
    if (!files || !patid || !slug) return;
    const arr = Array.from(files);
    try {
      for (const f of arr) {
        // uploadFile(file, patid, key)
        const key = `${baseKey}_${section}`; // server-side handler may use this
        const res = await uploadFile(f, patid, key);
        if (res && (res as any).pluralArray) {
          setSectionImages((prev) => ({ ...prev, [section]: (res as any).pluralArray.filter(Boolean) }));
        } else if (res && (res as any).url) {
          setSectionImages((prev) => ({ ...prev, [section]: [...(prev[section] || []), (res as any).url] }));
        }
      }
    } catch (err) {
      console.error('upload', err);
      alert('Upload failed');
    }
  };

  if (loading) return <Layout><div className="p-6">Loading...</div></Layout>;
  if (!slug) return <Layout><div className="p-6">Invalid investigation</div></Layout>;

  const title = String(slug).split('-').map(s => s[0].toUpperCase()+s.slice(1)).join(' ');

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <div className="text-sm text-gray-600">Patient: {data?.name ?? '—'}</div>
        </div>

        <div className="grid gap-6">
          {SECTIONS.map((sec) => (
            <div key={sec} className="bg-white rounded-md shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-gray-800">{sec.toUpperCase()}</div>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <span className="px-3 py-1 bg-cyan-600 text-white rounded text-sm">Upload</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(sec, e.target.files)} />
                </label>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {(sectionImages[sec] || []).length === 0 ? (
                  <div className="col-span-full text-gray-500">No images uploaded for this section.</div>
                ) : (
                  (sectionImages[sec] || []).map((u, idx) => (
                    <button key={u + idx} onClick={() => setPreview({ url: u, open: true })} className="w-full h-24 bg-gray-100 rounded overflow-hidden">
                      <img src={u} alt={`${sec} ${idx+1}`} className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=No+Image'; }} />
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {preview?.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="max-w-3xl w-full p-4">
              <div className="bg-white rounded shadow-lg overflow-hidden">
                <div className="p-2 text-right"><button onClick={() => setPreview(null)} className="px-3 py-1">Close</button></div>
                <div className="p-4"><img src={preview.url} alt="preview" className="w-full object-contain max-h-[70vh]" /></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
