import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AboutPage from './app/stores/[slug]/about/page';

async function test() {
  const html = await AboutPage({ params: { slug: 'fastfive' } });
  console.log(html);
}
test();
