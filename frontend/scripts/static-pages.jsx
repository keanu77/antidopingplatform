// Render the same page components at build time; interactive state is client-only.
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import Learning from '../src/pages/Learning';
import EditorialPolicy from '../src/pages/EditorialPolicy';
import TUE from '../src/pages/TUE';
import TestingProcess from '../src/pages/TestingProcess';
import Resources from '../src/pages/Resources';
import News from '../src/pages/News';
import ADeL from '../src/pages/ADeL';
import Quiz from '../src/pages/Quiz';

const pages = { '/learning': Learning, '/editorial-policy': EditorialPolicy, '/tue': TUE,
  '/testing-process': TestingProcess, '/resources': Resources, '/news': News, '/adel': ADeL, '/quiz': Quiz };
export function staticPage(path) {
  const Page = pages[path];
  return Page ? renderToString(<MemoryRouter initialEntries={[path]}><main id="main-content" className="max-w-7xl mx-auto p-6"><Page /></main></MemoryRouter>) : null;
}
