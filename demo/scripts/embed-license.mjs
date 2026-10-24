import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const license=readFileSync(new URL('node_modules/pdfjs-dist/LICENSE',root),'utf8');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const target=new URL('dist/index.html',root);
writeFileSync(target,readFileSync(target,'utf8').replace('</head>',`<template data-license="pdfjs-dist Apache-2.0">${escape(license)}</template></head>`));
console.log('Embedded PDF.js license in standalone HTML.');
