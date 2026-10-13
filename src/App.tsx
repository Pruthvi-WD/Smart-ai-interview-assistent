/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import InterviewRoom from "@/pages/InterviewRoom";
import ReportPage from "@/pages/ReportPage";
import HistoryPage from "@/pages/HistoryPage";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/interview/:id" element={<InterviewRoom />} />
            <Route path="/report/:id" element={<ReportPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

