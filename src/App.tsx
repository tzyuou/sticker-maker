/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Home from './components/Home';
import Generate from './components/Generate';
import RemoveBackground from './components/RemoveBackground';
import Split from './components/Split';
import Rename from './components/Rename';
import Complete from './components/Complete';
import Layout from './components/Layout';

export type Page = 'home' | 'generate' | 'remove-bg' | 'split' | 'rename' | 'complete';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={setCurrentPage} />;
      case 'generate': return <Generate onNavigate={setCurrentPage} />;
      case 'remove-bg': return <RemoveBackground onNavigate={setCurrentPage} />;
      case 'split': return <Split onNavigate={setCurrentPage} />;
      case 'rename': return <Rename onNavigate={setCurrentPage} />;
      case 'complete': return <Complete onNavigate={setCurrentPage} />;
      default: return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
