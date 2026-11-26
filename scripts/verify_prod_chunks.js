async function verifyProd() {
  const r = await fetch('https://careers-page-tbm.vercel.app/');
  const html = await r.text();
  const chunks = [...new Set(html.match(/\/_next\/static\/chunks\/[^"'\s>]+\.js/g) || [])];
  console.log('Total chunks:', chunks.length);

  let found = false;
  for (const c of chunks) {
    const jr = await fetch('https://careers-page-tbm.vercel.app/_next/' + c);
    const js = await jr.text();
    if (js.includes('weird.') || js.includes('oops-badge')) {
      console.log('FOUND in production chunk:', c);
      found = true;
      break;
    }
  }
  console.log('Production verified:', found);
}

verifyProd().catch(console.error);
