import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const maxImageSize = 5 * 1024 * 1024;
const allowedImages = ['image/jpeg', 'image/png', 'image/webp'];
export default function Submit() {
  const {siteConfig} = useDocusaurusContext();
  const endpoint = String(siteConfig.customFields?.contributionApiUrl || '');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!image) { setPreview(''); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!image) { setMessage('请选择餐厅照片。'); return; }
    const data = new FormData(event.currentTarget);
    const payload = {
      schemaVersion: 1,
      name: String(data.get('name')).trim(),
      category: String(data.get('category')),
      location: String(data.get('location')).trim(),
      taste: String(data.get('taste')).trim(),
      openingHours: String(data.get('openingHours')).trim(),
      visitedAt: String(data.get('visitedAt')),
      imageFilename: image.name,
    };
    if (!payload.name || !payload.location || !payload.taste || !payload.openingHours) {
      setMessage('请填写名称、位置、口感和营业时间；未知营业时间可填“待补充”。'); return;
    }
    if (!endpoint) {
      const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'}));
      const link = document.createElement('a');
      link.href = url; link.download = 'restaurant-submission.json'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage('草稿已导出。尚未上传，请保留原始照片，与草稿一起交给维护者。');
      return;
    }
    setBusy(true); setMessage('正在上传…');
    try {
      const body = new FormData();
      body.set('metadata', JSON.stringify(payload)); body.set('image', image);
      const response = await fetch(endpoint, {method: 'POST', body, signal: AbortSignal.timeout(30000)});
      if (response.status !== 202) throw new Error('投稿未被接收');
      setMessage('投稿已接收，等待审核。审核通过后才会公开显示。');
    } catch {
      setMessage('上传未成功或结果未确认，请稍后核实再重试。表单内容已保留。');
    } finally { setBusy(false); }
  }
  return <Layout title="提交餐厅"><main className="container margin-vert--lg">
    <h1>分享一家餐厅</h1>
    <p>请提供真实体验和有权分享的照片。投稿经审核后公开。</p>
    {!endpoint && <p className="alert alert--info">在线投稿暂未开放。你可以选择照片预览，并导出信息草稿；照片和内容不会自动上传。</p>}
    <noscript><p>照片预览和投稿需要启用 JavaScript。</p></noscript>
    <form className="submission-form" onSubmit={submit}>
      <label>餐厅名称<input required maxLength={100} name="name" /></label>
      <label>就餐范围<select name="category"><option value="on-campus">校内</option><option value="off-campus">校外</option></select></label>
      <label>位置<input required maxLength={300} name="location" /></label>
      <label>口感描述<textarea required maxLength={2000} name="taste" /></label>
      <label>营业时间<input required maxLength={200} name="openingHours" placeholder="未知可填：待补充" /></label>
      <label>用餐日期<input type="date" required name="visitedAt" /></label>
      <label>餐厅照片（JPG / PNG / WebP，最大 5 MB）<input type="file" required accept="image/jpeg,image/png,image/webp" name="image" onChange={event => {
        const file = event.target.files?.[0];
        if (file && (!allowedImages.includes(file.type) || file.size > maxImageSize)) {
          setImage(null); event.target.value = ''; setMessage('请选择不超过 5 MB 的 JPG、PNG 或 WebP 图片。');
        } else { setImage(file || null); setMessage(''); }
      }} /></label>
      {preview && <img className="submission-preview" src={preview} alt="所选餐厅照片预览" />}
      <label><input type="checkbox" required /> 我有权分享这些内容，并同意以本站 CC BY-NC-SA 4.0 许可公开。</label>
      <button className="button button--primary" type="submit" disabled={busy}>{busy ? '上传中…' : endpoint ? '提交审核' : '导出信息草稿'}</button>
      <p role="status" aria-live="polite">{message}</p>
    </form>
  </main></Layout>;
}
